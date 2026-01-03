"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { createTaskAction } from "@/app/actions/tasks";

export function CaptureNewButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("title", title);
            const result = await createTaskAction(formData);
            if (result.success) {
                setTitle("");
                setIsOpen(false);
            } else {
                setError(result.error || "Failed to create task");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/20 hover:opacity-90 hover:scale-[1.02] transition-all active:scale-95 focus:ring-4 focus:ring-primary/20 outline-none"
                aria-label="Create a new task"
            >
                <Plus className="h-5 w-5" />
                Capture New
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Quick Capture">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Task Title</label>
                        <input
                            autoFocus
                            placeholder="What's on your mind?"
                            className="w-full h-12 rounded-2xl border bg-muted/30 px-4 text-sm font-bold outline-none focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!title.trim() || isLoading} className="rounded-xl px-8 shadow-lg shadow-primary/20">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Create Task
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
