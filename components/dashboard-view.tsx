
import {
    BarChart3,
    Calendar,
    Clock,
    MoreHorizontal,
    Plus,
    Search,
    CheckCircle2,
    AlertCircle,
    Activity,
    ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { QuickCreateTask } from "@/components/tasks/quick-create-task";
import { CaptureNewButton } from "@/components/dashboard/capture-new-button";
import { TaskItemActions } from "@/components/tasks/task-item-actions";
import Link from "next/link";
import { TaskSearchInput } from "./dashboard/task-search-input";

interface DashboardViewProps {
    user: {
        userId: number;
        name: string;
        email: string;
    };
    q?: string;
}

export async function DashboardView({ user, q }: DashboardViewProps) {
    // Fetch stats for the logged-in user
    const [totalTasks, completedTasks, inProgressTasks, overdueTasks] = await Promise.all([
        prisma.tasks.count({ where: { AssignedTo: user.userId } }),
        prisma.tasks.count({ where: { AssignedTo: user.userId, Status: "Completed" } }),
        prisma.tasks.count({ where: { AssignedTo: user.userId, Status: "In Progress" } }),
        prisma.tasks.count({
            where: {
                AssignedTo: user.userId,
                Status: { not: "Completed" },
                DueDate: { lt: new Date() }
            }
        })
    ]);

    // Fetch active tasks for the logged-in user
    const activeTasks = await prisma.tasks.findMany({
        where: {
            AssignedTo: user.userId,
            Status: { not: "Completed" },
            OR: q ? [
                { Title: { contains: q } },
                { Description: { contains: q } }
            ] : undefined
        },
        take: 5,
        orderBy: { CreatedAt: "desc" },
        include: {
            tasklists: {
                select: { ListName: true }
            }
        }
    });

    // Fetch recent activity
    const recentActivity = await prisma.taskhistory.findMany({
        take: 5,
        orderBy: { ChangeTime: "desc" },
        include: {
            users: { select: { UserName: true } },
            tasks: { select: { Title: true } }
        }
    });

    const stats = [
        { label: "Total Tasks", value: totalTasks, icon: BarChart3, color: "text-blue-500", bg: "bg-blue-50/50", href: "/my-tasks" },
        { label: "Completed", value: completedTasks, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50/50", href: "/my-tasks?status=Completed" },
        { label: "In Progress", value: inProgressTasks, icon: Activity, color: "text-yellow-600", bg: "bg-yellow-50/50", href: "/my-tasks?status=In Progress" },
        { label: "Overdue", value: overdueTasks, icon: AlertCircle, color: "text-red-500", bg: "bg-red-50/50", href: "/my-tasks" },
    ];

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Hello, {user.name.split(' ')[0]}
                    </h1>
                    <p className="text-muted-foreground text-lg">Here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/my-tasks"
                        className="hidden sm:flex items-center gap-2 rounded-full border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-muted transition-all active:scale-95 shadow-sm focus:ring-4 focus:ring-primary/10 outline-none"
                        aria-label="View all your tasks"
                    >
                        View All Tasks
                    </Link>
                    <CaptureNewButton />
                </div>
            </header>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <div key={i} className={cn(
                        "group relative overflow-hidden rounded-3xl border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 card-shadow",
                        "after:absolute after:inset-0 after:bg-gradient-to-br after:from-primary/5 after:to-transparent after:opacity-0 hover:after:opacity-100"
                    )}>
                        <div className="flex items-start justify-between">
                            <div className={cn("rounded-2xl p-3 shadow-inner", stat.bg)}>
                                <stat.icon className={cn("h-6 w-6", stat.color)} />
                            </div>
                            <Link
                                href={stat.href}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-muted focus:opacity-100 outline-none focus:ring-2 focus:ring-primary/20"
                                aria-label={`View details for ${stat.label}`}
                            >
                                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                        </div>
                        <div className="mt-6">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-4xl font-black mt-1">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-12 xl:col-span-8 space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold tracking-tight">Focus Zone</h2>
                        </div>
                        <QuickCreateTask />
                    </div>

                    <div className="rounded-3xl border bg-card/50 backdrop-blur-sm p-8 card-shadow">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Active Tasks</h2>
                                <p className="text-muted-foreground text-sm">Your most urgent assignments.</p>
                            </div>
                            <TaskSearchInput initialValue={q} />
                        </div>

                        <div className="space-y-4">
                            {activeTasks.map((task, i) => (
                                <div key={i} className="group relative flex items-center justify-between rounded-2xl border bg-background/50 p-5 hover:bg-muted/30 transition-all hover:border-primary/20 hover:shadow-lg">
                                    <div className="flex items-center gap-5">
                                        <div className={cn(
                                            "flex h-10 w-10 items-center justify-center rounded-xl",
                                            task.Priority === "High" ? "bg-red-100 text-red-600" : task.Priority === "Medium" ? "bg-yellow-100 text-yellow-600" : "bg-blue-100 text-blue-600"
                                        )}>
                                            <div className="h-2.5 w-2.5 rounded-full bg-current animate-pulse" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{task.Title}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                                    {task.tasklists?.ListName || "General"}
                                                </span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {task.DueDate ? new Date(task.DueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "Someday"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <TaskItemActions taskId={task.TaskID} taskTitle={task.Title} />
                                    </div>
                                </div>
                            ))}
                            {activeTasks.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="rounded-full bg-muted p-6 mb-4">
                                        <CheckCircle2 className="h-10 w-10 text-muted-foreground/40" />
                                    </div>
                                    <h3 className="text-xl font-bold">Inbox Zero</h3>
                                    <p className="text-muted-foreground">You've cleared all your active tasks. Nice!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-12 xl:col-span-4 space-y-8">
                    <div className="rounded-3xl border bg-card p-8 card-shadow h-full">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold tracking-tight">Global Pulse</h2>
                            <Activity className="h-5 w-5 text-primary animate-pulse" />
                        </div>
                        <div className="space-y-8 relative">
                            {/* Vertical timeline line */}
                            <div className="absolute left-4 top-2 bottom-2 w-[2px] bg-gradient-to-b from-primary/20 via-muted to-transparent rounded-full" />

                            {recentActivity.map((activity, i) => (
                                <div key={i} className="relative flex gap-6 pl-10 group">
                                    <div className="absolute left-0 top-1 h-8 w-8 rounded-xl bg-background border shadow-sm flex items-center justify-center text-xs font-bold group-hover:scale-110 transition-transform z-10">
                                        {activity.users?.UserName?.[0] || "?"}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm leading-relaxed">
                                            <span className="font-extrabold text-foreground">{activity.users?.UserName || "System"}</span>
                                            <span className="text-muted-foreground mx-1.5">{activity.ChangeType}</span>
                                            <span className="font-bold text-primary">{activity.tasks?.Title || "Task"}</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                                            <Clock className="h-3 w-3" />
                                            {activity.ChangeTime ? new Date(activity.ChangeTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {recentActivity.length === 0 && (
                                <p className="text-center text-sm text-muted-foreground py-12">No frequency detected.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
