"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function FavoriteButton({ slug }: { slug: string }) {
  const [favorited, setFavorited] = useState(false);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  const toggle = () => {
    startTransition(async () => {
      const res = await fetch(`/api/skills/${slug}/favorite`, {
        method: favorited ? "DELETE" : "POST",
      });
      if (res.ok) {
        setFavorited(!favorited);
        toast("success", favorited ? "已取消收藏" : "已收藏");
      }
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
        favorited
          ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100 shadow-sm"
          : "border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 shadow-sm hover:shadow-md"
      }`}
    >
      <Heart className={`h-4 w-4 transition-transform ${favorited ? "fill-current scale-110" : ""}`} />
      {favorited ? "已收藏" : "收藏"}
    </button>
  );
}
