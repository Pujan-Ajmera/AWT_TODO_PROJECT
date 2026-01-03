"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";

export async function updateUserRoleAction(targetUserId: number, roleId: number) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Check if current user is an admin
    const currentUserRoles = await prisma.userroles.findMany({
        where: { UserID: user.userId },
        include: { roles: true }
    });

    const isAdmin = currentUserRoles.some(ur => ur.roles?.RoleName === "Admin");
    if (!isAdmin) {
        return { error: "Permission denied. Admin access required." };
    }

    try {
        // Remove existing roles or just add/update?
        // For simplicity, we'll clear and set the new role
        await prisma.userroles.deleteMany({
            where: { UserID: targetUserId }
        });

        await prisma.userroles.create({
            data: {
                UserID: targetUserId,
                RoleID: roleId,
            }
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Update user role error:", error);
        return { error: "Failed to update user role" };
    }
}

export async function deleteUserAction(targetUserId: number) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Check if current user is an admin
    const currentUserRoles = await prisma.userroles.findMany({
        where: { UserID: user.userId },
        include: { roles: true }
    });

    const isAdmin = currentUserRoles.some(ur => ur.roles?.RoleName === "Admin");
    if (!isAdmin) {
        return { error: "Permission denied. Admin access required." };
    }

    if (targetUserId === user.userId) {
        return { error: "You cannot delete your own account." };
    }

    try {
        await prisma.userroles.deleteMany({ where: { UserID: targetUserId } });
        await prisma.tasks.deleteMany({ where: { AssignedTo: targetUserId } });
        await prisma.users.delete({ where: { UserID: targetUserId } });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Delete user error:", error);
        return { error: "Failed to delete user" };
    }
}

export async function createUserAction(prevState: any, formData: FormData) {
    const user = await getCurrentUser();
    console.log("createUserAction triggered by admin:", user?.userId);
    if (!user) {
        console.error("Unauthorized admin action attempt");
        throw new Error("Unauthorized");
    }

    // Check if current user is an admin
    const currentUserRoles = await prisma.userroles.findMany({
        where: { UserID: user.userId },
        include: { roles: true }
    });

    const isAdmin = currentUserRoles.some(ur => ur.roles?.RoleName === "Admin");
    if (!isAdmin) {
        return { error: "Permission denied. Admin access required." };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const roleId = Number(formData.get("roleId"));

    if (!name || !email || !roleId) {
        return { error: "Missing required fields" };
    }

    try {
        const newUser = await prisma.users.create({
            data: {
                UserName: name,
                Email: email,
                PasswordHash: "password123", // Default password
            }
        });

        await prisma.userroles.create({
            data: {
                UserID: newUser.UserID,
                RoleID: roleId,
            }
        });

        console.log("User created successfully:", newUser.UserID);
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Create user error:", error);
        return { error: "Failed to create user" };
    }
}
