"use client";

import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    children: React.ReactNode
    className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!mounted || !isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />
            <div className={cn(
                "relative z-50 w-full max-w-lg overflow-hidden rounded-xl border bg-card p-6 shadow-2xl transition-all animate-in zoom-in-95 slide-in-from-bottom-2 duration-300",
                className
            )}>
                <div className="flex items-center justify-between mb-4">
                    {title && <h2 className="text-xl font-semibold tracking-tight">{title}</h2>}
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 -mr-2 -mt-2">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    )
}
