"use client";

import { useState } from "react";
import { UserCog, X, Loader2 } from "lucide-react";
import { updateUserRoleAction } from "@/app/actions/admin";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface Role {
    RoleID: number;
    RoleName: string;
}

interface UpdateUserModalProps {
    user: {
        userId: number;
        name: string;
        email: string;
        roles: string[];
    };
    availableRoles: Role[];
}

export function UpdateUserModal({ user, availableRoles }: UpdateUserModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [roleId, setRoleId] = useState(() => {
        const currentRole = availableRoles.find(r => user.roles.includes(r.RoleName));
        return currentRole ? currentRole.RoleID : availableRoles[0]?.RoleID;
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Note: We currently only have updateUserRoleAction which handles roles
            // We might need to implement a full updateUserAction if name/email also need to change
            const result = await updateUserRoleAction(user.userId, Number(roleId));
            if (result.success) {
                setIsOpen(false);
            } else {
                setError(result.error || "Failed to update user");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors opacity-0 group-hover:opacity-100"
                title="Edit User"
            >
                <UserCog className="h-5 w-5" />
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Edit User">
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs font-bold border border-red-100 rounded-xl italic">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full h-12 rounded-2xl border bg-muted/30 px-4 text-sm font-bold outline-none focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all opacity-50 cursor-not-allowed"
                            disabled
                        />
                        <p className="text-[9px] text-muted-foreground ml-1 italic">Name editing is disabled for now</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-12 rounded-2xl border bg-muted/30 px-4 text-sm font-bold outline-none focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all opacity-50 cursor-not-allowed"
                            disabled
                        />
                        <p className="text-[9px] text-muted-foreground ml-1 italic">Email editing is disabled for now</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">User Role</label>
                        <select
                            value={roleId}
                            onChange={(e) => setRoleId(Number(e.target.value))}
                            className="w-full h-12 rounded-2xl border bg-background px-4 text-sm font-bold outline-none transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary appearance-none"
                        >
                            {availableRoles.map(role => (
                                <option key={role.RoleID} value={role.RoleID}>
                                    {role.RoleName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="rounded-xl px-8 shadow-lg shadow-primary/20">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Update User
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
