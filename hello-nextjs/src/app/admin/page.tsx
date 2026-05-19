import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return <p className="p-8 text-center text-gray-500">无权访问</p>;
  }

  const { count: skillCount } = await supabase
    .from("skills")
    .select("*", { count: "exact", head: true });

  const { count: orderCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const links = [
    { href: "/admin/skills", label: "技能审核", desc: "审核和管理所有技能" },
    { href: "/admin/categories", label: "分类管理", desc: "管理技能分类" },
    { href: "/admin/orders", label: "订单概览", desc: "查看所有订单" },
    { href: "/admin/audit-logs", label: "审计日志", desc: "查看操作记录" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">管理员后台</h1>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold">{skillCount || 0}</p>
          <p className="text-sm text-gray-500">技能总数</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold">{orderCount || 0}</p>
          <p className="text-sm text-gray-500">订单总数</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <p className="text-2xl font-bold">{userCount || 0}</p>
          <p className="text-sm text-gray-500">用户总数</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg border border-gray-200 bg-white p-6 hover:shadow-sm hover:border-blue-200 transition-all"
          >
            <h3 className="font-semibold text-gray-900">{link.label}</h3>
            <p className="mt-1 text-sm text-gray-500">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
