"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

type SkillStatus = "draft" | "pending_review" | "published" | "rejected" | "suspended" | "archived";

interface Props {
  skillSlug: string;
  currentStatus: SkillStatus;
}

const actionLabels: Record<string, string> = {
  approve: "通过",
  reject: "驳回",
  suspend: "下架",
  restore: "上架",
};

export default function AdminSkillActions({ skillSlug, currentStatus }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const toast = useToast();

  const updateStatus = async (newStatus: SkillStatus, actionName: string) => {
    setLoading(actionName);
    setMessage(null);
    try {
      const res = await fetch(`/api/skills/${skillSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "操作失败" });
        toast("error", data.error || "操作失败");
      } else {
        setMessage({ type: "success", text: `已${actionLabels[actionName]}` });
        toast("success", `已${actionLabels[actionName]}`);
        setTimeout(() => window.location.reload(), 600);
      }
    } catch {
      setMessage({ type: "error", text: "网络错误" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      {message && (
        <span className={`text-xs ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
          {message.text}
        </span>
      )}

      {currentStatus === "draft" && (
        <>
          <button
            onClick={() => updateStatus("published", "approve")}
            disabled={loading !== null}
            className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-all duration-200 active:scale-[0.97]"
          >
            {loading === "approve" ? "…" : "通过"}
          </button>
          <button
            onClick={() => updateStatus("rejected", "reject")}
            disabled={loading !== null}
            className="rounded-md bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50 transition-all duration-200 active:scale-[0.97]"
          >
            {loading === "reject" ? "…" : "驳回"}
          </button>
        </>
      )}

      {currentStatus === "pending_review" && (
        <>
          <button
            onClick={() => updateStatus("published", "approve")}
            disabled={loading !== null}
            className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-all duration-200 active:scale-[0.97]"
          >
            {loading === "approve" ? "…" : "通过"}
          </button>
          <button
            onClick={() => updateStatus("rejected", "reject")}
            disabled={loading !== null}
            className="rounded-md bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50 transition-all duration-200 active:scale-[0.97]"
          >
            {loading === "reject" ? "…" : "驳回"}
          </button>
        </>
      )}

      {currentStatus === "rejected" && (
        <button
          onClick={() => updateStatus("published", "approve")}
          disabled={loading !== null}
          className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-all duration-200 active:scale-[0.97]"
        >
          {loading === "approve" ? "…" : "通过"}
        </button>
      )}

      {currentStatus === "published" && (
        <button
          onClick={() => updateStatus("suspended", "suspend")}
          disabled={loading !== null}
          className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-200 disabled:opacity-50 transition-all duration-200 active:scale-[0.97]"
        >
          {loading === "suspend" ? "…" : "下架"}
        </button>
      )}

      {currentStatus === "suspended" && (
        <button
          onClick={() => updateStatus("published", "restore")}
          disabled={loading !== null}
          className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-all duration-200 active:scale-[0.97]"
        >
          {loading === "restore" ? "…" : "上架"}
        </button>
      )}

    </div>
  );
}
