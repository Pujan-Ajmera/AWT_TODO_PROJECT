import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { handleApiError, ApiError } from "@/lib/api-utils";

const taskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    priority: z.enum(["Low", "Medium", "High"]).optional(),
    listId: z.number().optional(),
    projectId: z.number().min(1, "Project selection is mandatory"),
    dueDate: z.string().min(1, "Due date is mandatory"),
});

export async function GET(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new ApiError("Unauthorized", 401);

        const { searchParams } = new URL(request.url);
        const listId = searchParams.get("listId");
        const status = searchParams.get("status");
        const priority = searchParams.get("priority");
        const search = searchParams.get("search");

        // Check if user is admin
        const userRoles = await prisma.userroles.findMany({
            where: { UserID: user.userId },
            include: { roles: true }
        });
        const isAdmin = userRoles.some(ur => ur.roles?.RoleName === "Admin");

        const where: any = isAdmin ? {} : {
            tasklists: {
                projects: {
                    project_members: {
                        some: {
                            UserID: user.userId
                        }
                    }
                }
            }
        };

        if (listId) where.ListID = parseInt(listId);
        if (status) where.Status = status;
        if (priority) where.Priority = priority;
        if (search) {
            where.OR = [
                { Title: { contains: search } },
                { Description: { contains: search } }
            ];
        }

        const tasks = await prisma.tasks.findMany({
            where,
            include: {
                tasklists: true,
                users: {
                    select: { UserName: true }
                },
                _count: {
                    select: { taskcomments: true }
                }
            },
            orderBy: { CreatedAt: 'desc' }
        });

        return NextResponse.json(tasks);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new ApiError("Unauthorized", 401);

        const body = await request.json();
        const validatedData = taskSchema.parse(body);
        const { title, description, priority, projectId, dueDate } = validatedData;

        // Block past dates for creation
        if (dueDate) {
            const taskDate = new Date(dueDate);
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            if (taskDate < now) {
                return NextResponse.json({ error: "Due date cannot be in the past" }, { status: 400 });
            }
        }
        // Check if user is admin
        const userRoles = await prisma.userroles.findMany({
            where: { UserID: user.userId },
            include: { roles: true }
        });
        const isAdmin = userRoles.some(ur => ur.roles?.RoleName === "Admin");

        if (!isAdmin) {
            throw new ApiError("Forbidden: Only admins can create tasks", 403);
        }

        let listId = validatedData.listId;

        if (!listId && validatedData.projectId) {
            const generalList = await prisma.tasklists.findFirst({
                where: {
                    ProjectID: validatedData.projectId,
                    ListName: "General"
                }
            });

            if (!generalList) {
                const firstList = await prisma.tasklists.findFirst({
                    where: { ProjectID: validatedData.projectId }
                });
                if (!firstList) throw new ApiError("This project has no task lists", 400);
                listId = firstList.ListID;
            } else {
                listId = generalList.ListID;
            }
        }

        if (!listId) {
            throw new ApiError("Project or List selection is required", 400);
        }

        // Validate Due Date against Project Completion Date
        if (validatedData.dueDate) {
            const list = await prisma.tasklists.findUnique({
                where: { ListID: listId },
                include: { projects: true }
            });

            if (list?.projects?.CompletionDate) {
                const projectDueDate = new Date(list.projects.CompletionDate);
                const taskDueDate = new Date(validatedData.dueDate);

                if (taskDueDate > projectDueDate) {
                    throw new ApiError(`Task due date cannot be later than project completion date (${projectDueDate.toLocaleDateString()})`, 400);
                }
            }
        }

        const task = await prisma.tasks.create({
            data: {
                Title: validatedData.title,
                Description: validatedData.description,
                Priority: validatedData.priority || "Medium",
                Status: "Pending",
                ListID: listId,
                AssignedTo: user.userId,
                DueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
            }
        });

        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
