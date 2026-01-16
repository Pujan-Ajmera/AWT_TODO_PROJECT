"use client";

import { useState } from "react";
import { User, Mail, Shield, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
    user: {
        UserName: string;
        Email: string;
    }
}

export function ProfileForm({ user }: ProfileFormProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user.UserName);
    const [email, setEmail] = useState(user.Email);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

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
        <div className="rounded-2xl border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Account Information</h3>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs font-bold text-primary hover:underline uppercase tracking-widest"
                    >
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            disabled={isLoading}
                            className="p-1 px-3 rounded-full border text-[10px] font-black uppercase tracking-widest hover:bg-muted"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="p-1 px-3 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-50"
                        >
                            {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background shadow-sm text-muted-foreground">
                        <User className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Full Name</p>
                        {isEditing ? (
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-transparent border-b border-primary/20 focus:border-primary outline-none text-sm font-semibold py-0.5"
                            />
                        ) : (
                            <p className="text-sm font-semibold">{user.UserName}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background shadow-sm text-muted-foreground">
                        <Mail className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Email Address</p>
                        {isEditing ? (
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-transparent border-b border-primary/20 focus:border-primary outline-none text-sm font-semibold py-0.5"
                            />
                        ) : (
                            <p className="text-sm font-semibold">{user.Email}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
