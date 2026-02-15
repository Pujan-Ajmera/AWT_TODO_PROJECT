"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";

export async function createTaskAction(formData: FormData) {
    const user = await getCurrentUser();
    console.log("createTaskAction triggered by user:", user?.userId);
    if (!user) {
        console.error("Unauthorized access attempt in createTaskAction");
        throw new Error("Unauthorized");
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as string;
    const listId = formData.get("listId") ? parseInt(formData.get("listId") as string) : null;
    const dueDate = formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : null;

    if (!title) {
        return { error: "Title is required" };
    }

    try {
        const createdTask = await prisma.tasks.create({
            data: {
                Title: title,
                Description: description,
                Priority: priority || "Medium",
                Status: "Pending",
                ListID: listId,
                AssignedTo: user.userId,
                DueDate: dueDate,
            }
        });
        console.log("Task created successfully in DB:", createdTask.TaskID);

        revalidatePath("/");
        revalidatePath("/my-tasks");
        revalidatePath("/projects");
        return { success: true };
    } catch (error) {
        console.error("Create task error:", error);
        return { error: "Failed to create task" };
    }
}

export async function updateTaskStatusAction(taskId: number, status: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    try {
        await prisma.tasks.update({
            where: { TaskID: taskId },
            data: { Status: status }
        });

        // Log history
        await prisma.taskhistory.create({
            data: {
                TaskID: taskId,
                ChangedBy: user.userId,
                ChangeType: `Status updated to ${status}`,
            }
        });

        revalidatePath("/");
        revalidatePath("/my-tasks");
        revalidatePath("/projects");
        return { success: true };
    } catch (error) {
        console.error("Update task status error:", error);
        return { error: "Failed to update task status" };
    }
}

export async function updateTaskAction(taskId: number, formData: FormData) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as string;
    const status = formData.get("status") as string;
    const dueDate = formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : null;

    try {
        await prisma.tasks.update({
            where: { TaskID: taskId },
            data: {
                Title: title,
                Description: description,
                Priority: priority,
                Status: status,
                DueDate: dueDate,
            }
        });

        // Log history
        await prisma.taskhistory.create({
            data: {
                TaskID: taskId,
                ChangedBy: user.userId,
                ChangeType: `Task updated`,
            }
        });

        revalidatePath("/");
        revalidatePath("/my-tasks");
        revalidatePath("/projects");
        return { success: true };
    } catch (error) {
        console.error("Update task error:", error);
        return { error: "Failed to update task" };
    }
}

export async function addCommentAction(taskId: number, text: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    try {
        await prisma.taskcomments.create({
            data: {
                TaskID: taskId,
                UserID: user.userId,
                CommentText: text,
            }
        });

        console.log("Comment added successfully");
        revalidatePath("/");
        revalidatePath("/my-tasks");
        revalidatePath("/projects");
        return { success: true };
    } catch (error) {
        console.error("Add comment error:", error);
        return { error: "Failed to add comment" };
    }
}
export async function deleteTaskAction(taskId: number) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    try {
        // Use a transaction to ensure all related records are deleted safely
        await prisma.$transaction([
            // Delete related records first to satisfy foreign key constraints
            prisma.taskcomments.deleteMany({ where: { TaskID: taskId } }),
            prisma.taskhistory.deleteMany({ where: { TaskID: taskId } }),
            prisma.taskattachments.deleteMany({ where: { TaskID: taskId } }),
            // Finally delete the task
            prisma.tasks.delete({ where: { TaskID: taskId } })
        ]);

        console.log(`Task ${taskId} and all related records deleted successfully.`);

        revalidatePath("/");
        revalidatePath("/my-tasks");
        revalidatePath("/projects");
        revalidatePath("/search");
        return { success: true };
    } catch (error) {
        console.error("Delete task error:", error);
        return { error: "Failed to delete task" };
    }
}
