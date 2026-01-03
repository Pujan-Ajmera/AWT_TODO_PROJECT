"use client";

import { useActionState, useState } from "react";
import { UserPlus, X, Loader2, Shield } from "lucide-react";
import { createUserAction } from "@/app/actions/admin";
import { cn } from "@/lib/utils";

interface Role {
    RoleID: number;
    RoleName: string;
}

export function CreateUserModal({ roles }: { roles: Role[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [state, action, isPending] = useActionState(
        async (prevState: any, formData: FormData) => {
            const res = await createUserAction(prevState, formData);
            return res;
        },
        null
    );

    if (state?.success && isOpen) {
        setIsOpen(false);
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/20 hover:opacity-90 hover:scale-[1.02] transition-all active:scale-95"
            >
                <UserPlus className="h-5 w-5" />
                Add New User
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div
                        className="w-full max-w-md bg-card rounded-[2.5rem] border border-border/50 shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <UserPlus className="h-5 w-5" />
                                </div>
                                <h3 className="text-xl font-black">Add New User</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form action={action} className="space-y-4">
                            {state?.error && (
                                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-100">
                                    {state.error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    placeholder="Enter full name"
                                    className="w-full h-12 rounded-2xl border bg-background px-4 text-sm outline-none transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="user@example.com"
                                    className="w-full h-12 rounded-2xl border bg-background px-4 text-sm outline-none transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Initial Role</label>
                                <select
                                    name="roleId"
                                    required
                                    className="w-full h-12 rounded-2xl border bg-background px-4 text-sm outline-none transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary appearance-none"
                                >
                                    {roles.map(role => (
                                        <option key={role.RoleID} value={role.RoleID}>
                                            {role.RoleName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Adding User...
                                        </>
                                    ) : (
                                        "Create User"
                                    )}
                                </button>
                            </div>

                            <p className="text-[10px] text-center text-muted-foreground uppercase font-bold tracking-widest">
                                Default password will be: <span className="text-primary italic">password123</span>
                            </p>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
