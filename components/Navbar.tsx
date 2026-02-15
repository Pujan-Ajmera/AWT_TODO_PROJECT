"use client";

import Link from "next/link";
import { Bell, Search, User, Settings, LogOut, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface NavbarProps {
    isAdmin?: boolean;
}

export function Navbar({ isAdmin }: NavbarProps) {
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
            <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-4 group focus:ring-4 focus:ring-primary/10 rounded-2xl p-1 outline-none">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg group-hover:scale-110 group-active:scale-95 transition-transform duration-200">
                        <span className="text-xl font-bold text-primary-foreground">T</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">TodoApp</span>
                </Link>

                <div className="h-6 w-[1px] bg-border mx-2" />

                {isAdmin && (
                    <Link
                        href="/admin/users"
                        className={cn(
                            "hidden lg:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95",
                            pathname.startsWith("/admin")
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <ShieldAlert className="h-4 w-4" />
                        Admin
                    </Link>
                )}
            </div>

            <div className="flex items-center gap-6">
                <form action="/my-tasks" method="GET" className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        name="search"
                        placeholder="Search tasks..."
                        className="h-10 w-72 rounded-full border bg-muted/50 pl-10 pr-4 text-sm outline-none transition-all focus:bg-background focus:ring-2 focus:ring-ring/20 focus:border-ring w-64 md:w-80"
                    />
                </form>

                <div className="flex items-center gap-2">
                    <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-all active:scale-95">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                    </button>

                    <div className="h-6 w-[1px] bg-border mx-2" />

                    <Link
                        href="/profile"
                        className={cn(
                            "flex items-center gap-2 rounded-full border p-1 pr-4 transition-all hover:shadow-md active:scale-95",
                            pathname === "/profile" ? "bg-primary/5 border-primary/20" : "hover:bg-muted"
                        )}
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary overflow-hidden">
                            <User className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-semibold">My Profile</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
