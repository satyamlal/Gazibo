"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
}

const ICONS = {
    success: CheckCircle2,
    error: XCircle,
    info: Info,
};

const COLORS = {
    success: "border-[#85DABE]/30 bg-[#85DABE]/10 text-[#85DABE]",
    error: "border-red-500/30 bg-red-500/10 text-red-400",
    info: "border-[#174BD4]/30 bg-[#174BD4]/10 text-[#174BD4]",
};

interface ToastProps {
    toast: ToastMessage;
    onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastProps) {
    useEffect(() => {
        const t = setTimeout(() => onDismiss(toast.id), 7000);
        return () => clearTimeout(t);
    }, [toast.id, onDismiss]);

    const Icon = ICONS[toast.type];

    return (
        <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-xl ${COLORS[toast.type]} animate-fade-in-up`}>
            <Icon className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-white flex-1">{toast.message}</p>
            <button onClick={() => onDismiss(toast.id)} className="shrink-0 text-zinc-500 hover:text-white transition-colors">
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

interface ToastContainerProps {
    toasts: ToastMessage[];
    onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
    if (toasts.length === 0) return null;
        return (
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-80">
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
                ))}
            </div>
        );
}