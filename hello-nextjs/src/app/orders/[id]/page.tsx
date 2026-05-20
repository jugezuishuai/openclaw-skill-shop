import { createClient } from "@/lib/supabase/server";
import { getOrderById } from "@/lib/db/orders";
import { redirect } from "next/navigation";
import Link from "next/link";
import PayButton from "./PayButton";
import { ArrowLeft, Star } from "lucide-react";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const order = await getOrderById(id);

  if (order.user_id !== user.id) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-500">无权查看此订单</p>
      </div>
    );
  }

  const skill = order.skills as { name?: string; slug?: string } | undefined;
  const isPaid = order.status === "paid";
  const isPending = order.status === "pending";

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link href="/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回订单列表
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">订单详情</h1>

      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-md space-y-5">
        <div className="flex items-center gap-4">
          <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-2xl shadow-md ring-2 ring-white ${isPaid ? "bg-emerald-100 text-emerald-600" : "bg-yellow-100 text-yellow-600"}`}>
            {isPaid ? "✓" : "⏳"}
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{skill?.name as string || "未知"}</p>
            <p className="text-sm text-gray-500">{isPaid ? "已支付" : "待支付"}</p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-3">
          <Row label="订单号" value={(order.id as string).slice(0, 16) + "..."} mono />
          <Row label="金额" value={`$${(order.amount_cents / 100).toFixed(2)}`} bold />
          <Row label="状态">
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${isPaid ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}>
              {order.status}
            </span>
          </Row>
          <Row label="创建时间" value={new Date(order.created_at).toLocaleString("zh-CN")} />
          {order.paid_at && <Row label="支付时间" value={new Date(order.paid_at as string).toLocaleString("zh-CN")} />}
        </div>

        {isPending && <PayButton orderId={order.id} />}

        {isPaid && (
          <div className="rounded-xl bg-emerald-50 p-4 space-y-3 text-sm text-emerald-700 border border-emerald-200">
            <p className="text-center">✓ 购买成功！你可以在技能库中查看此技能。</p>
            {skill?.slug && (
              <div className="flex justify-center gap-3">
                <Link
                  href={`/skills/${skill.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm active:scale-[0.97] transition-all duration-200"
                >
                  查看技能
                </Link>
                <Link
                  href={`/skills/${skill.slug}?review=1`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 shadow-sm active:scale-[0.97] transition-all duration-200"
                >
                  <Star className="h-3.5 w-3.5" /> 写评价
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, mono, bold, children }: {
  label: string; value?: string; mono?: boolean; bold?: boolean; children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      {children || (
        <span className={`text-sm ${mono ? "font-mono text-xs" : ""} ${bold ? "font-bold text-lg" : "text-gray-900"}`}>
          {value}
        </span>
      )}
    </div>
  );
}
