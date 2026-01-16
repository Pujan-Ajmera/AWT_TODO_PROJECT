"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteUserAction } from "@/app/actions/admin";

interface UserDeleteButtonProps {
    userId: number;
    userName: string;
}

export function UserDeleteButton({ userId, userName }: UserDeleteButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete user "${userName}"?`)) return;

        setIsLoading(true);
        try {
            const result = await deleteUserAction(userId);
            if (result.success) {
                router.refresh();
            } else {
                alert(result.error || "Failed to delete user");
            }
        } catch (error) {
            console.error("Delete user error:", error);
            alert("Something went wrong");
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
