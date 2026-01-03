import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    Calendar as CalendarIcon,
    Filter,
    Search,
    ChevronRight,
    Layout
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { TaskItemActions } from "@/components/tasks/task-item-actions";

export default async function MyTasksPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string }>;
}) {
    const user = await getCurrentUser();
    if (!user) redirect("/");

    const { status } = await searchParams;

    const tasks = await prisma.tasks.findMany({
        where: {
            AssignedTo: user.userId,
            Status: status ? status : undefined,
        },
        include: {
            tasklists: {
                include: {
                    projects: {
                        select: { ProjectName: true, ProjectID: true }
                    }
                }
            }
        },
        orderBy: [
            { Status: "asc" },
            { DueDate: "asc" }
        ]
    });

    const statusFilters = [
        { label: "All Tasks", value: "" },
        { label: "Pending", value: "Pending" },
        { label: "In Progress", value: "In Progress" },
        { label: "Completed", value: "Completed" },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-12 animate-in fade-in duration-700">
            <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        My Tasks
                    </h1>
                    <p className="text-muted-foreground text-lg">Focus on what's assigned to you.</p>
                </div>
                <div className="flex gap-2 bg-muted/30 p-1 rounded-2xl border border-border/50 backdrop-blur-md">
                    {statusFilters.map((f) => (
                        <Link
                            key={f.label}
                            href={f.value ? `/my-tasks?status=${f.value}` : "/my-tasks"}
                            className={cn(
                                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                (status === f.value || (!status && !f.value))
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "hover:bg-muted text-muted-foreground"
                            )}
                        >
                            {f.label}
                        </Link>
                    ))}
                </div>
            </header>

            <div className="space-y-4">
                {tasks.map((task) => (
                    <div key={task.TaskID} className="group relative rounded-[2rem] border bg-card/50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 hover:shadow-xl hover:bg-card border-border/50 hover:border-primary/20 card-shadow">
                        <div className="flex items-center gap-6 flex-1">
                            <div className={cn(
                                "flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner",
                                task.Status === "Completed" ? "bg-green-100 text-green-600" :
                                    task.Priority === "High" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                            )}>
                                {task.Status === "Completed" ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h3 className={cn(
                                        "text-xl font-bold tracking-tight",
                                        task.Status === "Completed" && "text-muted-foreground line-through decoration-2"
                                    )}>
                                        {task.Title}
                                    </h3>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                        task.Priority === "High" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                                    )}>
                                        {task.Priority}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-4">
                                    <Link
                                        href={`/projects/${task.tasklists?.projects?.ProjectID}`}
                                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
                                    >
                                        <Layout className="h-3 w-3" />
                                        {task.tasklists?.projects?.ProjectName || "General"}
                                    </Link>
                                    <span className="text-muted-foreground/30">•</span>
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {task.tasklists?.ListName || "No List"}
                                    </span>
                                    {task.DueDate && (
                                        <>
                                            <span className="text-muted-foreground/30">•</span>
                                            <span className={cn(
                                                "text-xs font-bold flex items-center gap-1.5",
                                                new Date(task.DueDate) < new Date() && task.Status !== "Completed" ? "text-red-500" : "text-muted-foreground"
                                            )}>
                                                <CalendarIcon className="h-3 w-3" />
                                                {new Date(task.DueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 ml-auto md:ml-0">
                            <div className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                                task.Status === "Completed" ? "bg-green-50 border-green-100 text-green-700" : "bg-muted border-border/50 text-muted-foreground"
                            )}>
                                {task.Status}
                            </div>
                            <TaskItemActions taskId={task.TaskID} taskTitle={task.Title} />
                        </div>
                    </div>
                ))}

                {tasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-muted/20 rounded-[3rem] border-2 border-dashed">
                        <div className="rounded-full bg-muted p-8">
                            <CheckCircle2 className="h-12 w-12 text-muted-foreground/40" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold">You're all caught up!</h3>
                            <p className="text-muted-foreground max-w-sm">No tasks found matching your current filters.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
