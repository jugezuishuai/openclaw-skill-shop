import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("*, skills:skill_id(name), profiles:user_id(email)")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">订单概览</h1>
      <div className="rounded-lg border border-gray-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">用户</th>
              <th className="px-4 py-3">技能</th>
              <th className="px-4 py-3">金额</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">日期</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((o: Record<string, unknown>) => {
              const skill = o.skills as Record<string, unknown> | undefined;
              const profile = o.profiles as Record<string, unknown> | undefined;
              return (
                <tr key={o.id as string} className="border-b border-gray-100">
                  <td className="px-4 py-3 font-mono text-xs">
                    {(o.id as string).slice(0, 8)}...
                  </td>
                  <td className="px-4 py-3">{profile?.email as string || "未知"}</td>
                  <td className="px-4 py-3">{skill?.name as string || "未知"}</td>
                  <td className="px-4 py-3">${((o.amount_cents as number) || 0) / 100}</td>
                  <td className="px-4 py-3">{o.status as string}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(o.created_at as string).toLocaleDateString("zh-CN")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
