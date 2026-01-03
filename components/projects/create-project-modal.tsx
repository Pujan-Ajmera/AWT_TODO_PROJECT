"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { createProjectAction } from "@/app/actions/projects";
import { Loader2, Layout } from "lucide-react";

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);

            const result = await createProjectAction(formData);
            if (result.success) {
                setName("");
                setDescription("");
                onClose();
            } else {
                setError(result.error || "Failed to create project");
            }
        } catch (err) {
            console.error("Project submission error:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold border border-red-100">
                        {error}
                    </div>
                )}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Project Name
                        </label>
                        <div className="relative group">
                            <Layout className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="e.g. Website Redesign"
                                className="w-full rounded-xl border bg-muted/30 py-2.5 pl-11 pr-4 outline-none focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Description (Optional)
                        </label>
                        <textarea
                            placeholder="Briefly describe the project goals..."
                            className="w-full min-h-[120px] rounded-xl border bg-muted/30 p-4 outline-none focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                        className="rounded-full px-6"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={!name.trim() || isLoading}
                        className="rounded-full px-8 shadow-lg shadow-primary/20"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Create Project
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
