import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
    Plus,
    Search,
    Layout,
    MoreHorizontal,
    Users,
    Calendar,
    ArrowRight,
    FolderOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ProjectListClient } from "./project-list-client";
import { ProjectActions } from "@/components/projects/project-actions";

export default async function ProjectsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const user = await getCurrentUser();
    if (!user) redirect("/");

    const { q } = await searchParams;

    // Fetch all projects (for now, eventually filter by membership)
    const projects = await prisma.projects.findMany({
        where: q ? {
            OR: [
                { ProjectName: { contains: q } },
                { Description: { contains: q } },
            ]
        } : undefined,
        include: {
            _count: {
                select: { tasklists: true }
            },
            users: {
                select: { UserName: true }
            }
        },
        orderBy: { CreatedAt: "desc" }
    });

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Projects
                    </h1>
                    <p className="text-muted-foreground text-lg">Manage and organize your team's workspace.</p>
                </div>
                <ProjectListClient />
            </header>

            <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-card/30 backdrop-blur-md p-6 rounded-3xl border border-border/50">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <form action="/projects" method="GET">
                        <input
                            name="q"
                            type="text"
                            defaultValue={q}
                            placeholder="Search projects..."
                            className="w-full h-12 rounded-2xl border bg-background/50 pl-12 pr-4 text-sm outline-none transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary"
                        />
                    </form>
                </div>

                <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-xl border bg-background text-sm font-semibold hover:bg-muted transition-all">
                        All Status
                    </button>
                    <button className="px-4 py-2 rounded-xl border bg-background text-sm font-semibold hover:bg-muted transition-all">
                        Most Recent
                    </button>
                </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {projects.map((project, i) => (
                    <Link
                        key={project.ProjectID}
                        href={`/projects/${project.ProjectID}`}
                        className="group relative flex flex-col rounded-[2.5rem] border bg-card p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 card-shadow overflow-hidden"
                    >
                        {/* Decorative background element */}
                        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors" />

                        <div className="flex items-start justify-between mb-8">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                                <Layout className="h-7 w-7" />
                            </div>
                            <ProjectActions projectId={project.ProjectID} projectName={project.ProjectName} />
                        </div>

                        <div className="flex-1 space-y-3">
                            <h3 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                                {project.ProjectName}
                            </h3>
                            <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                                {project.Description || "No description provided for this project."}
                            </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center -space-x-2">
                                    {[1, 2, 3].map((n) => (
                                        <div key={n} className="h-8 w-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold">
                                            U
                                        </div>
                                    ))}
                                    <div className="h-8 w-8 rounded-full border-2 border-card bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                                        +5
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                    <Users className="h-3.5 w-3.5" />
                                    8 members
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-primary">
                                <span className="text-xs font-bold uppercase tracking-widest">Open</span>
                                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                ))}

                {projects.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center space-y-6 bg-muted/20 rounded-[3rem] border-2 border-dashed">
                        <div className="rounded-full bg-muted p-8">
                            <FolderOpen className="h-12 w-12 text-muted-foreground/40" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold">No projects found</h3>
                            <p className="text-muted-foreground max-w-sm">
                                {q ? `We couldn't find any projects matching "${q}"` : "Get started by creating your very first project."}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
