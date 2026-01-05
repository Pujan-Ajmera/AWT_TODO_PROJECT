import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const taskId = parseInt(params.id);
        const body = await request.json();
        const { text } = body;

        if (!text) {
            return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
        }

        const comment = await prisma.taskcomments.create({
            data: {
                TaskID: taskId,
                UserID: user.userId,
                CommentText: text,
            }
        });

        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        console.error("POST comment error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
