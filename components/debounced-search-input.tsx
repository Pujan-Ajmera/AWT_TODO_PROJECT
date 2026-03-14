"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface DebouncedSearchInputProps {
    defaultValue?: string;
    placeholder?: string;
    onSearch: (value: string) => void;
    className?: string;
    containerClassName?: string;
    delay?: number;
}

export function DebouncedSearchInput({
    defaultValue = "",
    placeholder = "Search...",
    onSearch,
    className,
    containerClassName,
    delay = 250,
}: DebouncedSearchInputProps) {
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        // Only trigger search if value is different from current defaultValue (URL state)
        if (value === defaultValue) return;

        const timer = setTimeout(() => {
            onSearch(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay, onSearch]);

    // Update internal state if defaultValue changes externally
    useEffect(() => {
        if (defaultValue !== value) {
            setValue(defaultValue);
        }
    }, [defaultValue]);

    return (
        <div className={cn("relative group", containerClassName)}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className={cn(
                    "h-10 w-full rounded-full border bg-muted/30 pl-10 pr-4 text-sm outline-none transition-all focus:bg-background focus:ring-4 focus:ring-primary/10",
                    className
                )}
            />
        </div>
    );
}
