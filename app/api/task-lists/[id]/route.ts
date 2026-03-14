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
        if (!user) throw new ApiError("Unauthorized", 401);

        const { id } = await params;
        const listId = parseInt(id);

        // Check if user is admin
        const userRoles = await prisma.userroles.findMany({
            where: { UserID: user.userId },
            include: { roles: true }
        });
        const isAdmin = userRoles.some(ur => ur.roles?.RoleName === "Admin");

        if (!isAdmin) {
            throw new ApiError("Forbidden: Only admins can perform this action", 403);
        }

        await prisma.$transaction(async (tx) => {
            // Find all tasks in this list
            const tasks = await tx.tasks.findMany({
                where: { ListID: listId },
                select: { TaskID: true }
            });
            const taskIds = tasks.map(t => t.TaskID);

            if (taskIds.length > 0) {
                // Delete dependencies for all tasks in the list
                await tx.taskcomments.deleteMany({ where: { TaskID: { in: taskIds } } });
                await tx.taskhistory.deleteMany({ where: { TaskID: { in: taskIds } } });
                await tx.taskattachments.deleteMany({ where: { TaskID: { in: taskIds } } });
                // Delete the tasks themselves
                await tx.tasks.deleteMany({ where: { ListID: listId } });
            }

            // Finally delete the list
            await tx.tasklists.delete({
                where: { ListID: listId }
            });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE task list error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new ApiError("Unauthorized", 401);

        const { id } = await params;
        const listId = parseInt(id);

        // Check if user is admin
        const userRoles = await prisma.userroles.findMany({
            where: { UserID: user.userId },
            include: { roles: true }
        });
        const isAdmin = userRoles.some(ur => ur.roles?.RoleName === "Admin");

        if (!isAdmin) {
            throw new ApiError("Forbidden: Only admins can update task lists", 403);
        }

        const body = await request.json();
        const { name } = body;

        const updatedList = await prisma.tasklists.update({
            where: { ListID: listId },
            data: {
                ListName: name
            }
        });

        return NextResponse.json(updatedList);
    } catch (error) {
        console.error("PATCH task list error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
