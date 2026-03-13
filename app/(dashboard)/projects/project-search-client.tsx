"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DebouncedSearchInput } from "@/components/debounced-search-input";

export function ProjectSearchClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentQ = searchParams.get("q") || "";

    const handleSearch = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value.trim()) {
            params.set("q", value);
        } else {
            params.delete("q");
        }
        params.delete("page"); // Reset page on search
        router.push(`/projects?${params.toString()}`);
    };

    return (
        <DebouncedSearchInput
            defaultValue={currentQ}
            placeholder="Search projects..."
            onSearch={handleSearch}
            containerClassName="w-full md:w-96"
        />
    );
}
