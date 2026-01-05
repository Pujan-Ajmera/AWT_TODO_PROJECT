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

        const projectId = parseInt(params.id);

        const project = await prisma.projects.findUnique({
            where: { ProjectID: projectId },
            include: {
                tasklists: {
                    include: {
                        tasks: {
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
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        return NextResponse.json(project);
    } catch (error) {
        console.error("GET project error:", error);
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

        const projectId = parseInt(params.id);
        const body = await request.json();
        const { name, description } = body;

        const updatedProject = await prisma.projects.update({
            where: { ProjectID: projectId },
            data: {
                ProjectName: name,
                Description: description,
            }
        });

        return NextResponse.json(updatedProject);
    } catch (error) {
        console.error("PATCH project error:", error);
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

        const projectId = parseInt(params.id);

        await prisma.projects.delete({
            where: { ProjectID: projectId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE project error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
