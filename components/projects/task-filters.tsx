"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface TaskFiltersProps {
    priority?: string;
    status?: string;
}

export function TaskFilters({ priority, status }: TaskFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex gap-2">
            <select
                className="bg-card border rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                onChange={(e) => handleFilterChange("priority", e.target.value)}
                value={priority || ""}
            >
                <option value="">Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
            </select>
            <select
                className="bg-card border rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                onChange={(e) => handleFilterChange("status", e.target.value)}
                value={status || ""}
            >
                <option value="">Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
            </select>
        </div>
    );
}
