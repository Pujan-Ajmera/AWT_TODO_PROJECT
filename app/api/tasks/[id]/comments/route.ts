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
        const taskId = parseInt(id);

        const comments = await prisma.taskcomments.findMany({
            where: { TaskID: taskId },
            include: {
                users: {
                    select: {
                        UserName: true,
                        Email: true
                    }
                }
            },
            orderBy: { CreatedAt: "desc" }
        });

        return NextResponse.json(comments);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new ApiError("Unauthorized", 401);

        const { id } = await params;
        const taskId = parseInt(id);
        const { content } = await request.json();

        if (!content) throw new ApiError("Comment content is required", 400);

        const comment = await prisma.taskcomments.create({
            data: {
                TaskID: taskId,
                UserID: user.userId,
                CommentText: content,
            },
            include: {
                users: {
                    select: {
                        UserName: true,
                        Email: true
                    }
                }
            }
        });

        // Log history
        await prisma.taskhistory.create({
            data: {
                TaskID: taskId,
                ChangedBy: user.userId,
                ChangeType: "Comment added",
            }
        });

        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
