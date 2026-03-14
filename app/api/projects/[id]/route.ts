import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { handleApiError, ApiError } from "@/lib/api-utils";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new ApiError("Unauthorized", 401);

        const { id } = await params;
        const projectId = parseInt(id);
        if (isNaN(projectId)) throw new ApiError("Invalid Project ID", 400);

        const project = await prisma.projects.findUnique({
            where: { ProjectID: projectId },
            include: {
                tasklists: {
                    include: {
                        tasks: {
                            include: {
                                _count: {
                                    select: { taskcomments: true }
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: { project_members: true }
                }
            }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        return NextResponse.json(project);
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
        if (!user) throw new ApiError("Unauthorized", 401);

        const { id } = await params;
        const projectId = parseInt(id);
        if (isNaN(projectId)) throw new ApiError("Invalid Project ID", 400);

        // Check if user is admin
        const userRoles = await prisma.userroles.findMany({
            where: { UserID: user.userId },
            include: { roles: true }
        });
        const isAdmin = userRoles.some(ur => ur.roles?.RoleName === "Admin");

        if (!isAdmin) {
            throw new ApiError("Forbidden: Only admins can update projects", 403);
        }

        const body = await request.json();
        const { name, description, completionDate } = body;

        const updatedProject = await prisma.projects.update({
            where: { ProjectID: projectId },
            data: {
                ProjectName: name,
                Description: description,
                CompletionDate: completionDate ? new Date(completionDate) : undefined,
            }
        });

        return NextResponse.json(updatedProject);
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
        const projectId = parseInt(id);
        if (isNaN(projectId)) throw new ApiError("Invalid Project ID", 400);

        const project = await prisma.projects.findUnique({
            where: { ProjectID: projectId }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }
        const currentUserRoles = await prisma.userroles.findMany({
            where: { UserID: user.userId },
            include: { roles: true }
        });

        const isAdmin = currentUserRoles.some(ur => ur.roles?.RoleName === "Admin");
        const isCreator = project.CreatedBy === user.userId;

        if (!isAdmin && !isCreator) {
            return NextResponse.json({ error: "Forbidden: Only creator or admin can delete" }, { status: 403 });
        }

        await prisma.$transaction(async (tx) => {
            // Find all task lists for this project
            const lists = await tx.tasklists.findMany({
                where: { ProjectID: projectId },
                select: { ListID: true }
            });
            const listIds = lists.map(l => l.ListID);

            if (listIds.length > 0) {
                // Find all tasks in these lists
                const tasks = await tx.tasks.findMany({
                    where: { ListID: { in: listIds } },
                    select: { TaskID: true }
                });
                const taskIds = tasks.map(t => t.TaskID);

                if (taskIds.length > 0) {
                    // Delete all task-related dependencies
                    await tx.taskcomments.deleteMany({ where: { TaskID: { in: taskIds } } });
                    await tx.taskhistory.deleteMany({ where: { TaskID: { in: taskIds } } });
                    await tx.taskattachments.deleteMany({ where: { TaskID: { in: taskIds } } });
                    // Delete the tasks
                    await tx.tasks.deleteMany({ where: { ListID: { in: listIds } } });
                }
                // Delete the task lists
                await tx.tasklists.deleteMany({ where: { ProjectID: projectId } });
            }

            // Finally delete the project
            // project_members will be deleted automatically due to Cascade in Prisma/DB
            await tx.projects.delete({
                where: { ProjectID: projectId }
            });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
