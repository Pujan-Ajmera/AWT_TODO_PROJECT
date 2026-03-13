"use client";

import { useState, useEffect } from "react";
import { Plus, Send, Loader2, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Project {
    ProjectID: number;
    ProjectName: string;
    tasklists: {
        ListID: number;
        ListName: string;
    }[];
}

export function QuickCreateTask() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [title, setTitle] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch("/api/projects");
                if (response.ok) {
                    const data = await response.json();
                    setProjects(data);
                }
            } catch (err) {
                console.error("Failed to fetch projects:", err);
            }
        };

        if (isExpanded) {
            fetchProjects();
        }
    }, [isExpanded]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsLoading(true);
        setError(null);
        console.log("Submitting task via API:", title, "Project ID:", selectedProjectId);

        try {
            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    projectId: selectedProjectId ? parseInt(selectedProjectId) : undefined,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Task created successfully:", data);
                setTitle("");
                setSelectedProjectId("");
                setIsExpanded(false);
                // Refresh the page or trigger a data re-fetch
                window.location.reload();
            } else {
                const data = await response.json();
                setError(data.error || "Failed to create task");
            }
        } catch (err) {
            console.error("Submission error:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn(
            "rounded-xl border bg-card transition-all duration-300 shadow-sm overflow-hidden",
            isExpanded ? "ring-2 ring-primary/20 bg-primary/5 border-primary/20" : "hover:bg-muted/50"
        )}>
            {error && (
                <div className="bg-red-50 text-red-600 px-4 py-2 text-xs font-bold border-b border-red-100 italic">
                    {error}
                </div>
            )}
            {!isExpanded ? (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="flex w-full items-center gap-3 p-4 text-left text-muted-foreground hover:text-foreground transition-colors"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Plus className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">Quickly add a new task...</span>
                </button>
            ) : (
                <form onSubmit={handleSubmit} className="p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 mt-1 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Plus className="h-5 w-5" />
                        </div>
                        <input
                            autoFocus
                            type="text"
                            placeholder="What needs to be done?"
                            className="flex-1 bg-transparent py-1 text-sm font-medium outline-none placeholder:text-muted-foreground"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex items-center gap-4 px-1">
                        <div className="flex items-center gap-2 flex-1">
                            <Layout className="h-4 w-4 text-muted-foreground" />
                            <select
                                className="flex-1 bg-transparent text-xs font-bold outline-none border-none focus:ring-0 cursor-pointer"
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="" disabled>Select a Project</option>
                                {projects.map((project) => (
                                    <option key={project.ProjectID} value={project.ProjectID}>
                                        {project.ProjectName}
                                    </option>
                                ))}
                                {projects.length === 0 && (
                                    <option disabled>No projects available</option>
                                )}
                            </select>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setIsExpanded(false);
                                    setTitle("");
                                    setSelectedProjectId("");
                                }}
                                disabled={isLoading}
                                className="rounded-full"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={!title.trim() || !selectedProjectId || isLoading}
                                className="rounded-full gap-2 px-4 shadow-lg shadow-primary/20"
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                Create Task
                            </Button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}
