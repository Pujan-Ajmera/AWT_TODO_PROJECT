"use client";

import { Search, Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useDebounce } from "@/hooks/use-debounce";

export function UserSearch() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [value, setValue] = useState(searchParams.get("q") || "");
    const debouncedValue = useDebounce(value, 300);

    // Update URL when debounced value changes
    useEffect(() => {
        const currentQ = searchParams.get("q") || "";
        if (debouncedValue === currentQ) return;

        const params = new URLSearchParams(searchParams);
        if (debouncedValue) {
            params.set("q", debouncedValue);
        } else {
            params.delete("q");
        }
        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        });
    }, [debouncedValue, pathname, router]);

    // Update internal state only when URL changes externally
    useEffect(() => {
        const q = searchParams.get("q") || "";
        if (q !== value) {
            setValue(q);
        }
    }, [searchParams]);

    return (
        <div className="relative w-full md:w-96 group">
            {isPending ? (
                <Loader2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary animate-spin" />
            ) : (
                <Search
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                />
            )}
            <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                type="text"
                placeholder="Search by name or email..."
                className="w-full h-12 rounded-2xl border bg-background/50 pl-12 pr-4 text-sm outline-none transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary"
            />
        </div>
    );
}
