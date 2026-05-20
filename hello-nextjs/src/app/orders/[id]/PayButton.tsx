"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function PayButton({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();

  const pay = () => {
    startTransition(async () => {
      const res = await fetch("/api/payments/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });
      if (res.ok) {
        router.refresh();
        toast("success", "支付成功");
      } else {
        const data = await res.json().catch(() => ({}));
        toast("error", data.error || "支付失败");
      }
    });
  };

  return (
    <button
      onClick={pay}
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-[0.97] transition-all duration-200"
    >
      <CreditCard className="h-4 w-4" />
      {pending ? "支付中..." : "模拟支付"}
    </button>
  );
}
