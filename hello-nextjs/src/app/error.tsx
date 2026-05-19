"use client";

import { useEffect } from "react";

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
    <div className="flex min-h-[400px] flex-col items-center justify-center px-4">
      <h2 className="text-2xl font-bold text-gray-900">出错了</h2>
      <p className="mt-2 text-gray-500">
        {error.message || "发生了意外错误，请稍后重试"}
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
      >
        重试
      </button>
    </div>
  );
}
