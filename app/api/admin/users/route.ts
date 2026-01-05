import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        const currentUserRoles = await prisma.userroles.findMany({
            where: { UserID: user?.userId },
            include: { roles: true }
        });

        const isAdmin = currentUserRoles.some(ur => ur.roles?.RoleName === "Admin");
        if (!user || !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, email, roleId, password } = body;

        if (!name || !email || !roleId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newUser = await prisma.users.create({
            data: {
                UserName: name,
                Email: email,
                PasswordHash: password || "password123", // Default password
            }
        });

        await prisma.userroles.create({
            data: {
                UserID: newUser.UserID,
                RoleID: parseInt(roleId),
            }
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error("POST user error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
