"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DebouncedSearchInput } from "@/components/debounced-search-input";

interface ProjectDetailSearchClientProps {
    projectId: string;
}

export function ProjectDetailSearchClient({ projectId }: ProjectDetailSearchClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentQ = searchParams.get("q") || "";
    const view = searchParams.get("view") || "details";
    const priority = searchParams.get("priority");
    const status = searchParams.get("status");

    const handleSearch = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value.trim()) {
            params.set("q", value);
        } else {
            params.delete("q");
        }
        router.push(`/projects/${projectId}?${params.toString()}`);
    };

    return (
        <DebouncedSearchInput
            defaultValue={currentQ}
            placeholder="Find tasks..."
            onSearch={handleSearch}
            containerClassName="w-48 focus-within:w-64 transition-all"
            className="h-9 text-xs"
        />
    );
}
