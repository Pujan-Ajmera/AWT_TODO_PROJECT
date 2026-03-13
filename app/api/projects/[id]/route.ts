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
                                taskcomments: {
                                    include: {
                                        users: {
                                            select: {
                                                UserID: true,
                                                UserName: true
                                            }
                                        }
                                    }
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
        const body = await request.json();
        const { name, description } = body;

        const updatedProject = await prisma.projects.update({
            where: { ProjectID: projectId },
            data: {
                ProjectName: name,
                Description: description,
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

        await prisma.projects.delete({
            where: { ProjectID: projectId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
