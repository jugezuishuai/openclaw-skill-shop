"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

type SkillStatus = "draft" | "pending_review" | "published" | "rejected" | "suspended" | "archived";

interface Props {
  skillSlug: string;
  currentStatus: SkillStatus;
}

const statusLabels: Record<string, string> = {
  pending_review: "审核中",
  published: "已发布",
  rejected: "已驳回，请修改后重新提交",
  suspended: "已下架",
  archived: "已归档",
};

export default function SkillStatusActions({ skillSlug, currentStatus }: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const toast = useToast();

  const submitForReview = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/skills/${skillSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pending_review" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast("error", data.error || "操作失败");
      } else {
        setStatus("pending_review");
        toast("success", "已提交审核");
      }
    } catch {
      toast("error", "网络错误");
    } finally {
      setLoading(false);
    }
  };

  // Only draft skills can be submitted for review by the author.
  // All other status transitions (approve/reject/suspend/restore) are admin-only.
  if (status === "draft") {
    return (
      <button
        onClick={submitForReview}
        disabled={loading}
        className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 active:scale-[0.97]"
      >
        {loading ? "…" : "提交审核"}
      </button>
    );
  }

  const label = statusLabels[status];
  if (!label) return null;

  return (
    <span className="text-xs text-gray-400">{label}</span>
  );
}
