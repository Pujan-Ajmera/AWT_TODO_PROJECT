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

        const history = await prisma.taskhistory.findMany({
            where: { TaskID: taskId },
            include: {
                users: {
                    select: {
                        UserName: true
                    }
                }
            },
            orderBy: { ChangeTime: "desc" }
        });

        return NextResponse.json(history);
    } catch (error) {
        return handleApiError(error);
    }
}
