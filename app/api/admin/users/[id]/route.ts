import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { handleApiError, ApiError } from "@/lib/api-utils";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { id } = await params;
        const targetUserId = parseInt(id);
        if (targetUserId === user.userId) {
            return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
        }

        await prisma.userroles.deleteMany({ where: { UserID: targetUserId } });
        await prisma.tasks.deleteMany({ where: { AssignedTo: targetUserId } });
        await prisma.users.delete({ where: { UserID: targetUserId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { id } = await params;
        const targetUserId = parseInt(id);
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
        return handleApiError(error);
    }
}
