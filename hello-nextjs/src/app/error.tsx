"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 animate-[fadeIn_0.4s_ease]">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-100 to-red-200 shadow-inner">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h1 className="mt-4 text-xl font-bold text-gray-900">出了点问题</h1>
      <p className="mt-2 text-sm text-gray-500">{error.message || "发生了意外错误，请稍后重试"}</p>
      <button
        onClick={reset}
        className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-[0.97] transition-all duration-200"
      >
        重试
      </button>
    </div>
  );
}
