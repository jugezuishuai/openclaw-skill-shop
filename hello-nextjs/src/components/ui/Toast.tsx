"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

type ToastFn = (type: ToastMessage["type"], message: string) => void;

const ToastContext = createContext<ToastFn | null>(null);

export function useToast() {
  const fn = useContext(ToastContext);
  return (type: ToastMessage["type"], message: string) => fn?.(type, message);
}

let toastId = 0;

export function ToastContainer({
  flash,
  children,
}: {
  flash?: { type: ToastMessage["type"]; message: string } | null;
  children?: ReactNode;
}) {
  const [toasts, setToasts] = useState<ToastMessage[]>(() => {
    if (flash) {
      const id = String(++toastId);
      return [{ id, type: flash.type, message: flash.message }];
    }
    return [];
  });

  // Clear flash cookie after hydration
  useEffect(() => {
    if (flash) {
      document.cookie = "flash=; path=/; max-age=0";
    }
  }, [flash]);

  const addToast = useCallback((type: ToastMessage["type"], message: string) => {
    const id = String(++toastId);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const icon = {
    success: <CheckCircle className="h-4 w-4" />,
    error: <AlertCircle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
  };

  const bg = {
    success: "bg-emerald-600",
    error: "bg-red-600",
    info: "bg-blue-600",
  };

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl backdrop-blur-sm animate-[scaleIn_0.3s_ease]",
              bg[toast.type]
            )}
          >
            {icon[toast.type]}
            <span>{toast.message}</span>
            <button onClick={() => dismiss(toast.id)} className="ml-2 rounded-full p-0.5 hover:bg-white/20 active:scale-90 transition-all duration-150">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
