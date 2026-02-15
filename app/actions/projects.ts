"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";

export async function createProjectAction(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    if (!name) {
        return { error: "Project name is required" };
    }

    try {
        const project = await prisma.projects.create({
            data: {
                ProjectName: name,
                Description: description,
                CreatedBy: user.userId,
            }
        });

        revalidatePath("/projects");
        revalidatePath("/");
        return { success: true, projectId: project.ProjectID };
    } catch (error) {
        console.error("Create project error:", error);
        return { error: "Failed to create project" };
    }
}

export async function deleteProjectAction(projectId: number) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    try {
        const project = await prisma.projects.findUnique({
            where: { ProjectID: projectId }
        });

        if (!project) {
            return { error: "Project not found" };
        }

        // Check if current user is an admin
        const currentUserRoles = await prisma.userroles.findMany({
            where: { UserID: user.userId },
            include: { roles: true }
        });

        const isAdmin = currentUserRoles.some(ur => ur.roles?.RoleName === "Admin");
        const isCreator = project.CreatedBy === user.userId;

        if (!isAdmin && !isCreator) {
            return { error: "Permission denied. Only the project creator or an admin can delete this project." };
        }

        await prisma.projects.delete({
            where: { ProjectID: projectId }
        });

        revalidatePath("/projects");
        revalidatePath("/");
        revalidatePath("/my-tasks");
        return { success: true };
    } catch (error) {
        console.error("Delete project error:", error);
        return { error: "Failed to delete project" };
    }
}

export async function createTaskListAction(projectId: number, name: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    try {
        await prisma.tasklists.create({
            data: {
                ProjectID: projectId,
                ListName: name,
            }
        });

        revalidatePath(`/projects/${projectId}`);
        revalidatePath("/projects");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Create task list error:", error);
        return { error: "Failed to create task list" };
    }
}

export async function deleteTaskListAction(listId: number) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    try {
        await prisma.tasklists.delete({
            where: { ListID: listId }
        });

        revalidatePath("/");
        revalidatePath("/projects");
        return { success: true };
    } catch (error) {
        console.error("Delete task list error:", error);
        return { error: "Failed to delete task list" };
    }
}


