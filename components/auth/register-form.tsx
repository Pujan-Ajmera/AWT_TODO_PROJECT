"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { registerAction } from "@/app/actions/auth";

export function RegisterForm() {
    const [state, action, isPending] = useActionState(registerAction, null);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <form action={action} className="space-y-4" autoComplete="off">
            {state?.error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500 border border-red-100 animate-in fade-in slide-in-from-top-2">
                    {state.error}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="first-name">
                        First name
                    </label>
                    <input
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="first-name"
                        name="first-name"
                        placeholder="John"
                        autoComplete="off"
                        defaultValue={state?.firstName || ""}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="last-name">
                        Last name
                    </label>
                    <input
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        id="last-name"
                        name="last-name"
                        placeholder="Doe"
                        autoComplete="off"
                        defaultValue={state?.lastName || ""}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="email">
                    Email
                </label>
                <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    id="email"
                    name="email"
                    placeholder="m@example.com"
                    type="email"
                    autoComplete="off"
                    defaultValue={state?.email || ""}
                    required
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="password">
                    Password
                </label>
                <div className="relative">
                    <input
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pr-10"
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg hover:opacity-90 transition-opacity disabled:opacity-70"
            >
                {isPending ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating account...
                    </>
                ) : (
                    "Create Account"
                )}
            </button>
        </form>
    );
}
