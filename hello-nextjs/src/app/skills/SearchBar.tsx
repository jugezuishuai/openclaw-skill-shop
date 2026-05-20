"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useRef } from "react";

export default function SearchBar({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const q = formData.get("q") as string;
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("keyword", q);
    else params.delete("keyword");
    params.delete("page");
    router.push(`/skills?${params.toString()}`);
  }

  function handleClear() {
    if (inputRef.current) inputRef.current.value = "";
    const params = new URLSearchParams(searchParams.toString());
    params.delete("keyword");
    params.delete("page");
    router.push(`/skills?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1 group">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
        <input
          ref={inputRef}
          name="q"
          defaultValue={defaultValue}
          placeholder="搜索技能名称或描述..."
          className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm shadow-sm placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:shadow-md transition-all duration-200"
        />
        {defaultValue && (
          <button type="button" onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <button
        type="submit"
        className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-[0.97] transition-all duration-200"
      >
        搜索
      </button>
    </form>
  );
}
