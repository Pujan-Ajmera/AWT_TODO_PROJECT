import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { handleApiError, ApiError } from "@/lib/api-utils";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new ApiError("Unauthorized", 401);

        const { id } = await params;
        const taskId = parseInt(id);
        if (isNaN(taskId)) throw new ApiError("Invalid Task ID", 400);
        const attachments = await prisma.taskattachments.findMany({
            where: { TaskID: taskId },
            include: {
                users: {
                    select: { UserName: true }
                }
            },
            orderBy: { UploadedAt: 'desc' }
        });

        return NextResponse.json(attachments);
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

        const { id } = await params;
        const taskId = parseInt(id);
        if (isNaN(taskId)) throw new ApiError("Invalid Task ID", 400);
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = join(process.cwd(), "public", "uploads");
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
        }

        const uniqueFileName = `${uuidv4()}-${file.name}`;
        const path = join(uploadDir, uniqueFileName);
        await writeFile(path, buffer);

        const attachment = await prisma.taskattachments.create({
            data: {
                TaskID: taskId,
                FileName: file.name,
                FilePath: `/uploads/${uniqueFileName}`,
                FileType: file.type,
                FileSize: file.size,
                UploadedBy: user.userId,
            }
        });

        // Log history
        await prisma.taskhistory.create({
            data: {
                TaskID: taskId,
                ChangedBy: user.userId,
                ChangeType: `File attached: ${file.name}`,
            }
        });

        return NextResponse.json(attachment, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
