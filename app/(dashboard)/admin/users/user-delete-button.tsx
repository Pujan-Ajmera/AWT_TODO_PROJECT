"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteUserAction } from "@/app/actions/admin";
import Swal from "sweetalert2";

interface UserDeleteButtonProps {
    userId: number;
    userName: string;
}

export function UserDeleteButton({ userId, userName }: UserDeleteButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: "Delete User?",
            text: `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel",
            customClass: {
                popup: "rounded-[2rem] border-none shadow-2xl",
                confirmButton: "rounded-xl font-bold px-6",
                cancelButton: "rounded-xl font-bold px-6"
            }
        });

        if (!result.isConfirmed) return;

        setIsLoading(true);
        try {
            const result = await deleteUserAction(userId);
            if (result.success) {
                await Swal.fire({
                    title: "Deleted!",
                    text: "User has been deleted.",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: {
                        popup: "rounded-[2rem] border-none shadow-2xl"
                    }
                });
                router.refresh();
            } else {
                await Swal.fire({
                    title: "Error",
                    text: result.error || "Failed to delete user",
                    icon: "error",
                    customClass: {
                        popup: "rounded-[2rem] border-none shadow-2xl",
                        confirmButton: "rounded-xl font-bold px-6"
                    }
                });
            }
        } catch (error) {
            console.error("Delete user error:", error);
            await Swal.fire({
                title: "Error",
                text: "Something went wrong",
                icon: "error",
                customClass: {
                    popup: "rounded-[2rem] border-none shadow-2xl",
                    confirmButton: "rounded-xl font-bold px-6"
                }
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete User"
        >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
        </button>
    );
}
