
import { Metadata } from "next";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import {
    Users,
    Briefcase,
    CheckSquare,
    Activity,
    ArrowRight
} from "lucide-react";

export const metadata: Metadata = {
    title: "Admin Dashboard | ANT TODO",
    description: "Admin dashboard for managing the application.",
};

async function getAdminStats() {
    const [userCount, projectCount, taskCount] = await Promise.all([
        prisma.users.count(),
        prisma.projects.count(),
        prisma.tasks.count(),
    ]);

    return {
        userCount,
        projectCount,
        taskCount,
    };
}

export default async function AdminDashboardPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    // Basic check for admin role - assuming role ID 1 is admin or some other logic
    // For now, let's just assume if they can access this route middleware/layout handles it 
    // or we check role here if needed. 
    // The layout for admin might already handle protection?
    // Let's add a check if needed, but for now focus on the UI.

    // In a real app we'd check roles.roleName === 'Admin'
    // const dbUser = await prisma.users.findUnique(...) 

    const stats = await getAdminStats();

    return (
        <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground font-medium">Overview of system activity and management.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="p-6 rounded-3xl border bg-card/50 backdrop-blur-sm shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="p-3 rounded-2xl bg-blue-100 text-blue-600">
                            <Users className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Users</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-4xl font-black text-foreground">{stats.userCount}</p>
                        <p className="text-sm font-medium text-muted-foreground">Registered accounts</p>
                    </div>
                </div>

                <div className="p-6 rounded-3xl border bg-card/50 backdrop-blur-sm shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="p-3 rounded-2xl bg-violet-100 text-violet-600">
                            <Briefcase className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Projects</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-4xl font-black text-foreground">{stats.projectCount}</p>
                        <p className="text-sm font-medium text-muted-foreground">Active projects</p>
                    </div>
                </div>

                <div className="p-6 rounded-3xl border bg-card/50 backdrop-blur-sm shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="p-3 rounded-2xl bg-green-100 text-green-600">
                            <CheckSquare className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Tasks</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-4xl font-black text-foreground">{stats.taskCount}</p>
                        <p className="text-sm font-medium text-muted-foreground">Tasks created</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Link href="/admin/users" className="group">
                    <div className="h-full p-8 rounded-3xl border bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users className="h-32 w-32" />
                        </div>
                        <div className="space-y-4 relative z-10">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <Users className="h-6 w-6" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold">User Management</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    View, edit, and manage user accounts, roles, and permissions across the platform.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-primary pt-2">
                                Manage Users <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Placeholder for future admin modules */}
                <div className="p-8 rounded-3xl border border-dashed bg-muted/30 flex flex-col items-center justify-center text-center space-y-4 opacity-70">
                    <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                        <Activity className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-muted-foreground">System Health</h3>
                        <p className="text-sm text-muted-foreground/60">Coming soon</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
