"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBar({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const q = formData.get("q") as string;
        const params = new URLSearchParams(searchParams.toString());
        if (q) params.set("keyword", q);
        else params.delete("keyword");
        params.delete("page");
        router.push(`/skills?${params.toString()}`);
      }}
      className="flex gap-2"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          name="q"
          defaultValue={defaultValue}
          placeholder="搜索技能..."
          className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        搜索
      </button>
    </form>
  );
}
