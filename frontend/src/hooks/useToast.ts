import { useState, useCallback } from "react";
import type { ToastMessage, ToastType } from "@/components/ui/Toast";

const MAX_TOASTS = 3;

export function useToast() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((message: string, type: ToastType = "info") => {
        const id = `${Date.now()}-${Math.random()}`;
        setToasts((prev) => {
        const next = [...prev, { id, type, message }];
        return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
        });
    }, []);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return { toasts, addToast, dismiss };
}