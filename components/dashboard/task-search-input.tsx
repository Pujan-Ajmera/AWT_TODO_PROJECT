"use client";

import { useTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export function TaskSearchInput({ initialValue = "" }: { initialValue?: string }) {
    const router = useRouter();
    const [value, setValue] = useState(initialValue);
    const debouncedValue = useDebounce(value, 300);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (debouncedValue) {
            params.set("q", debouncedValue);
        } else {
            params.delete("q");
        }

        startTransition(() => {
            router.push(`/?${params.toString()}`);
        });
    }, [debouncedValue, router]);

    return (
        <div className="relative group">
            {isPending ? (
                <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary animate-spin" />
            ) : (
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
            )}
            <input
                type="text"
                placeholder="Instant filter..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="h-10 w-48 rounded-full border bg-muted/30 pl-10 pr-4 text-sm outline-none transition-all focus:bg-background focus:ring-4 focus:ring-primary/10 focus:w-64"
                aria-label="Filter active tasks"
            />
        </div>
    );
}
