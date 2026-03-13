import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { handleApiError, ApiError } from "@/lib/api-utils";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new ApiError("Unauthorized", 401);

        const { id } = await params;
        const listId = parseInt(id);

        await prisma.tasklists.delete({
            where: { ListID: listId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE task list error:", error);
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
        const listId = parseInt(id);
        const body = await request.json();
        const { name } = body;

        const updatedList = await prisma.tasklists.update({
            where: { ListID: listId },
            data: {
                ListName: name
            }
        });

        return NextResponse.json(updatedList);
    } catch (error) {
        console.error("PATCH task list error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
