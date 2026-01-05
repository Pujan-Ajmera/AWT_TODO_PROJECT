import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { projectId, name } = body;

        if (!projectId || !name) {
            return NextResponse.json({ error: "Project ID and List Name are required" }, { status: 400 });
        }

        const taskList = await prisma.tasklists.create({
            data: {
                ProjectID: parseInt(projectId),
                ListName: name,
            }
        });

        return NextResponse.json(taskList, { status: 201 });
    } catch (error) {
        console.error("POST task list error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
