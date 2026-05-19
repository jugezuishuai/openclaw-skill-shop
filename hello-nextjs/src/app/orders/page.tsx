import { createClient } from "@/lib/supabase/server";
import { getUserOrders } from "@/lib/db/orders";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?callbackUrl=/orders");

  const orders = await getUserOrders(user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">我的订单</h1>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">暂无订单</p>
          <Link href="/skills" className="mt-2 inline-block text-blue-600 hover:underline">
            浏览技能商店
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: Record<string, unknown>) => {
            const skill = order.skills as Record<string, unknown> | undefined;
            return (
              <div key={order.id as string} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{skill?.name as string || "未知"}</p>
                    <p className="text-sm text-gray-500">
                      订单号：{(order.id as string).slice(0, 8)}...
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.created_at as string).toLocaleString("zh-CN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ${((order.amount_cents as number) || 0) / 100}
                    </p>
                    <StatusBadge status={order.status as string} />
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  {(order.status as string) === "pending" && (
                    <a
                      href={`/orders/${order.id}`}
                      className="rounded-md bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                    >
                      去支付
                    </a>
                  )}
                  <Link
                    href={`/orders/${order.id}`}
                    className="rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    查看详情
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    pending: "待支付",
    paid: "已支付",
    cancelled: "已取消",
    refunded: "已退款",
    failed: "失败",
  };
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-green-100 text-green-700",
    cancelled: "bg-gray-100 text-gray-500",
    refunded: "bg-blue-100 text-blue-700",
    failed: "bg-red-100 text-red-600",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || ""}`}>
      {labels[status] || status}
    </span>
  );
}
