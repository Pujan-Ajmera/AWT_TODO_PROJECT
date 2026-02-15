"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function changePasswordAction(prevState: any, formData: FormData) {
    const user = await getCurrentUser();
    if (!user) return { error: "Unauthorized" };

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { error: "All fields are required" };
    }

    if (newPassword !== confirmPassword) {
        return { error: "New passwords do not match" };
    }

    try {
        const userData = await prisma.users.findUnique({
            where: { UserID: user.userId }
        });

        if (!userData || userData.PasswordHash !== currentPassword) {
            return { error: "Incorrect current password" };
        }

        await prisma.users.update({
            where: { UserID: user.userId },
            data: { PasswordHash: newPassword }
        });

        return { success: true };
    } catch (error) {
        console.error("Change password error:", error);
        return { error: "An unexpected error occurred" };
    }
}
