"use client";

import { LogOut } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/actions/auth";

interface LogoutConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LogoutConfirmModal({ isOpen, onClose }: LogoutConfirmModalProps) {
    const handleLogout = async () => {
        await logoutAction();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Confirm Logout">
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        <LogOut className="h-6 w-6" />
                    </div>
                    <p className="text-sm">
                        Are you sure you want to log out? You will need to sign in again to access your tasks.
                    </p>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={onClose} className="rounded-full">
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleLogout} className="rounded-full">
                        Log Out
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
