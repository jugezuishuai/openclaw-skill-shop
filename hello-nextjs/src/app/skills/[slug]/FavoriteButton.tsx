"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";

export default function FavoriteButton({ slug }: { slug: string }) {
  const [favorited, setFavorited] = useState(false);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    startTransition(async () => {
      const res = await fetch(`/api/skills/${slug}/favorite`, {
        method: favorited ? "DELETE" : "POST",
      });
      if (res.ok) setFavorited(!favorited);
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors ${
        favorited
          ? "border-red-200 bg-red-50 text-red-600"
          : "border-gray-200 text-gray-600 hover:bg-gray-50"
      }`}
    >
      <Heart className={`h-4 w-4 ${favorited ? "fill-current" : ""}`} />
      {favorited ? "已收藏" : "收藏"}
    </button>
  );
}
