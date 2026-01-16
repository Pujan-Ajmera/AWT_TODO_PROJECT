"use client";

import { useState } from "react";
import { KanbanBoard } from "./kanban-board";
import { TaskDetailSidebar } from "@/components/tasks/task-detail-sidebar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
    Search,
    Filter,
    Plus,
    Users,
    Settings,
    Layout,
    ChevronDown
} from "lucide-react";

interface Task {
    TaskID: number;
    Title: string;
    Description: string | null;
    Priority: string | null;
    Status: string | null;
    DueDate: string | Date | null;
    users: { UserName: string } | null;
}

interface TaskList {
    ListID: number;
    ListName: string;
    tasks: Task[];
}

interface ProjectViewContainerProps {
    project: {
        ProjectID: number;
        ProjectName: string;
        tasklists: TaskList[];
        users: { UserName: string; Email: string } | null;
    };
    view: string;
    q?: string;
}

export function ProjectViewContainer({ project, view, q }: ProjectViewContainerProps) {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsSidebarOpen(true);
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex-1 overflow-x-auto pb-8 scrollbar-hide">
                {view === "kanban" ? (
                    <KanbanBoard project={project} onTaskClick={handleTaskClick} />
                ) : view === "list" ? (
                    <div className="bg-card rounded-[2.5rem] border border-border/50 overflow-hidden card-shadow">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/10">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Task</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Priority</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assigned To</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Due Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/10">
                                {project.tasklists.flatMap(list => list.tasks).map((task) => (
                                    <tr
                                        key={task.TaskID}
                                        className="group hover:bg-muted/20 transition-colors cursor-pointer"
                                        onClick={() => handleTaskClick(task)}
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-base group-hover:text-primary transition-colors">{task.Title}</span>
                                                <span className="text-xs text-muted-foreground font-medium">TASK-{task.TaskID}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={cn(
                                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase",
                                                task.Status === "Completed" ? "bg-green-100 text-green-700" :
                                                    task.Status === "In Progress" ? "bg-blue-100 text-blue-700" :
                                                        "bg-yellow-100 text-yellow-700"
                                            )}>
                                                {task.Status || "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 text-xs font-bold",
                                                task.Priority === "High" ? "text-red-600" :
                                                    task.Priority === "Medium" ? "text-yellow-600" :
                                                        "text-blue-600"
                                            )}>
                                                <div className={cn("h-1.5 w-1.5 rounded-full",
                                                    task.Priority === "High" ? "bg-red-600" :
                                                        task.Priority === "Medium" ? "bg-yellow-600" :
                                                            "bg-blue-600"
                                                )} />
                                                {task.Priority || "Medium"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20">
                                                    {task.users?.UserName?.[0] || "?"}
                                                </div>
                                                <span className="text-sm font-medium">{task.users?.UserName || "Unassigned"}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {task.DueDate ? new Date(task.DueDate).toLocaleDateString() : "No date"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {project.tasklists.flatMap(list => list.tasks).length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-12 text-center text-muted-foreground font-bold">
                                            No tasks found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : view === "files" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* 
                            Note: We need to fetch attachments for the whole project. 
                            For now, since we only have tasks in project.tasklists, we'd need to fetch attachments separately.
                            Or show a message that files are associated with tasks.
                        */}
                        <div className="col-span-full bg-card p-12 rounded-[2.5rem] border border-dashed flex flex-col items-center justify-center text-center space-y-4">
                            <div className="h-16 w-16 rounded-3xl bg-primary/5 flex items-center justify-center text-primary/40">
                                <Plus className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Project Files</h3>
                                <p className="text-muted-foreground max-w-sm">Files are managed within individual tasks. Open a task to view and upload attachments.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-card p-12 rounded-[2.5rem] border border-border/50 card-shadow">
                        <h3 className="text-xl font-bold mb-6">Project Timeline</h3>
                        <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-border/50 before:h-full">
                            {project.tasklists.flatMap(list => list.tasks)
                                .sort((a, b) => new Date(a.DueDate || 0).getTime() - new Date(b.DueDate || 0).getTime())
                                .map((task) => (
                                    <div key={task.TaskID} className="relative pl-12 group cursor-pointer" onClick={() => handleTaskClick(task)}>
                                        <div className="absolute left-2.5 top-1.5 h-3.5 w-3.5 rounded-full bg-background border-2 border-primary ring-4 ring-primary/10 z-10" />
                                        <div className="p-4 rounded-2xl border bg-muted/20 group-hover:bg-muted/40 transition-all border-border/30">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-black text-primary uppercase tracking-widest">
                                                    {task.DueDate ? new Date(task.DueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "No Date"}
                                                </span>
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg",
                                                    task.Status === "Completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                                )}>
                                                    {task.Status}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{task.Title}</h4>
                                            <p className="text-sm text-muted-foreground line-clamp-1">{task.Description || "No description"}</p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>

            <TaskDetailSidebar
                task={selectedTask}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
        </div>
    );
}
