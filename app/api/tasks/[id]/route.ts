import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const taskId = parseInt(params.id);

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
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const taskId = parseInt(params.id);
        const body = await request.json();
        const { title, description, priority, status, dueDate, listId } = body;

        const updatedTask = await prisma.tasks.update({
            where: { TaskID: taskId },
            data: {
                Title: title,
                Description: description,
                Priority: priority,
                Status: status,
                DueDate: dueDate ? new Date(dueDate) : undefined,
                ListID: listId ? parseInt(listId) : undefined,
            }
        });

        // Log history if status changed
        if (status) {
            await prisma.taskhistory.create({
                data: {
                    TaskID: taskId,
                    ChangedBy: user.userId,
                    ChangeType: `Status updated to ${status}`,
                }
            });
        }

        return NextResponse.json(updatedTask);
    } catch (error) {
        console.error("PATCH task error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const taskId = parseInt(params.id);

        await prisma.tasks.delete({
            where: { TaskID: taskId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE task error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
