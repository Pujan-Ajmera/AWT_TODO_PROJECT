"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CreateProjectModal } from "@/components/projects/create-project-modal";

export function ProjectListClient() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/20 hover:opacity-90 hover:scale-[1.02] transition-all active:scale-95"
            >
                <Plus className="h-5 w-5" />
                New Project
            </button>
            <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}
