import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const status = sp.status || "";
  const limit = 15;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">无权访问</p>
          <p className="text-sm text-gray-500">需要管理员权限</p>
        </div>
      </div>
    );
  }

  const serviceClient = createServiceClient();

  let query = serviceClient
    .from("orders")
    .select("*, skills:skill_id(name), profiles:user_id(display_name)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data: orders, count: total } = await query;
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

  const statusOptions = [
    { value: "", label: "全部" },
    { value: "paid", label: "已支付" },
    { value: "pending", label: "待支付" },
    { value: "cancelled", label: "已取消" },
    { value: "refunded", label: "已退款" },
    { value: "failed", label: "失败" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">订单概览</h1>
      <p className="text-sm text-gray-500 mb-6">查看平台所有订单</p>

      {/* Status filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {statusOptions.map((opt) => (
          <Link
            key={opt.value}
            href={`/admin/orders?${opt.value ? `status=${opt.value}&` : ""}page=1`}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 active:scale-[0.96] ${
              status === opt.value
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {opt.label}
          </Link>
        ))}
        <span className="ml-3 text-xs text-gray-400">共 {total || 0} 条</span>
      </div>

      <div className="rounded-xl border border-gray-200/80 bg-white overflow-x-auto shadow-md">
        <table className="w-full text-sm">
          <thead className="border-b-2 border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100/50 text-left text-gray-600">
            <tr>
              <th className="px-5 py-3.5 font-medium">ID</th>
              <th className="px-5 py-3.5 font-medium">用户</th>
              <th className="px-5 py-3.5 font-medium">技能</th>
              <th className="px-5 py-3.5 font-medium">金额</th>
              <th className="px-5 py-3.5 font-medium">状态</th>
              <th className="px-5 py-3.5 font-medium">日期</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((o: Record<string, unknown>) => {
              const skill = o.skills as Record<string, unknown> | undefined;
              const profile = o.profiles as Record<string, unknown> | undefined;
              const orderStatus = o.status as string;
              const statusColors: Record<string, string> = {
                paid: "bg-emerald-100 text-emerald-700", pending: "bg-yellow-100 text-yellow-700",
                cancelled: "bg-gray-100 text-gray-500", refunded: "bg-blue-100 text-blue-700",
                failed: "bg-red-100 text-red-600",
              };
              return (
                <tr key={o.id as string} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors duration-150">
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{(o.id as string).slice(0, 8)}...</td>
                  <td className="px-5 py-3.5 text-gray-500">{profile?.display_name as string || "未知"}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-900">{skill?.name as string || "未知"}</td>
                  <td className="px-5 py-3.5 font-semibold">${((o.amount_cents as number) || 0) / 100}</td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[orderStatus] || ""}`}>{orderStatus}</span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{new Date(o.created_at as string).toLocaleDateString("zh-CN")}</td>
                </tr>
              );
            })}
            {(!orders || orders.length === 0) && (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center text-gray-400">暂无订单记录</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Link
            href={`/admin/orders?${status ? `status=${status}&` : ""}page=${page - 1}`}
            className={`rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors ${page <= 1 ? "pointer-events-none opacity-30" : ""}`}
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/orders?${status ? `status=${status}&` : ""}page=${p}`}
              className={`min-w-[36px] rounded-lg px-2 py-1.5 text-sm font-medium transition-all duration-200 active:scale-[0.96] ${
                p === page
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {p}
            </Link>
          ))}
          <Link
            href={`/admin/orders?${status ? `status=${status}&` : ""}page=${page + 1}`}
            className={`rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors ${page >= totalPages ? "pointer-events-none opacity-30" : ""}`}
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
