import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { handleApiError, ApiError } from "@/lib/api-utils";
import { z } from "zod";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new ApiError("Unauthorized", 401);

        const { id } = await params;
        const taskId = parseInt(id);

        const task = await prisma.tasks.findUnique({
            where: { TaskID: taskId },
            include: {
                taskcomments: {
                    include: {
                        users: {
                            select: {
                                UserID: true,
                                UserName: true
                            }
                        }
                    }
                },
                taskhistory: {
                    include: {
                        users: {
                            select: {
                                UserID: true,
                                UserName: true
                            }
                        }
                    },
                    orderBy: {
                        ChangeTime: 'desc'
                    }
                }
            }
        });

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        return NextResponse.json(task);
    } catch (error) {
        console.error("GET task error:", error);
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
        const taskId = parseInt(id);

        // Check if user is admin
        const userRoles = await prisma.userroles.findMany({
            where: { UserID: user.userId },
            include: { roles: true }
        });
        const isAdmin = userRoles.some(ur => ur.roles?.RoleName === "Admin");

        if (!isAdmin) {
            throw new ApiError("Forbidden: Only admins can update tasks", 403);
        }

        const taskSchema = z.object({
            title: z.string().min(1, "Title is required").optional(),
            description: z.string().optional(),
            priority: z.enum(["Low", "Medium", "High"]).optional(),
            status: z.enum(["Pending", "In Progress", "Completed"]).optional(),
            dueDate: z.string().min(1, "Due date is mandatory").optional(), // Optional on update, but if provided must be non-empty. Wait, if it's already mandatory on create, we should keep it.
            listId: z.number().int().positive().optional(),
        });

        const body = await request.json();
        const validatedData = taskSchema.parse(body);
        const { title, description, priority, status, dueDate, listId } = validatedData;

        // Validate Due Date against Project Completion Date
        if (dueDate) {
            const currentTask = await prisma.tasks.findUnique({
                where: { TaskID: taskId },
                include: {
                    tasklists: {
                        include: { projects: true }
                    }
                }
            });

            const project = currentTask?.tasklists?.projects;
            if (project?.CompletionDate) {
                const projectDueDate = new Date(project.CompletionDate);
                const taskDueDate = new Date(dueDate);

                if (taskDueDate > projectDueDate) {
                    throw new ApiError(`Task due date cannot be later than project completion date (${projectDueDate.toLocaleDateString()})`, 400);
                }
            }
        }

        const updatedTask = await prisma.tasks.update({
            where: { TaskID: taskId },
            data: {
                Title: title,
                Description: description,
                Priority: priority,
                Status: status,
                DueDate: dueDate ? new Date(dueDate) : undefined,
                ListID: listId || undefined,
            }
        });

        // Activity Logging
        const activities = [];
        if (status) activities.push(`Status updated to ${status}`);
        if (title) activities.push(`Title updated to "${title}"`);
        if (priority) activities.push(`Priority updated to ${priority}`);
        if (description) activities.push(`Description updated`);
        if (dueDate) activities.push(`Due date updated to ${new Date(dueDate).toLocaleDateString()}`);

        if (activities.length > 0) {
            await prisma.taskhistory.createMany({
                data: activities.map(changeType => ({
                    TaskID: taskId,
                    ChangedBy: user.userId,
                    ChangeType: changeType,
                }))
            });
        }

        return NextResponse.json(updatedTask);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new ApiError("Unauthorized", 401);

        const { id } = await params;
        const taskId = parseInt(id);

        // Check if user is admin
        const userRoles = await prisma.userroles.findMany({
            where: { UserID: user.userId },
            include: { roles: true }
        });
        const isAdmin = userRoles.some(ur => ur.roles?.RoleName === "Admin");

        if (!isAdmin) {
            throw new ApiError("Forbidden: Only admins can delete tasks", 403);
        }

        await prisma.$transaction([
            prisma.taskcomments.deleteMany({ where: { TaskID: taskId } }),
            prisma.taskhistory.deleteMany({ where: { TaskID: taskId } }),
            prisma.taskattachments.deleteMany({ where: { TaskID: taskId } }),
            prisma.tasks.delete({ where: { TaskID: taskId } })
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
