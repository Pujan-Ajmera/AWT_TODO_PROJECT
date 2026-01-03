"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { LogoutConfirmModal } from "./logout-confirm-modal";

export function LogoutButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
                <LogOut className="h-4 w-4" />
                Logout
            </button>
            <LogoutConfirmModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
