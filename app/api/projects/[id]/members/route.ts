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

        const members = await prisma.project_members.findMany({
            where: { ProjectID: projectId },
            include: {
                users: {
                    select: {
                        UserID: true,
                        UserName: true,
                        Email: true
                    }
                }
            }
        });

        return NextResponse.json(members);
    } catch (error) {
        console.error("GET members error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const projectId = parseInt(params.id);
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const userToInvite = await prisma.users.findUnique({
            where: { Email: email }
        });

        if (!userToInvite) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const existingMember = await prisma.project_members.findUnique({
            where: {
                ProjectID_UserID: {
                    ProjectID: projectId,
                    UserID: userToInvite.UserID
                }
            }
        });

        if (existingMember) {
            return NextResponse.json({ error: "User is already a member" }, { status: 400 });
        }

        const newMember = await prisma.project_members.create({
            data: {
                ProjectID: projectId,
                UserID: userToInvite.UserID
            },
            include: {
                users: {
                    select: {
                        UserID: true,
                        UserName: true,
                        Email: true
                    }
                }
            }
        });

        return NextResponse.json(newMember, { status: 201 });
    } catch (error) {
        console.error("POST member error:", error);
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
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        await prisma.project_members.delete({
            where: {
                ProjectID_UserID: {
                    ProjectID: projectId,
                    UserID: parseInt(userId)
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE member error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
