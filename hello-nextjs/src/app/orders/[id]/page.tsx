import { createClient } from "@/lib/supabase/server";
import { getOrderById } from "@/lib/db/orders";
import { redirect } from "next/navigation";
import PayButton from "./PayButton";

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
    return <p className="p-8 text-center text-gray-500">无权查看此订单</p>;
  }

  const skill = order.skills as Record<string, unknown> | undefined;

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">订单详情</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <span className="text-sm text-gray-500">技能</span>
          <p className="font-medium">{skill?.name as string || "未知"}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">订单号</span>
          <p className="font-mono text-sm">{order.id}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">金额</span>
          <p className="font-bold text-lg">${(order.amount_cents || 0) / 100}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">状态</span>
          <p className="font-medium">{order.status}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">创建时间</span>
          <p>{new Date(order.created_at).toLocaleString("zh-CN")}</p>
        </div>

        {order.status === "pending" && <PayButton orderId={order.id} />}

        {order.status === "paid" && (
          <div className="rounded-md bg-green-50 p-4 text-center text-sm text-green-600">
            支付成功！你可以在技能库中查看此技能。
          </div>
        )}
      </div>
    </div>
  );
}
