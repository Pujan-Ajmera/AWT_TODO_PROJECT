import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import {
    Layout,
    Settings,
    Filter,
    Search,
    MoreHorizontal,
    Plus,
    Users,
    ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { KanbanBoard } from "@/components/projects/kanban-board";
import Link from "next/link";

export default async function ProjectDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const user = await getCurrentUser();
    if (!user) redirect("/");

    const { id } = await params;
    const projectId = parseInt(id);

    const project = await prisma.projects.findUnique({
        where: { ProjectID: projectId },
        include: {
            tasklists: {
                include: {
                    tasks: {
                        include: {
                            users: {
                                select: { UserName: true }
                            }
                        },
                        orderBy: { CreatedAt: "desc" }
                    }
                }
            },
            users: {
                select: { UserName: true, Email: true }
            }
        }
    });

    if (!project) {
        notFound();
    }

    // Ensure we have some default lists if none exist
    if (project.tasklists.length === 0) {
        // We could create default lists here, but for now we'll just show an empty board or handle it in the component
    }

    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-700">
            <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between px-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Link href="/projects" className="text-sm font-medium hover:text-primary transition-colors">Projects</Link>
                        <span className="text-muted-foreground/50">/</span>
                        <span className="text-sm font-bold text-foreground">{project.ProjectName}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-black tracking-tight">{project.ProjectName}</h1>
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase tracking-widest">
                            Active
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex -space-x-3 mr-4">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="h-10 w-10 rounded-full border-4 border-background bg-muted flex items-center justify-center text-xs font-bold shadow-sm">
                                {project.users?.UserName?.[0] || "U"}
                            </div>
                        ))}
                        <button className="h-10 w-10 rounded-full border-4 border-background bg-primary/10 text-primary flex items-center justify-center text-xs font-bold hover:bg-primary/20 transition-colors shadow-sm">
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="h-8 w-[1px] bg-border mx-2" />
                    <button className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted transition-all active:scale-95 shadow-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        Invite
                    </button>
                    <button className="p-2.5 rounded-xl border bg-card hover:bg-muted transition-all active:scale-95 shadow-sm">
                        <Settings className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>
            </header>

            <div className="flex items-center justify-between border-b pb-4 px-2">
                <div className="flex items-center gap-6">
                    <button className="text-sm font-bold border-b-2 border-primary pb-4 -mb-[18px] px-2">Kanban Board</button>
                    <button className="text-sm font-medium text-muted-foreground hover:text-foreground pb-4 -mb-[18px] px-2 transition-colors">Task List</button>
                    <button className="text-sm font-medium text-muted-foreground hover:text-foreground pb-4 -mb-[18px] px-2 transition-colors">Files</button>
                    <button className="text-sm font-medium text-muted-foreground hover:text-foreground pb-4 -mb-[18px] px-2 transition-colors">Timeline</button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Find tasks..."
                            className="h-9 w-48 rounded-full border bg-muted/20 pl-9 pr-4 text-xs outline-none focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all focus:w-64"
                        />
                    </div>
                    <button className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-bold hover:bg-muted transition-all shadow-sm">
                        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                        Filter
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto pb-8 scrollbar-hide">
                <KanbanBoard project={project} />
            </div>
        </div>
    );
}
