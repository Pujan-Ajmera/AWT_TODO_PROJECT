import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
    Search,
    Calendar,
    Folder,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdvancedSearchFilters } from "@/components/search/advanced-search-filters";
import { TaskItemActions } from "@/components/tasks/task-item-actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";

export default async function AdvancedSearchPage({
    searchParams,
}: {
    searchParams: Promise<{
        q?: string,
        projectId?: string,
        assigneeId?: string,
        priority?: string,
        status?: string
    }>;
}) {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const filters = await searchParams;

    // Fetch projects and users for filters (these are relatively static)
    const [allProjects, allUsers] = await Promise.all([
        prisma.projects.findMany({ select: { ProjectID: true, ProjectName: true } }),
        prisma.users.findMany({ select: { UserID: true, UserName: true } })
    ]);

    const filterKey = JSON.stringify(filters);

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <div className="flex items-center gap-4 mb-2">
                    <div className="h-12 w-12 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Search className="h-6 w-6" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Advanced Search
                    </h1>
                </div>
                <p className="text-muted-foreground text-lg ml-16">Find tasks across all your projects with precision.</p>
            </header>

            <AdvancedSearchFilters
                projects={allProjects}
                users={allUsers}
                initialFilters={filters}
            />

            <Suspense key={filterKey} fallback={<SearchResultsSkeleton />}>
                <SearchResults filters={filters} />
            </Suspense>
        </div>
    );
}

async function SearchResults({ filters }: { filters: any }) {
    const { q, projectId, assigneeId, priority, status } = filters;

    // Build Prisma query
    const where: any = {
        AND: []
    };

    if (q) {
        where.AND.push({
            OR: [
                { Title: { contains: q } },
                { Description: { contains: q } }
            ]
        });
    }

    if (projectId) {
        where.AND.push({
            tasklists: {
                ProjectID: parseInt(projectId)
            }
        });
    }

    if (assigneeId) {
        where.AND.push({ AssignedTo: parseInt(assigneeId) });
    }

    if (priority) {
        where.AND.push({ Priority: priority });
    }

    if (status) {
        where.AND.push({ Status: status });
    }

    // Fetch tasks
    const tasks = await prisma.tasks.findMany({
        where: where.AND.length > 0 ? where : undefined,
        include: {
            users: { select: { UserName: true } },
            tasklists: {
                include: {
                    projects: { select: { ProjectName: true, ProjectID: true } }
                }
            }
        },
        orderBy: { CreatedAt: "desc" },
        take: 50
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-bold tracking-tight">
                    {tasks.length} {tasks.length === 1 ? "Result" : "Results"} Found
                </h2>
            </div>

            <div className="grid gap-4">
                {tasks.map((task) => (
                    <div key={task.TaskID} className="group relative flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-[2rem] border bg-card/50 backdrop-blur-sm p-6 hover:bg-card transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 card-shadow">
                        <div className="flex items-center gap-6">
                            <div className={cn(
                                "flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner",
                                task.Priority === "High" ? "bg-red-100 text-red-600" :
                                    task.Priority === "Medium" ? "bg-yellow-100 text-yellow-600" :
                                        "bg-blue-100 text-blue-600"
                            )}>
                                <div className="h-3 w-3 rounded-full bg-current animate-pulse" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h4 className="font-bold text-xl group-hover:text-primary transition-colors">{task.Title}</h4>
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border",
                                        task.Status === "Completed" ? "bg-green-50 text-green-600 border-green-100" :
                                            task.Status === "In Progress" ? "bg-yellow-50 text-yellow-600 border-yellow-100" :
                                                "bg-blue-50 text-blue-600 border-blue-100"
                                    )}>
                                        {task.Status || "Pending"}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 mt-2">
                                    <Link
                                        href={`/projects?id=${task.tasklists?.projects?.ProjectID}`}
                                        className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors bg-muted/50 px-3 py-1 rounded-full"
                                    >
                                        <Folder className="h-3 w-3" />
                                        {task.tasklists?.projects?.ProjectName}
                                    </Link>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                                        <Calendar className="h-3 w-3" />
                                        {task.DueDate ? new Date(task.DueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "No due date"}
                                    </span>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-black text-primary border border-primary/20">
                                            {task.users?.UserName?.[0] || "?"}
                                        </div>
                                        {task.users?.UserName || "Unassigned"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 justify-end">
                            <TaskItemActions taskId={task.TaskID} taskTitle={task.Title} />
                        </div>
                    </div>
                ))}

                {tasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center glass-card rounded-[3rem]">
                        <div className="rounded-full bg-muted p-8 mb-6 shadow-inner">
                            <Search className="h-12 w-12 text-muted-foreground/40" />
                        </div>
                        <h3 className="text-2xl font-black">No matches found</h3>
                        <p className="text-muted-foreground max-w-sm mt-2">Try adjusting your keywords or filters to find what you're looking for.</p>
                        <Link href="/search">
                            <Button variant="ghost" className="mt-8 font-bold">
                                Clear all filters
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

function SearchResultsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
            <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 rounded-[2rem] border bg-muted/20 animate-pulse" />
                ))}
            </div>
        </div>
    );
}
