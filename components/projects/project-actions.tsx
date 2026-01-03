"use client";

import { useState } from "react";
import { MoreHorizontal, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { deleteProjectAction } from "@/app/actions/projects";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export function ProjectActions({ projectId, projectName }: { projectId: number, projectName: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${projectName}"? This will delete all tasks and lists within it.`)) return;

        setIsDeleting(true);
        setError(null);
        try {
            const result = await deleteProjectAction(projectId);
            if (result.success) {
                setIsOpen(false);
            } else {
                setError(result.error || "Failed to delete project");
                setIsDeleting(false);
            }
        } catch (err) {
            setError("Something went wrong");
            setIsDeleting(false);
        }
    };

    return (
        <div className="relative group">
            <button
                onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(true);
                }}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                title="Project Actions"
            >
                <MoreHorizontal className="h-5 w-5" />
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Project Actions">
                <div className="space-y-6 pt-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs font-bold border border-red-100 rounded-xl italic">
                            {error}
                        </div>
                    )}

                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-4">
                        <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-amber-900">Danger Zone</p>
                            <p className="text-xs text-amber-700">Deleting a project is permanent and cannot be undone.</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-3 h-12 rounded-xl border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            Delete Project
                        </Button>

                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 h-12 rounded-xl"
                            onClick={() => setIsOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
