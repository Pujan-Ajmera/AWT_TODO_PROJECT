"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

export function LogoutButton() {
    const handleLogout = async () => {
        if (window.confirm("Are you sure you want to log out?")) {
            await logoutAction();
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
            <LogOut className="h-4 w-4" />
            Logout
        </button>
    );
}
