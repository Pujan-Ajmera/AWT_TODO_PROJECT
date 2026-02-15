"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export function UserSearch() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [value, setValue] = useState(searchParams.get("q") || "");

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set("q", value);
        } else {
            params.delete("q");
        }
        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`);
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    // Sync local state if URL changes externally
    useEffect(() => {
        setValue(searchParams.get("q") || "");
    }, [searchParams]);

    return (
        <div className="relative w-full md:w-96 group">
            <Search
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors cursor-pointer hover:text-primary"
                onClick={handleSearch}
            />
            <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                type="text"
                placeholder="Filter by name or email (Press Enter)..."
                className="w-full h-12 rounded-2xl border bg-background/50 pl-12 pr-4 text-sm outline-none transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary"
            />
        </div>
    );
}
