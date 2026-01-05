"use client";

import { useState } from "react";
import { MoreHorizontal, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { deleteTaskListAction } from "@/app/actions/projects";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export function ListItemActions({ listId, listName }: { listId: number, listName: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete list "${listName}"? All tasks in this list will be deleted.`)) return;

        setIsDeleting(true);
        setError(null);
        try {
            const response = await fetch(`/api/task-lists/${listId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setIsOpen(false);
                window.location.reload();
            } else {
                const data = await response.json();
                setError(data.error || "Failed to delete list");
                setIsDeleting(false);
            }
        } catch (err) {
            setError("Something went wrong");
            setIsDeleting(false);
        }
    };

    return (
        <div className="relative group/actions">
            <button
                onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(true);
                }}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-all opacity-0 group-hover/list:opacity-100"
                title="List Actions"
            >
                <MoreHorizontal className="h-4 w-4" />
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="List Actions">
                <div className="space-y-6 pt-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs font-bold border border-red-100 rounded-xl italic">
                            {error}
                        </div>
                    )}

                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-4">
                        <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-amber-900">Warning</p>
                            <p className="text-xs text-amber-700">Deleting a list will permanently remove all tasks currently in it.</p>
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
                            Delete List
                        </Button>

                        <Button
                            variant="ghost"
                            className="w-full h-12 rounded-xl"
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
