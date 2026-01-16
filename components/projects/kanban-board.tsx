"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    MoreHorizontal,
    GripVertical,
    Clock,
    MessageSquare,
    Paperclip,
    Calendar,
    CheckCircle2,
    Activity,
    Info,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createTaskListAction } from "@/app/actions/projects";
import { createTaskAction } from "@/app/actions/tasks";
import { TaskDetailSidebar } from "@/components/tasks/task-detail-sidebar";
import { ListItemActions } from "@/components/projects/list-actions";

function InlineAddTask({ listId }: { listId: number }) {
    const router = useRouter();
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    listId: listId.toString(),
                }),
            });

            if (response.ok) {
                setTitle("");
                setIsAdding(false);
                // Trigger a refresh since we're using SSR/server components mostly but components are client
                router.refresh();
            }
        } catch (err) {
            console.error("Inline task add error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAdding) {
        return (
            <button
                onClick={() => setIsAdding(true)}
                className="w-full py-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-muted text-sm font-bold text-muted-foreground hover:bg-muted/30 hover:border-primary/20 hover:text-primary transition-all group/add"
            >
                <Plus className="h-4 w-4 group-hover/add:scale-110 transition-transform" />
                Add a new task
            </button>
        );
    }

    return (
        <div className="bg-card rounded-2xl border p-4 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    autoFocus
                    placeholder="Task title..."
                    className="w-full bg-transparent text-sm font-bold outline-none"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isLoading}
                />
                <div className="flex gap-2">
                    <Button type="submit" size="sm" className="h-8 rounded-lg text-xs" disabled={!title.trim() || isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-lg text-xs"
                        onClick={() => setIsAdding(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}

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

interface KanbanBoardProps {
    project: {
        ProjectID: number;
        ProjectName: string;
        tasklists: TaskList[];
    };
    onTaskClick?: (task: Task) => void;
}

export function KanbanBoard({ project, onTaskClick }: KanbanBoardProps) {
    const router = useRouter();
    const [isCreatingList, setIsCreatingList] = useState(false);
    const [newListName, setNewListName] = useState("");
    // Removed internal sidebar state as it is now managed by the parent container

    const handleCreateList = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newListName.trim()) return;

        try {
            const response = await fetch("/api/task-lists", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    projectId: project.ProjectID.toString(),
                    name: newListName,
                }),
            });

            if (response.ok) {
                setNewListName("");
                setIsCreatingList(false);
                router.refresh();
            }
        } catch (error) {
            console.error("Create list error:", error);
        }
    };

    const handleTaskClick = (task: Task) => {
        if (onTaskClick) {
            onTaskClick(task);
        }
    };

    const handleDragStart = (e: React.DragEvent, taskId: number) => {
        e.dataTransfer.setData("taskId", taskId.toString());
        e.dataTransfer.effectAllowed = "move";
        // Add a class for styling while dragging if needed
        const target = e.target as HTMLElement;
        target.classList.add("opacity-50");
    };

    const handleDragEnd = (e: React.DragEvent) => {
        const target = e.target as HTMLElement;
        target.classList.remove("opacity-50");
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = async (e: React.DragEvent, listId: number) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("taskId");
        if (!taskId) return;

        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    listId: listId.toString(),
                }),
            });

            if (response.ok) {
                router.refresh();
            }
        } catch (error) {
            console.error("Task move error:", error);
        }
    };

    return (
        <div className="flex gap-8 pb-6 items-start overflow-x-auto min-h-[calc(100vh-320px)]">
            {project.tasklists.map((list) => (
                <div
                    key={list.ListID}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, list.ListID)}
                    className="flex-shrink-0 w-[350px] flex flex-col max-h-[calc(100vh-280px)] group/list"
                >
                    <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex items-center gap-2">
                            <h3 className="font-black text-lg tracking-tight uppercase truncate max-w-[200px]">{list.ListName}</h3>
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-black group-hover/list:bg-primary/10 group-hover/list:text-primary transition-colors">
                                {list.tasks.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-all opacity-0 group-hover/list:opacity-100" title="Add task">
                                <Plus className="h-4 w-4" />
                            </button>
                            <ListItemActions listId={list.ListID} listName={list.ListName} />
                        </div>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto pr-2 pb-4 scrollbar-thin scrollbar-thumb-muted-foreground/10 hover:scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent min-h-[100px]">
                        {list.tasks.map((task) => (
                            <div
                                key={task.TaskID}
                                draggable="true"
                                onDragStart={(e) => handleDragStart(e, task.TaskID)}
                                onDragEnd={handleDragEnd}
                                onClick={() => handleTaskClick(task)}
                                className="group/card relative rounded-2xl border bg-card/80 p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:bg-card hover:-translate-y-1 hover:border-primary/20 cursor-grab active:cursor-grabbing card-shadow"
                            >
                                {/* Priority Indicator */}
                                <div className={cn(
                                    "absolute top-5 right-5 h-2 w-2 rounded-full",
                                    task.Priority === "High" ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" :
                                        task.Priority === "Medium" ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" :
                                            "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                )} />

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-base leading-tight group-hover/card:text-primary transition-colors pr-4">
                                            {task.Title}
                                        </h4>
                                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                            <span className="text-primary/60 font-black">#</span>
                                            TASK-{task.TaskID}
                                        </p>
                                    </div>

                                    {task.Description && (
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                            {task.Description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-3">
                                            <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-black border border-background shadow-sm overflow-hidden">
                                                {task.users?.UserName?.[0] || "?"}
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <div className="flex items-center gap-1 text-[10px] font-bold">
                                                    <MessageSquare className="h-3 w-3" />
                                                    2
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] font-bold">
                                                    <Paperclip className="h-3 w-3" />
                                                    1
                                                </div>
                                            </div>
                                        </div>

                                        {task.DueDate && (
                                            <div className={cn(
                                                "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg",
                                                new Date(task.DueDate) < new Date() ? "bg-red-50 text-red-600" : "bg-muted text-muted-foreground"
                                            )}>
                                                <Clock className="h-3 w-3" />
                                                {new Date(task.DueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <InlineAddTask listId={list.ListID} />
                    </div>
                </div>
            ))}

            {isCreatingList ? (
                <div className="flex-shrink-0 w-[350px] p-6 rounded-[2rem] border bg-card/50 backdrop-blur-sm card-shadow animate-in slide-in-from-right-4 duration-300">
                    <form onSubmit={handleCreateList} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">List Title</label>
                            <input
                                autoFocus
                                type="text"
                                placeholder="e.g. In Progress"
                                className="w-full h-11 rounded-xl border bg-background px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button type="submit" className="flex-1 rounded-xl font-bold shadow-lg shadow-primary/20">Add List</Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className="rounded-xl font-bold"
                                onClick={() => setIsCreatingList(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            ) : (
                <button
                    onClick={() => setIsCreatingList(true)}
                    className="flex-shrink-0 w-[350px] h-[72px] flex items-center justify-center gap-3 rounded-[2rem] border-2 border-dashed border-muted text-sm font-black text-muted-foreground hover:bg-muted/30 hover:border-primary/20 hover:text-primary transition-all group/newList"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 group-hover/newList:bg-primary/10 transition-colors">
                        <Plus className="h-5 w-5 group-hover/newList:scale-110 transition-transform" />
                    </div>
                    Create new list
                </button>
            )}

        </div>
    );
}
