"use client";

import { useState } from "react";
import { Plus, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createTaskAction } from "@/app/actions/tasks";
import { cn } from "@/lib/utils";

export function QuickCreateTask() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [title, setTitle] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsLoading(true);
        setError(null);
        console.log("Submitting task:", title);

        try {
            const formData = new FormData();
            formData.append("title", title);

            const result = await createTaskAction(formData);
            console.log("Task creation result:", result);

            if (result.success) {
                setTitle("");
                setIsExpanded(false);
            } else {
                setError(result.error || "Failed to create task");
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
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setIsExpanded(false);
                                setTitle("");
                            }}
                            disabled={isLoading}
                            className="rounded-full"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={!title.trim() || isLoading}
                            className="rounded-full gap-2 px-4 shadow-lg shadow-primary/20"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Create Task
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
