"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DebouncedSearchInput } from "@/components/debounced-search-input";

export function TaskSearchClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSearch = searchParams.get("search") || "";
    const status = searchParams.get("status");

    const handleSearch = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value.trim()) {
            params.set("search", value);
        } else {
            params.delete("search");
        }
        params.delete("page"); // Reset page on search
        router.push(`/my-tasks?${params.toString()}`);
    };

    return (
        <DebouncedSearchInput
            defaultValue={currentSearch}
            placeholder="Search tasks..."
            onSearch={handleSearch}
            containerClassName="w-full md:w-64"
        />
    );
}
