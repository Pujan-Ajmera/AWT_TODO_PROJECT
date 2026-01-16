import { getCurrentUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import {
    Layout,
    Settings,
    Filter,
    Search,
    Plus,
    Users,
    ChevronDown
} from "lucide-react";
import Link from "next/link";
import { ProjectViewContainer } from "@/components/projects/project-view-container";
import { TaskFilters } from "@/components/projects/task-filters";
import { ProjectHeaderActions } from "@/components/projects/project-header-actions";
import { cn } from "@/lib/utils";

export default async function ProjectDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ q?: string; priority?: string; status?: string; view?: string }>;
}) {
    const user = await getCurrentUser();
    if (!user) redirect("/");

    const { id } = await params;
    const { q, priority, status, view = "kanban" } = await searchParams;
    const projectId = parseInt(id);

    const project = await prisma.projects.findUnique({
        where: { ProjectID: projectId },
        include: {
            tasklists: {
                include: {
                    tasks: {
                        where: {
                            AND: [
                                q ? {
                                    OR: [
                                        { Title: { contains: q } },
                                        { Description: { contains: q } },
                                    ]
                                } : {},
                                priority ? { Priority: priority } : {},
                                status ? { Status: status } : {},
                            ]
                        },
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
            },
            project_members: {
                include: {
                    users: {
                        select: { UserName: true, Email: true }
                    }
                }
            }
        }
    });

    if (!project) {
        notFound();
    }

    // Cast project to any for now to avoid complex Prisma type issues with the container
    const projectData = project as any;

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

                <ProjectHeaderActions
                    project={{
                        ProjectID: project.ProjectID,
                        ProjectName: project.ProjectName,
                        Description: project.Description
                    }}
                    members={project.project_members}
                />
            </header>

            <div className="flex items-center justify-between border-b pb-4 px-2">
                <div className="flex items-center gap-6">
                    <Link
                        href={`/projects/${id}?view=kanban${q ? `&q=${q}` : ""}`}
                        className={cn(
                            "text-sm pb-4 -mb-[18px] px-2 transition-all font-bold",
                            view === "kanban" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Kanban Board
                    </Link>
                    <Link
                        href={`/projects/${id}?view=list${q ? `&q=${q}` : ""}`}
                        className={cn(
                            "text-sm pb-4 -mb-[18px] px-2 transition-all font-bold",
                            view === "list" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Task List
                    </Link>
                    <Link
                        href={`/projects/${id}?view=files${q ? `&q=${q}` : ""}`}
                        className={cn(
                            "text-sm pb-4 -mb-[18px] px-2 transition-all font-bold",
                            view === "files" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Files
                    </Link>
                    <Link
                        href={`/projects/${id}?view=timeline${q ? `&q=${q}` : ""}`}
                        className={cn(
                            "text-sm pb-4 -mb-[18px] px-2 transition-all font-bold",
                            view === "timeline" ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Timeline
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <form action={`/projects/${id}`} method="GET">
                            <input
                                name="q"
                                type="text"
                                defaultValue={q}
                                placeholder="Find tasks..."
                                className="h-9 w-48 rounded-full border bg-muted/20 pl-9 pr-4 text-xs outline-none focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all focus:w-64"
                            />
                            <input type="hidden" name="view" value={view} />
                            {priority && <input type="hidden" name="priority" value={priority} />}
                            {status && <input type="hidden" name="status" value={status} />}
                        </form>
                    </div>

                    <TaskFilters priority={priority} status={status} />
                </div>
            </div>

            <ProjectViewContainer project={projectData} view={view} q={q} />
        </div>
    );
}
