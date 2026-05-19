"use client";

import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

let addToastFn: ((toast: Omit<ToastMessage, "id">) => void) | null = null;

export function showToast(type: ToastMessage["type"], message: string) {
  addToastFn?.({ type, message });
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    addToastFn = (toast) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { ...toast, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };
    return () => { addToastFn = null; };
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-3 text-sm shadow-lg",
            toast.type === "success" && "bg-green-600 text-white",
            toast.type === "error" && "bg-red-600 text-white",
            toast.type === "info" && "bg-blue-600 text-white"
          )}
        >
          <span>{toast.message}</span>
          <button onClick={() => dismiss(toast.id)} className="ml-2">
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
