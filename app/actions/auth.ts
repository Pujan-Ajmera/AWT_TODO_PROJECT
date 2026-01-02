"use server";

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email and password are required" };
    }

    try {
        const user = await prisma.users.findUnique({
            where: { Email: email }
        });

        if (!user || user.PasswordHash !== password) { // In a real app, use bcrypt to compare hashes
            return { error: "Invalid email or password" };
        }

        // Set session cookie
        const cookieStore = await cookies();
        cookieStore.set("user_session", JSON.stringify({
            userId: user.UserID,
            email: user.Email,
            name: user.UserName
        }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: "/"
        });

    } catch (error) {
        console.error("Login error:", error);
        return { error: "An unexpected error occurred" };
    }

    redirect("/home"); // Redirect to dashboard
}

export async function registerAction(prevState: any, formData: FormData) {
    const firstName = formData.get("first-name") as string;
    const lastName = formData.get("last-name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password || !firstName) {
        return { error: "Missing required fields" };
    }

    try {
        const existingUser = await prisma.users.findUnique({
            where: { Email: email }
        });

        if (existingUser) {
            return { error: "Email already in use" };
        }

        const newUser = await prisma.users.create({
            data: {
                UserName: `${firstName} ${lastName}`.trim(),
                Email: email,
                PasswordHash: password, // In a real app, hash the password
            }
        });

        // Set session cookie
        const cookieStore = await cookies();
        cookieStore.set("user_session", JSON.stringify({
            userId: newUser.UserID,
            email: newUser.Email,
            name: newUser.UserName
        }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: "/"
        });

    } catch (error) {
        console.error("Registration error:", error);
        return { error: "An unexpected error occurred" };
    }

    redirect("/home");
}
