"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function PayButton({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const pay = () => {
    startTransition(async () => {
      const res = await fetch("/api/payments/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });
      if (res.ok) router.refresh();
    });
  };

  return (
    <button
      onClick={pay}
      disabled={pending}
      className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {pending ? "支付中..." : "模拟支付"}
    </button>
  );
}
