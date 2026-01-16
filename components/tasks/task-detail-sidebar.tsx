"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    X,
    Clock,
    User,
    MoreHorizontal,
    Plus,
    Paperclip,
    CheckCircle2,
    AlertCircle,
    Activity,
    Trash2,
    Send,
    MessageCircle,
    MessageSquare,
    Tag,
    Calendar,
    Calendar as CalendarIcon,
    History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { updateTaskStatusAction, addCommentAction, deleteTaskAction } from "@/app/actions/tasks";

interface TaskDetailSidebarProps {
    task: any; // Task object with comments and history
    isOpen: boolean;
    onClose: () => void;
}

export function TaskDetailSidebar({ task, isOpen, onClose }: TaskDetailSidebarProps) {
    const router = useRouter();
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attachments, setAttachments] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (task && isOpen) {
            fetchAttachments();
        }
    }, [task, isOpen]);

    const fetchAttachments = async () => {
        try {
            const response = await fetch(`/api/tasks/${task.TaskID}/attachments`);
            if (response.ok) {
                const data = await response.json();
                setAttachments(data);
            }
        } catch (error) {
            console.error("Fetch attachments error:", error);
        }
    };

    if (!task) return null;

    const handleAddComment = async () => {
        if (!comment.trim()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/tasks/${task.TaskID}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content: comment }),
            });

            if (response.ok) {
                setComment("");
                // Trigger a refresh since we're using SSR/server components mostly but components are client
                router.refresh();
            }
        } catch (error) {
            console.error("Add comment error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`/api/tasks/${task.TaskID}/attachments`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                fetchAttachments();
                router.refresh();
            }
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleStatusUpdate = async (status: string) => {
        try {
            const response = await fetch(`/api/tasks/${task.TaskID}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                router.refresh();
            }
        } catch (error) {
            console.error("Status update error:", error);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Delete task "${task.Title}"?`)) return;
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/tasks/${task.TaskID}`, {
                method: "DELETE",
            });

            if (response.ok) {
                onClose();
                router.refresh();
            } else {
                const data = await response.json();
                alert(data.error || "Failed to delete task");
            }
        } catch (error) {
            console.error("Delete task error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm transition-opacity duration-500",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed right-0 top-0 z-[70] h-full w-full max-w-xl bg-card shadow-2xl transition-transform duration-500 ease-in-out border-l border-border/50 flex flex-col",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border/10">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg shadow-inner",
                            task.Priority === "High" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                        )}>
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest text-muted-foreground">TASK-{task.TaskID}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="p-2 rounded-full hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                            title="Delete Task"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-muted transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
                    {/* Title & Status */}
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black tracking-tight leading-tight">{task.Title}</h2>

                        <div className="flex flex-wrap gap-4">
                            <div className="space-y-1.5 flex-1 min-w-[200px]">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                    <Activity className="h-3 w-3" /> Status
                                </label>
                                <select
                                    className="w-full bg-muted/30 border border-border/50 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                    defaultValue={task.Status || "Pending"}
                                    onChange={(e) => handleStatusUpdate(e.target.value)}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                            <div className="space-y-1.5 flex-1 min-w-[200px]">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                    <Tag className="h-3 w-3" /> Priority
                                </label>
                                <div className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-bold border flex items-center justify-center gap-2",
                                    task.Priority === "High" ? "bg-red-50 border-red-100 text-red-600" : "bg-blue-50 border-blue-100 text-blue-600"
                                )}>
                                    <div className="h-2 w-2 rounded-full bg-current" />
                                    {task.Priority || "Medium"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Meta Data */}
                    <div className="grid grid-cols-2 gap-8 py-6 border-y border-border/10">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assignee</p>
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/20">
                                    {task.users?.UserName?.[0] || "?"}
                                </div>
                                <span className="text-sm font-bold">{task.users?.UserName || "Unassigned"}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Due Date</p>
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border/50">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-bold">
                                    {task.DueDate ? new Date(task.DueDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : "No due date"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</p>
                        <p className="text-sm leading-relaxed text-muted-foreground font-medium bg-muted/20 p-4 rounded-2xl border border-dashed">
                            {task.Description || "No description provided. Click to add more details about this task."}
                        </p>
                    </div>

                    {/* Attachments */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Attachments ({attachments.length})</p>
                            <label className="cursor-pointer">
                                <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                                <div className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
                                    <Plus className="h-3.5 w-3.5" />
                                    {isUploading ? "Uploading..." : "Add File"}
                                </div>
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {attachments.map((file) => (
                                <a
                                    key={file.AttachmentID}
                                    href={file.FilePath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-all group"
                                >
                                    <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                        <Paperclip className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold truncate">{file.FileName}</p>
                                        <p className="text-[8px] font-black uppercase text-muted-foreground/60">{(file.FileSize / 1024).toFixed(1)} KB</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Timeline / Activity */}
                    <div className="space-y-6 pt-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                                <History className="h-5 w-5 text-primary" />
                                Activity Feed
                            </h3>
                        </div>
                        <div className="space-y-6 relative ml-3">
                            <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-muted rounded-full" />
                            {/* Placeholder Activity */}
                            <div className="relative pl-6">
                                <div className="absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
                                <p className="text-xs">
                                    <span className="font-bold">System</span> created this task
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-1 font-bold">{new Date().toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer / Comments */}
                <div className="p-6 border-t border-border/10 bg-muted/10 backdrop-blur-md">
                    <form onSubmit={(e) => { e.preventDefault(); handleAddComment(); }} className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-background border flex items-center justify-center text-muted-foreground transition-all group-focus-within:text-primary group-focus-within:shadow-md">
                            <MessageSquare className="h-4 w-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="Write a comment..."
                            className="w-full h-12 rounded-2xl border bg-background pl-14 pr-12 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary shadow-sm"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            disabled={isSubmitting}
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                            disabled={!comment.trim() || isSubmitting}
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            </aside>
        </>
    );
}
