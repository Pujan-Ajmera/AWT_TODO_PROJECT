"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Github, Loader2, Mail } from "lucide-react";
import { loginAction } from "@/app/actions/auth";

export function LoginForm() {
    const [state, action, isPending] = useActionState(loginAction, null);

    return (
        <form action={action} className="space-y-4">
            {state?.error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500 border border-red-100 animate-in fade-in slide-in-from-top-2">
                    {state.error}
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="email">
                    Email
                </label>
                <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    id="email"
                    name="email"
                    placeholder="m@example.com"
                    type="email"
                    required
                />
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium leading-none" htmlFor="password">
                        Password
                    </label>
                    <Link href="#" className="text-xs text-muted-foreground hover:underline">
                        Forgot password?
                    </Link>
                </div>
                <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    id="password"
                    name="password"
                    type="password"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg hover:opacity-90 transition-opacity disabled:opacity-70"
            >
                {isPending ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in...
                    </>
                ) : (
                    "Sign In"
                )}
            </button>
        </form>
    );
}
