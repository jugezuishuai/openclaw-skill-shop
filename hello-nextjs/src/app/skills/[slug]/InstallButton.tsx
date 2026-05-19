"use client";

import { useState, useTransition } from "react";
import { Download } from "lucide-react";

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
  const [pending, startTransition] = useTransition();

  const install = () => {
    startTransition(async () => {
      const res = await fetch(`/api/skills/${slug}/install`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill_id: skillId }),
      });
      if (res.ok) setInstalled(true);
    });
  };

  if (isAuthor) {
    return (
      <span className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-600">
        你的技能
      </span>
    );
  }

  if (!isFree) {
    return (
      <a
        href={`/orders?skill=${slug}`}
        className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
      >
        购买
      </a>
    );
  }

  return (
    <button
      onClick={install}
      disabled={pending || installed}
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
        installed
          ? "bg-green-100 text-green-700 border border-green-200"
          : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
    >
      <Download className="h-4 w-4" />
      {installed ? "已安装" : "安装"}
    </button>
  );
}
