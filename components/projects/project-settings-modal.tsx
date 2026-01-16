"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2, AlertTriangle, Settings } from "lucide-react";
import { deleteProjectAction } from "@/app/actions/projects";

interface ProjectSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: {
        ProjectID: number;
        ProjectName: string;
        Description: string | null;
    };
}

export function ProjectSettingsModal({ isOpen, onClose, project }: ProjectSettingsModalProps) {
    const router = useRouter();
    const [name, setName] = useState(project.ProjectName);
    const [description, setDescription] = useState(project.Description || "");
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const response = await fetch(`/api/projects/${project.ProjectID}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description }),
            });

            if (!response.ok) throw new Error("Failed to save changes");

            router.refresh();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${project.ProjectName}"? This action cannot be undone.`)) return;

        setIsDeleting(true);
        setError(null);

        try {
            const result = await deleteProjectAction(project.ProjectID);
            if (result.success) {
                router.push("/projects");
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
        <Modal isOpen={isOpen} onClose={onClose} title="Project Settings">
            <div className="space-y-6 pt-4">
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-xs font-bold border border-red-100 rounded-xl">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Project Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="rounded-xl"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="rounded-xl min-h-[100px]"
                        />
                    </div>
                    <Button type="submit" className="w-full rounded-xl" disabled={isSaving || isDeleting}>
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Save Changes"}
                    </Button>
                </form>

                <div className="border-t pt-6">
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-4 mb-4">
                        <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-amber-900">Danger Zone</p>
                            <p className="text-xs text-amber-700">Once deleted, a project and all its tasks are gone forever.</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-3 h-12 rounded-xl border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                        onClick={handleDelete}
                        disabled={isSaving || isDeleting}
                    >
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Delete Project
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
