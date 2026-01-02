"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    CheckCircle2,
    LayoutDashboard,
    ListTodo,
    Plus,
    Settings,
    Star,
    Users
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: ListTodo, label: "My Tasks", href: "/tasks" },
    { icon: Star, label: "Important", href: "/important" },
    { icon: Users, label: "Team", href: "/team" },
    { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar({ projects = [] }: { projects?: any[] }) {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-64px)] w-64 border-r bg-background/50 backdrop-blur-sm">
            <div className="flex h-full flex-col p-4">
                <div className="space-y-1">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                pathname === item.href
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}
                </div>

                <div className="mt-8">
                    <div className="flex items-center justify-between px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                        <span>Projects</span>
                        <button className="rounded p-0.5 hover:bg-muted">
                            <Plus className="h-3 w-3" />
                        </button>
                    </div>
                    <div className="mt-2 space-y-1">
                        {projects.map((project) => (
                            <Link
                                key={project.ProjectID}
                                href={`/projects/${project.ProjectID}`}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                <div className={cn(
                                    "h-2 w-2 rounded-full",
                                    project.ProjectID % 2 === 0 ? "bg-blue-500" : "bg-green-500"
                                )} />
                                {project.ProjectName}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="mt-auto">
                    <div className="rounded-xl border bg-card p-4 card-shadow">
                        <p className="text-xs font-semibold text-muted-foreground">TASKS COMPLETED</p>
                        <div className="mt-2 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-2xl font-bold">12 / 15</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div className="h-full w-[80%] bg-primary" />
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
