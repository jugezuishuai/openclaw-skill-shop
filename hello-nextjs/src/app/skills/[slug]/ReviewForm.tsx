"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Send } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function ReviewForm({ slug }: { slug: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const submit = async () => {
    if (rating === 0) {
      toast("error", "请选择评分");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/skills/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, content: content || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast("error", data.error || "评价失败");
      } else {
        setSubmitted(true);
        toast("success", "评价成功！");
        router.refresh();
      }
    } catch {
      toast("error", "网络错误");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl bg-emerald-50 p-4 text-center text-sm text-emerald-700 border border-emerald-200">
        ✓ 评价已提交，感谢你的反馈！
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
      <p className="text-sm font-medium text-amber-800">为这个技能写评价</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-6 w-6 ${
                star <= (hover || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-xs text-gray-400">
          {rating > 0 ? `${rating} 星` : "点击评分"}
        </span>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="分享你的使用体验（可选）"
        rows={3}
        className="block w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 hover:border-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all duration-200 resize-none"
      />
      <button
        onClick={submit}
        disabled={submitting}
        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 shadow-md hover:shadow-lg active:scale-[0.97] transition-all duration-200 disabled:opacity-50"
      >
        <Send className="h-3.5 w-3.5" />
        {submitting ? "提交中..." : "提交评价"}
      </button>
    </div>
  );
}
