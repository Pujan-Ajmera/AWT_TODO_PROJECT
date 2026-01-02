"use client";

import Link from "next/link";
import { Bell, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
            <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <span className="text-lg font-bold text-primary-foreground">T</span>
                    </div>
                    <span className="text-xl font-semibold tracking-tight">TodoApp</span>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="h-9 w-64 rounded-full border bg-muted/50 pl-9 pr-4 text-sm outline-none transition-all focus:bg-background focus:ring-2 focus:ring-ring"
                    />
                </div>

                <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors">
                    <Bell className="h-5 w-5" />
                </button>

                <div className="h-8 w-[1px] bg-border" />

                <button className="flex items-center gap-2 rounded-full border p-1 pr-3 hover:bg-muted transition-colors">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary">
                        <User className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">Profile</span>
                </button>
            </div>
        </nav>
    );
}
