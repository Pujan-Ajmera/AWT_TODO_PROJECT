import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
    BarChart3,
    PieChart,
    TrendingUp,
    Users,
    CheckCircle2,
    Clock,
    AlertCircle,
    Activity,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function AnalyticsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    // Fetch Global Stats
    const [totalTasks, completedTasks, inProgressTasks, overdueTasks, totalProjects] = await Promise.all([
        prisma.tasks.count(),
        prisma.tasks.count({ where: { Status: "Completed" } }),
        prisma.tasks.count({ where: { Status: "In Progress" } }),
        prisma.tasks.count({
            where: {
                Status: { not: "Completed" },
                DueDate: { lt: new Date() }
            }
        }),
        prisma.projects.count()
    ]);

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Fetch Team Workload (Tasks per user)
    const teamStats = await prisma.users.findMany({
        select: {
            UserName: true,
            _count: {
                select: { tasks: true }
            }
        },
        take: 5
    });

    // Fetch Project Progress
    const projectStats = await prisma.projects.findMany({
        include: {
            tasklists: {
                include: {
                    tasks: {
                        select: { Status: true }
                    }
                }
            }
        },
        take: 4
    });

    const projectProgress = projectStats.map(project => {
        const tasks = project.tasklists.flatMap(tl => tl.tasks);
        const total = tasks.length;
        const completed = tasks.filter(t => t.Status === "Completed").length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { name: project.ProjectName, percent, total };
    });

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <BarChart3 className="h-6 w-6" />
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                            Reports & Analytics
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-lg ml-1">Deep dive into your team's productivity and project health.</p>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total Tasks" value={totalTasks} icon={Activity} color="text-blue-500" bg="bg-blue-50/50" trend={+12} />
                <StatCard label="Completion Rate" value={`${completionRate}%`} icon={CheckCircle2} color="text-green-500" bg="bg-green-50/50" trend={+5} />
                <StatCard label="Active Overdue" value={overdueTasks} icon={AlertCircle} color="text-red-500" bg="bg-red-50/50" trend={-2} />
                <StatCard label="Projects Live" value={totalProjects} icon={PieChart} color="text-purple-500" bg="bg-purple-50/50" trend={0} />
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Team Workload */}
                <div className="rounded-[2.5rem] border bg-card p-10 card-shadow flex flex-col">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                                <Users className="h-6 w-6 text-primary" />
                                Team Workload
                            </h2>
                            <p className="text-muted-foreground text-sm font-medium mt-1">Distribution of tasks across members.</p>
                        </div>
                    </div>

                    <div className="space-y-8 flex-1">
                        {teamStats.map((u, i) => (
                            <div key={i} className="space-y-3 group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20">
                                            {u.UserName[0]}
                                        </div>
                                        <span className="font-bold text-sm tracking-tight">{u.UserName}</span>
                                    </div>
                                    <span className="text-xs font-black text-muted-foreground group-hover:text-primary transition-colors">{u._count.tasks} Tasks</span>
                                </div>
                                <div className="h-3 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-1000 ease-out group-hover:shadow-[0_0_12px_rgba(var(--primary),0.4)]"
                                        style={{ width: `${(u._count.tasks / totalTasks) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Project Progress */}
                <div className="rounded-[2.5rem] border bg-card p-10 card-shadow">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                                <TrendingUp className="h-6 w-6 text-primary" />
                                Project Health
                            </h2>
                            <p className="text-muted-foreground text-sm font-medium mt-1">Completion percentage per project.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {projectProgress.map((p, i) => (
                            <div key={i} className="p-6 rounded-3xl bg-muted/20 border border-border/10 flex flex-col items-center text-center group hover:bg-muted/40 transition-all">
                                <div className="relative h-24 w-24 mb-4">
                                    <svg className="h-full w-full" viewBox="0 0 36 36">
                                        <path
                                            className="text-muted/30 stroke-current"
                                            strokeWidth="3"
                                            fill="none"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                        <path
                                            className="text-primary stroke-current transition-all duration-1000"
                                            strokeWidth="3"
                                            strokeDasharray={`${p.percent}, 100`}
                                            strokeLinecap="round"
                                            fill="none"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                        <span className="text-xl font-black">{p.percent}%</span>
                                    </div>
                                </div>
                                <h4 className="font-bold text-sm tracking-tight truncate w-full">{p.name}</h4>
                                <p className="text-[10px] font-black uppercase text-muted-foreground mt-1">{p.total} Total Tasks</p>
                            </div>
                        ))}
                        {projectProgress.length === 0 && <p className="col-span-2 text-center py-10 text-muted-foreground">No projects tracked yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, bg, trend }: any) {
    return (
        <div className="group relative overflow-hidden rounded-[2.5rem] border bg-card p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 card-shadow">
            <div className="flex items-start justify-between">
                <div className={cn("rounded-2xl p-4 shadow-inner", bg)}>
                    <Icon className={cn("h-7 w-7", color)} />
                </div>
                {trend !== 0 && (
                    <div className={cn(
                        "flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase",
                        trend > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    )}>
                        {trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div className="mt-8">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{label}</p>
                <h3 className="text-4xl font-black mt-2 tracking-tighter">{value}</h3>
            </div>
        </div>
    );
}
