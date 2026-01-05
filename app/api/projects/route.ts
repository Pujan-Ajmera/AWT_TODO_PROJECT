import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { handleApiError, ApiError } from "@/lib/api-utils";

const projectSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    description: z.string().optional(),
});

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userWithProjects = await prisma.users.findUnique({
            where: { UserID: user.userId },
            include: {
                projects: {
                    include: {
                        tasklists: {
                            include: {
                                tasks: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json(userWithProjects?.projects || []);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new ApiError("Unauthorized", 401);

        const body = await request.json();
        const { name, description } = projectSchema.parse(body);

        const project = await prisma.projects.create({
            data: {
                ProjectName: name,
                Description: description,
                CreatedBy: user.userId,
            }
        });

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
