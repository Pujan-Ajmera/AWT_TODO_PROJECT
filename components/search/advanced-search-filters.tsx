"use client";

import { useState, useEffect, useCallback, useTransition, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X, ChevronDown, User, Tag, Layout, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";

interface AdvancedSearchFiltersProps {
    projects: { ProjectID: number, ProjectName: string }[];
    users: { UserID: number, UserName: string }[];
    initialFilters: {
        q?: string;
        projectId?: string;
        assigneeId?: string;
        priority?: string;
        status?: string;
    };
}

export function AdvancedSearchFilters({ projects, users, initialFilters }: AdvancedSearchFiltersProps) {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(true);
    const [isPending, startTransition] = useTransition();

    const [q, setQ] = useState(initialFilters.q || "");
    const [projectId, setProjectId] = useState(initialFilters.projectId || "");
    const [assigneeId, setAssigneeId] = useState(initialFilters.assigneeId || "");
    const [priority, setPriority] = useState(initialFilters.priority || "");
    const [status, setStatus] = useState(initialFilters.status || "");

    const debouncedQ = useDebounce(q, 300);

    const updateSearch = useCallback((filters: {
        q?: string;
        projectId?: string;
        assigneeId?: string;
        priority?: string;
        status?: string;
    }) => {
        const params = new URLSearchParams();
        if (filters.q) params.set("q", filters.q);
        if (filters.projectId) params.set("projectId", filters.projectId);
        if (filters.assigneeId) params.set("assigneeId", filters.assigneeId);
        if (filters.priority) params.set("priority", filters.priority);
        if (filters.status) params.set("status", filters.status);

        startTransition(() => {
            router.replace(`/search?${params.toString()}`, { scroll: false });
        });
    }, [router]);

    // Handle debounced search for text queries
    useEffect(() => {
        // Only trigger if q has actually changed from what's in the URL
        if (debouncedQ !== (initialFilters.q || "")) {
            updateSearch({ q: debouncedQ, projectId, assigneeId, priority, status });
        }
    }, [debouncedQ]); // Only re-run when debounced value changes

    // Handle immediate updates for dropdown filters
    const handleFilterChange = (name: string, value: string) => {
        let newProjectId = projectId;
        let newAssigneeId = assigneeId;
        let newPriority = priority;
        let newStatus = status;

        if (name === "projectId") {
            setProjectId(value);
            newProjectId = value;
        } else if (name === "assigneeId") {
            setAssigneeId(value);
            newAssigneeId = value;
        } else if (name === "priority") {
            setPriority(value);
            newPriority = value;
        } else if (name === "status") {
            setStatus(value);
            newStatus = value;
        }

        updateSearch({ q, projectId: newProjectId, assigneeId: newAssigneeId, priority: newPriority, status: newStatus });
    };

    const clearFilters = () => {
        setQ("");
        setProjectId("");
        setAssigneeId("");
        setPriority("");
        setStatus("");
        startTransition(() => {
            router.replace("/search", { scroll: false });
        });
    };

    const hasFilters = q || projectId || assigneeId || priority || status;

    return (
        <div className="space-y-6">
            <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {isPending ? (
                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    ) : (
                        <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    )}
                </div>
                <input
                    type="text"
                    placeholder="Search tasks by title or description..."
                    className="w-full h-16 rounded-[2rem] border-2 bg-card/50 backdrop-blur-sm pl-16 pr-20 text-lg font-bold outline-none focus:bg-background focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all shadow-xl card-shadow"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {q && (
                        <button
                            type="button"
                            onClick={() => {
                                setQ("");
                                updateSearch({ q: "", projectId, assigneeId, priority, status });
                            }}
                            className="p-3 rounded-full hover:bg-muted text-muted-foreground transition-all active:scale-95"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="rounded-[2rem] border bg-card/30 backdrop-blur-md overflow-hidden card-shadow">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full p-6 flex items-center justify-between hover:bg-muted/20 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Filter className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-black tracking-tight">Advanced Filters</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        {hasFilters && (
                            <span className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full animate-in zoom-in duration-300 shadow-lg shadow-primary/20">
                                Filters Active
                            </span>
                        )}
                        <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform duration-300", isExpanded && "rotate-180")} />
                    </div>
                </button>

                <div className={cn("grid md:grid-cols-4 gap-6 p-8 border-t border-border/10 transition-all duration-500", !isExpanded && "hidden opacity-0 scale-95", isExpanded && "opacity-100 scale-100 animate-in fade-in zoom-in-95 duration-300")}>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                            <Layout className="h-3 w-3" /> Project
                        </label>
                        <select
                            className="w-full h-11 rounded-xl bg-muted/30 border border-border/50 px-3 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer hover:bg-muted/50 disabled:opacity-50"
                            value={projectId}
                            disabled={isPending}
                            onChange={(e) => handleFilterChange("projectId", e.target.value)}
                        >
                            <option value="">All Projects</option>
                            {projects.map(p => (
                                <option key={p.ProjectID} value={p.ProjectID}>{p.ProjectName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                            <User className="h-3 w-3" /> Assignee
                        </label>
                        <select
                            className="w-full h-11 rounded-xl bg-muted/30 border border-border/50 px-3 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer hover:bg-muted/50 disabled:opacity-50"
                            value={assigneeId}
                            disabled={isPending}
                            onChange={(e) => handleFilterChange("assigneeId", e.target.value)}
                        >
                            <option value="">Anyone</option>
                            {users.map(u => (
                                <option key={u.UserID} value={u.UserID}>{u.UserName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                            <Tag className="h-3 w-3" /> Priority
                        </label>
                        <select
                            className="w-full h-11 rounded-xl bg-muted/30 border border-border/50 px-3 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer hover:bg-muted/50 disabled:opacity-50"
                            value={priority}
                            disabled={isPending}
                            onChange={(e) => handleFilterChange("priority", e.target.value)}
                        >
                            <option value="">All Priorities</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                            <Check className="h-3 w-3" /> Status
                        </label>
                        <select
                            className="w-full h-11 rounded-xl bg-muted/30 border border-border/50 px-3 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer hover:bg-muted/50 disabled:opacity-50"
                            value={status}
                            disabled={isPending}
                            onChange={(e) => handleFilterChange("status", e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    <div className="md:col-span-4 flex justify-end gap-3 pt-4 border-t border-border/5 mt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            className="rounded-xl font-bold hover:bg-red-50 hover:text-red-600 transition-colors"
                            onClick={clearFilters}
                            disabled={isPending}
                        >
                            Reset All Filters
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
