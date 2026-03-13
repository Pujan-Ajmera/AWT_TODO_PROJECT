"use client";

import { AdvancedSearchFilters } from "@/components/search/advanced-search-filters";
import { TaskItemActions } from "@/components/tasks/task-item-actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ListTodo,
    Plus,
    Settings,
    FolderKanban,
    ShieldAlert,
    ChevronRight,
    Search,
    BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: ListTodo, label: "My Tasks", href: "/my-tasks" },
    { icon: FolderKanban, label: "Projects", href: "/projects" },
    { icon: Search, label: "Advanced Search", href: "/search" },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
    { icon: Settings, label: "Profile", href: "/profile" },
];

const adminItems = [
    { icon: ShieldAlert, label: "User Management", href: "/admin/users" },
];

export function Sidebar({ projects = [], isAdmin = false }: { projects?: any[]; isAdmin?: boolean }) {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-64px)] w-64 border-r bg-card/30 backdrop-blur-xl transition-all duration-300">
            <div className="flex h-full flex-col p-6 space-y-8 overflow-y-auto scrollbar-hide">
                <div className="space-y-1.5">
                    <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-4">Focus</p>
                    {mainItems.map((item) => {
                        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={cn("h-5 w-5", isActive ? "animate-pulse" : "group-hover:scale-110 transition-transform")} />
                                    {item.label}
                                </div>
                                {isActive && <ChevronRight className="h-4 w-4" />}
                            </Link>
                        );
                    })}
                </div>

                {isAdmin && (
                    <div className="space-y-1.5">
                        <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-4">Administration</p>
                        {adminItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200",
                                        isActive
                                            ? "bg-muted text-foreground border border-border ring-2 ring-primary/5"
                                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                    )}
                                >
                                    <item.icon className={cn("h-5 w-5 transition-transform", isActive ? "text-primary scale-110" : "group-hover:rotate-12")} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="flex items-center justify-between px-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Recent Projects</p>
                        {isAdmin && (
                            <Link href="/projects" className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                                <Plus className="h-4 w-4" />
                            </Link>
                        )}
                    </div>
                    <div className="space-y-1">
                        {Array.isArray(projects) && projects.slice(0, 3).map((project) => (
                            <Link
                                key={project.ProjectID}
                                href={`/projects/${project.ProjectID}`}
                                className={cn(
                                    "group flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "h-2 w-2 rounded-full ring-4 ring-transparent transition-all group-hover:ring-primary/10",
                                        project.ProjectID % 3 === 0 ? "bg-blue-500" : project.ProjectID % 3 === 1 ? "bg-purple-500" : "bg-emerald-500"
                                    )} />
                                    <span className="truncate">{project.ProjectName}</span>
                                </div>
                                <ChevronRight className="h-3 w-3 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                            </Link>
                        ))}
                    </div>
                </div>


            </div>
        </aside>
    );
}
