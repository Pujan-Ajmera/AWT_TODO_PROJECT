import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        // Check if current user is an admin
        const currentUserRoles = await prisma.userroles.findMany({
            where: { UserID: user?.userId },
            include: { roles: true }
        });

        const isAdmin = currentUserRoles.some(ur => ur.roles?.RoleName === "Admin");
        if (!user || !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const targetUserId = parseInt(params.id);
        if (targetUserId === user.userId) {
            return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
        }

        await prisma.userroles.deleteMany({ where: { UserID: targetUserId } });
        await prisma.tasks.deleteMany({ where: { AssignedTo: targetUserId } });
        await prisma.users.delete({ where: { UserID: targetUserId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE user error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
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

        const targetUserId = parseInt(params.id);
        const body = await request.json();
        const { name, email, roleId } = body;

        const updatedUser = await prisma.users.update({
            where: { UserID: targetUserId },
            data: {
                UserName: name,
                Email: email,
            }
        });

        if (roleId) {
            await prisma.userroles.deleteMany({ where: { UserID: targetUserId } });
            await prisma.userroles.create({
                data: {
                    UserID: targetUserId,
                    RoleID: parseInt(roleId),
                }
            });
        }

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("PATCH user error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
