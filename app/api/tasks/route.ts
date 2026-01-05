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
    dueDate: z.string().optional().nullable(),
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

        const where: any = {
            AssignedTo: user.userId,
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
        const data = taskSchema.parse(body);

        const task = await prisma.tasks.create({
            data: {
                Title: data.title,
                Description: data.description,
                Priority: data.priority || "Medium",
                Status: "Pending",
                ListID: data.listId,
                AssignedTo: user.userId,
                DueDate: data.dueDate ? new Date(data.dueDate) : null,
            }
        });

        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
