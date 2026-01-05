import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const listId = parseInt(params.id);

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
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const listId = parseInt(params.id);
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
