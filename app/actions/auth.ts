"use server";

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email and password are required", email };
    }

    try {
        const user = await prisma.users.findUnique({
            where: { Email: email },
            include: {
                userroles: {
                    include: { roles: true }
                }
            }
        });

        if (!user || user.PasswordHash !== password) {
            return { error: "Invalid email or password", email };
        }

        // Set session cookie
        const cookieStore = await cookies();
        cookieStore.set("user_session", JSON.stringify({
            userId: user.UserID,
            email: user.Email,
            name: user.UserName,
            roles: user.userroles.map(ur => ur.roles?.RoleName)
        }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: "/"
        });

    } catch (error) {
        console.error("Login error:", error);
        return { error: "An unexpected error occurred", email };
    }

    redirect("/"); // Redirect to dashboard
}

export async function registerAction(prevState: any, formData: FormData) {
    const firstName = formData.get("first-name") as string;
    const lastName = formData.get("last-name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password || !firstName) {
        return { error: "Missing required fields", firstName, lastName, email };
    }

    try {
        const existingUser = await prisma.users.findUnique({
            where: { Email: email }
        });

        if (existingUser) {
            return { error: "Email already in use", firstName, lastName, email };
        }

        const existingName = await prisma.users.findUnique({
            where: { UserName: `${firstName} ${lastName}`.trim() }
        });

        if (existingName) {
            return { error: "Username already taken. Please try adding a middle name or initial.", firstName, lastName, email };
        }

        // Check if this is the first user, if so, make them an admin
        const usersCount = await prisma.users.count();

        const newUser = await prisma.users.create({
            data: {
                UserName: `${firstName} ${lastName}`.trim(),
                Email: email,
                PasswordHash: password,
            }
        });

        // Assign "User" role by default, or "Admin" if first user
        const defaultRole = await prisma.roles.findFirst({
            where: { RoleName: usersCount === 0 ? "Admin" : "User" }
        });

        if (defaultRole) {
            await prisma.userroles.create({
                data: {
                    UserID: newUser.UserID,
                    RoleID: defaultRole.RoleID
                }
            });
        }

        // Set session cookie
        const cookieStore = await cookies();
        cookieStore.set("user_session", JSON.stringify({
            userId: newUser.UserID,
            email: newUser.Email,
            name: newUser.UserName,
            roles: [defaultRole?.RoleName || "User"]
        }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: "/"
        });

    } catch (error) {
        console.error("Registration error:", error);
        return { error: "An unexpected error occurred", firstName, lastName, email };
    }

    redirect("/");
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete("user_session");
    redirect("/");
}
