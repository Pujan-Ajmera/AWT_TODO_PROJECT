"use client";

import { useState } from "react";
import { MoreHorizontal, Trash2, CheckCircle, Clock, Loader2, AlertCircle } from "lucide-react";
import { deleteTaskAction, updateTaskStatusAction } from "@/app/actions/tasks";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export function TaskItemActions({ taskId, taskTitle }: { taskId: number, taskTitle: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAction = async (action: () => Promise<{ success?: boolean, error?: string }>) => {
        setIsActionLoading(true);
        setError(null);
        try {
            const result = await action();
            if (result.success) {
                setIsOpen(false);
            } else {
                setError(result.error || "Action failed");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <div className="relative group">
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(true);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full opacity-0 group-hover:opacity-100 hover:bg-muted transition-all text-muted-foreground focus:opacity-100 outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="More task options"
            >
                <MoreHorizontal className="h-5 w-5" />
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Task Actions">
                <div className="space-y-6 pt-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs font-bold border border-red-100 rounded-xl italic">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                className="justify-start gap-2 h-11 rounded-xl hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                                onClick={() => handleAction(() => updateTaskStatusAction(taskId, "Completed"))}
                                disabled={isActionLoading}
                            >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                Complete
                            </Button>
                            <Button
                                variant="outline"
                                className="justify-start gap-2 h-11 rounded-xl hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200"
                                onClick={() => handleAction(() => updateTaskStatusAction(taskId, "In Progress"))}
                                disabled={isActionLoading}
                            >
                                <Clock className="h-4 w-4 text-yellow-600" />
                                In Progress
                            </Button>
                        </div>

                        <div className="border-t border-border/50 pt-4">
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-3 h-12 rounded-xl border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                                onClick={() => {
                                    if (confirm(`Delete task "${taskTitle}"?`)) {
                                        handleAction(() => deleteTaskAction(taskId));
                                    }
                                }}
                                disabled={isActionLoading}
                            >
                                {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                Delete Task
                            </Button>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        className="w-full h-11 rounded-xl"
                        onClick={() => setIsOpen(false)}
                        disabled={isActionLoading}
                    >
                        Cancel
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
