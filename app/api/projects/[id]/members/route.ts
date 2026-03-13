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
        const projectId = parseInt(id);
        if (isNaN(projectId)) throw new ApiError("Invalid Project ID", 400);

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

        // Authorization check: Only admins can manage members
        const userRoles = await prisma.userroles.findMany({
            where: { UserID: user.userId },
            include: { roles: true }
        });
        const isAdmin = userRoles.some(ur => ur.roles?.RoleName === "Admin");
        if (!isAdmin) throw new ApiError("Forbidden: Only admins can manage members", 403);

        const { id } = await params;
        const projectId = parseInt(id);
        if (isNaN(projectId)) throw new ApiError("Invalid Project ID", 400);

        const { email } = await request.json();

        if (!email) throw new ApiError("Email is required", 400);

        const userToInvite = await prisma.users.findUnique({
            where: { Email: email }
        });

        if (!userToInvite) throw new ApiError("User not found", 404);

        const existingMember = await prisma.project_members.findFirst({
            where: {
                ProjectID: projectId,
                UserID: userToInvite.UserID
            }
        });

        if (existingMember) throw new ApiError("User is already a member", 400);

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
        return handleApiError(error);
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new ApiError("Unauthorized", 401);

        // Authorization check
        const userRoles = await prisma.userroles.findMany({
            where: { UserID: user.userId },
            include: { roles: true }
        });
        const isAdmin = userRoles.some(ur => ur.roles?.RoleName === "Admin");
        if (!isAdmin) throw new ApiError("Forbidden: Only admins can manage members", 403);

        const { id } = await params;
        const projectId = parseInt(id);
        const { searchParams } = new URL(request.url);
        const userIdStr = searchParams.get("userId");

        if (!userIdStr) throw new ApiError("User ID is required", 400);
        const userId = parseInt(userIdStr);

        // Generic delete using findFirst to identify and then delete by MemberID
        // since compound keys can have generator-specific names
        const member = await prisma.project_members.findFirst({
            where: {
                ProjectID: projectId,
                UserID: userId
            }
        });

        if (!member) throw new ApiError("Member not found", 404);

        await prisma.project_members.delete({
            where: { MemberID: member.MemberID }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
