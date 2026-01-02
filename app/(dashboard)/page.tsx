import {
    BarChart3,
    Calendar,
    Clock,
    MoreHorizontal,
    Plus,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import prisma from "@/lib/prisma";

export default async function DashboardPage() {
    // Fetch stats
    const [totalTasks, completedTasks, inProgressTasks, overdueTasks] = await Promise.all([
        prisma.tasks.count(),
        prisma.tasks.count({ where: { Status: "Completed" } }),
        prisma.tasks.count({ where: { Status: "In Progress" } }),
        prisma.tasks.count({
            where: {
                Status: { not: "Completed" },
                DueDate: { lt: new Date() }
            }
        })
    ]);

    // Fetch active tasks
    const activeTasks = await prisma.tasks.findMany({
        where: { Status: { not: "Completed" } },
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
        { label: "Total Tasks", value: totalTasks.toString(), icon: BarChart3, color: "text-blue-500" },
        { label: "Completed", value: completedTasks.toString(), icon: Clock, color: "text-green-500" },
        { label: "In Progress", value: inProgressTasks.toString(), icon: Clock, color: "text-yellow-500" },
        { label: "Overdue", value: overdueTasks.toString(), icon: Calendar, color: "text-red-500" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                    <p className="text-muted-foreground">Here's an overview of your projects and upcoming tasks.</p>
                </div>
                <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg hover:opacity-90 transition-opacity">
                    <Plus className="h-4 w-4" />
                    New Task
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <div key={i} className="rounded-xl border bg-card p-6 card-shadow card-shadow-hover">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                            <stat.icon className={cn("h-4 w-4", stat.color)} />
                        </div>
                        <div className="mt-2">
                            <span className="text-2xl font-bold">{stat.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border bg-card p-6 card-shadow">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Active Tasks</h2>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Filter tasks..."
                                className="h-8 w-48 rounded-md border bg-muted/50 pl-9 pr-3 text-xs outline-none focus:bg-background"
                            />
                        </div>
                    </div>
                    <div className="mt-6 space-y-4">
                        {activeTasks.map((task, i) => (
                            <div key={i} className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "h-2 w-2 rounded-full",
                                        task.Priority === "High" ? "bg-red-500" : task.Priority === "Medium" ? "bg-yellow-500" : "bg-blue-500"
                                    )} />
                                    <div>
                                        <p className="text-sm font-medium">{task.Title}</p>
                                        <p className="text-xs text-muted-foreground">{task.tasklists?.ListName || "No List"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {task.DueDate ? new Date(task.DueDate).toLocaleDateString() : "No Date"}
                                    </span>
                                    <button className="rounded p-1 hover:bg-muted">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {activeTasks.length === 0 && (
                            <p className="text-center text-sm text-muted-foreground py-8">No active tasks found.</p>
                        )}
                    </div>
                </div>

                <div className="col-span-3 rounded-xl border bg-card p-6 card-shadow">
                    <h2 className="text-xl font-semibold">Activity Feed</h2>
                    <div className="mt-6 space-y-6">
                        {recentActivity.map((activity, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                                    {activity.users?.UserName?.[0] || "?"}
                                </div>
                                <div>
                                    <p className="text-sm">
                                        <span className="font-semibold">{activity.users?.UserName || "Unknown User"}</span> {activity.ChangeType}{" "}
                                        <span className="font-medium text-primary">{activity.tasks?.Title || "Task"}</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {activity.ChangeTime ? new Date(activity.ChangeTime).toLocaleString() : "Recently"}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {recentActivity.length === 0 && (
                            <p className="text-center text-sm text-muted-foreground py-8">No recent activity.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
