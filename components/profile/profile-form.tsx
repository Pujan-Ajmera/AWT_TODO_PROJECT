"use client";

import { useState, useActionState, useEffect } from "react";
import { User, Mail, Shield, Check, X, Lock, Loader2, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { changePasswordAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";

interface ProfileFormProps {
    user: {
        UserName: string;
        Email: string;
    }
}

import Swal from "sweetalert2";

export function ProfileForm({ user }: ProfileFormProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user.UserName);
    const [email, setEmail] = useState(user.Email);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Password change state
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [pwState, pwAction, isPwLoading] = useActionState(changePasswordAction, null);

    useEffect(() => {
        if (pwState?.success) {
            setIsChangingPassword(false);
            Swal.fire({
                title: "Success!",
                text: "Password changed successfully!",
                icon: "success",
                timer: 3000,
                showConfirmButton: false,
                customClass: {
                    popup: "rounded-[2rem] border-none shadow-2xl"
                }
            });
        }
    }, [pwState]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email }),
            });

            if (response.ok) {
                setIsEditing(false);
                router.refresh();
            }
        } catch (error) {
            console.error("Save profile error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Account Info Section */}
            <div className="rounded-2xl border bg-card p-8 shadow-lg card-shadow">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <User className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold">Account Information</h3>
                    </div>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-xs font-black text-primary hover:underline uppercase tracking-widest bg-primary/5 px-4 py-2 rounded-lg"
                        >
                            Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                disabled={isLoading}
                                className="px-4 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest hover:bg-muted"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-50 shadow-lg shadow-primary/20"
                            >
                                {isLoading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={!isEditing || isLoading}
                                className="w-full h-12 rounded-xl border bg-muted/30 pl-11 pr-4 outline-none focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-semibold"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={!isEditing || isLoading}
                                className="w-full h-12 rounded-xl border bg-muted/30 pl-11 pr-4 outline-none focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-semibold"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Section */}
            <div className="rounded-2xl border bg-card p-8 shadow-lg card-shadow">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Lock className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold">Security</h3>
                    </div>
                    {!isChangingPassword && (
                        <button
                            onClick={() => setIsChangingPassword(true)}
                            className="text-xs font-black text-primary hover:underline uppercase tracking-widest bg-primary/5 px-4 py-2 rounded-lg"
                        >
                            Change Password
                        </button>
                    )}
                </div>

                {isChangingPassword ? (
                    <form action={pwAction} className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                        {pwState?.error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2">
                                <X className="h-4 w-4" />
                                {pwState.error}
                            </div>
                        )}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Password</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        name="currentPassword"
                                        type="password"
                                        className="w-full h-12 rounded-xl border bg-muted/30 pl-11 pr-4 outline-none focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all font-semibold"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        name="newPassword"
                                        type="password"
                                        className="w-full h-12 rounded-xl border bg-muted/30 pl-11 pr-4 outline-none focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all font-semibold"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm New Password</label>
                                <div className="relative">
                                    <Check className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        name="confirmPassword"
                                        type="password"
                                        className="w-full h-12 rounded-xl border bg-muted/30 pl-11 pr-4 outline-none focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all font-semibold"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsChangingPassword(false)}
                                className="px-6 py-2 rounded-xl border text-xs font-black uppercase tracking-widest hover:bg-muted transition-all"
                            >
                                Cancel
                            </button>
                            <Button
                                type="submit"
                                disabled={isPwLoading}
                                className="px-8 py-2 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                            >
                                {isPwLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Update Password
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="p-4 bg-muted/20 border border-dashed rounded-2xl flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-background border flex items-center justify-center text-muted-foreground">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">Account Security</p>
                            <p className="text-xs text-muted-foreground font-medium">Regularly changing your password helps keep your account secure.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
