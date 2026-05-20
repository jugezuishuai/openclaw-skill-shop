"use client";

import { useState, useEffect, useTransition } from "react";
import { Download, ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";

export default function InstallButton({
  slug,
  skillId,
  isAuthor,
  isFree,
}: {
  slug: string;
  skillId: string;
  isAuthor: boolean;
  isFree: boolean;
}) {
  const [installed, setInstalled] = useState(false);
  const [purchased, setPurchased] = useState(false);
  const [checking, setChecking] = useState(!isFree && !isAuthor);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  useEffect(() => {
    if (!isFree && !isAuthor) {
      fetch(`/api/skills/${slug}/purchase-status`)
        .then((res) => res.json())
        .then((data) => {
          if (data.purchased) setPurchased(true);
        })
        .catch(() => {})
        .finally(() => setChecking(false));
    }
  }, [slug, isFree, isAuthor]);

  const install = () => {
    startTransition(async () => {
      const res = await fetch(`/api/skills/${slug}/install`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill_id: skillId }),
      });
      if (res.ok) {
        setInstalled(true);
        toast("success", "安装成功");
      } else {
        const data = await res.json().catch(() => ({}));
        toast("error", data.error || "安装失败");
      }
    });
  };

  const buy = () => {
    startTransition(async () => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setPurchased(true);
        if (data.paid) {
          toast("success", data.error || "购买成功！你可以在订单列表中查看记录");
        }
      } else {
        toast("error", data.error || "购买失败");
      }
    });
  };

  if (isAuthor) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 shadow-sm">
        <Download className="h-4 w-4" /> 你的技能
      </span>
    );
  }

  if (!isFree) {
    if (checking) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-400 shadow-sm">
          <ShoppingCart className="h-4 w-4" /> 检查中...
        </span>
      );
    }

    if (purchased) {
      return (
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-100 px-4 py-2.5 text-sm font-medium text-emerald-700 shadow-sm">
            <ShoppingCart className="h-4 w-4" /> 已购买
          </span>
          <Link
            href={`/skills/${slug}?review=1`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 shadow-md hover:shadow-lg active:scale-[0.97] transition-all duration-200"
          >
            <Star className="h-4 w-4" /> 写评价
          </Link>
          {!installed && (
            <button
              onClick={install}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-[0.97] transition-all duration-200 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {pending ? "…" : "安装"}
            </button>
          )}
        </div>
      );
    }

    return (
      <button
        onClick={buy}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-[0.97] transition-all duration-200 disabled:opacity-50"
      >
        <ShoppingCart className="h-4 w-4" />
        {pending ? "购买中..." : "购买"}
      </button>
    );
  }

  return (
    <button
      onClick={install}
      disabled={pending || installed}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${
        installed
          ? "bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm"
          : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <Download className="h-4 w-4" />
      {installed ? "已安装" : "安装"}
    </button>
  );
}
