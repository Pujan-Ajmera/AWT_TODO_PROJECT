"use client";

import { useState } from "react";
import { Shield, Check, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateUserRoleAction } from "@/app/actions/admin";

interface Role {
    RoleID: number;
    RoleName: string;
}

interface UserRoleManagerProps {
    userId: number;
    currentRoles: string[];
    availableRoles: Role[];
}

export function UserRoleManager({ userId, currentRoles, availableRoles }: UserRoleManagerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const primaryRole = currentRoles[0] || "User";

    const handleRoleUpdate = async (roleId: number) => {
        setIsLoading(true);
        const result = await updateUserRoleAction(userId, roleId);
        setIsLoading(false);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border shadow-sm",
                    primaryRole === "Admin" ? "bg-red-50 border-red-100 text-red-600" : "bg-blue-50 border-blue-100 text-blue-600",
                    "hover:shadow-md active:scale-95"
                )}
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Shield className="h-3 w-3" />}
                {primaryRole}
                <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-48 bg-card rounded-2xl border border-border/50 shadow-2xl z-20 py-2 animate-in zoom-in-95 duration-200">
                        {availableRoles.map((role) => (
                            <button
                                key={role.RoleID}
                                onClick={() => handleRoleUpdate(role.RoleID)}
                                className="flex items-center justify-between w-full px-4 py-2.5 text-xs font-bold hover:bg-muted transition-colors text-left"
                            >
                                <span className="uppercase tracking-widest">{role.RoleName}</span>
                                {currentRoles.includes(role.RoleName) && <Check className="h-3.5 w-3.5 text-primary" />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
