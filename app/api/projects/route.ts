import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { handleApiError, ApiError } from "@/lib/api-utils";

const projectSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    description: z.string().optional(),
    completionDate: z.string().min(1, "Project completion date is mandatory"),
});

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Check if user is admin
        const userRoles = await prisma.userroles.findMany({
            where: { UserID: user.userId },
            include: { roles: true }
        });
        const isAdmin = userRoles.some(ur => ur.roles?.RoleName === "Admin");

        let projects;
        if (isAdmin) {
            // Admin sees ALL projects
            projects = await prisma.projects.findMany({
                include: {
                    tasklists: {
                        select: {
                            ListID: true,
                            ListName: true,
                            ProjectID: true
                        }
                    },
                    users: {
                        select: {
                            UserName: true
                        }
                    },
                    _count: {
                        select: { project_members: true }
                    }
                },
                orderBy: { CreatedAt: 'desc' }
            });
        } else {
            // Fetch projects created by user OR where user is a member
            projects = await prisma.projects.findMany({
                where: {
                    OR: [
                        { CreatedBy: user.userId },
                        {
                            project_members: {
                                some: { UserID: user.userId }
                            }
                        }
                    ]
                },
                include: {
                    tasklists: {
                        select: {
                            ListID: true,
                            ListName: true,
                            ProjectID: true
                        }
                    },
                    users: {
                        select: {
                            UserName: true
                        }
                    },
                    _count: {
                        select: { project_members: true }
                    }
                },
                orderBy: { CreatedAt: 'desc' }
            });
        }

        return NextResponse.json(projects);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new ApiError("Unauthorized", 401);

        // Check if user is admin
        const userRoles = await prisma.userroles.findMany({
            where: { UserID: user.userId },
            include: { roles: true }
        });
        const isAdmin = userRoles.some(ur => ur.roles?.RoleName === "Admin");

        if (!isAdmin) {
            throw new ApiError("Forbidden: Only admins can create projects", 403);
        }

        const body = await request.json();
        const { name, description, completionDate } = projectSchema.parse(body);

        const projectDate = new Date(completionDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (projectDate < today) {
            throw new ApiError("Project completion date must be in the future", 400);
        }

        // Create project and a default task list in a transaction
        const project = await prisma.$transaction(async (tx) => {
            const newProject = await tx.projects.create({
                data: {
                    ProjectName: name,
                    Description: description,
                    CompletionDate: completionDate ? new Date(completionDate) : null,
                    CreatedBy: user.userId,
                }
            });

            // Create default task list
            await tx.tasklists.create({
                data: {
                    ProjectID: newProject.ProjectID,
                    ListName: "General"
                }
            });

            return newProject;
        });

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
