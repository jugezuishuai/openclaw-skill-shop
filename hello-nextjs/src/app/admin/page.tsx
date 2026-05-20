import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, FileCheck, FolderTree, ShoppingBag, ScrollText, Users } from "lucide-react";

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
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-3 text-lg font-medium text-gray-900">无权访问</p>
          <p className="mt-1 text-sm text-gray-500">需要管理员权限</p>
        </div>
      </div>
    );
  }

  const serviceClient = createServiceClient();

  const { count: skillCount } = await serviceClient
    .from("skills")
    .select("*", { count: "exact", head: true });

  const { count: orderCount } = await serviceClient
    .from("orders")
    .select("*", { count: "exact", head: true });

  const { count: userCount } = await serviceClient
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const links = [
    { href: "/admin/skills", label: "技能审核", desc: "审核和管理所有技能", icon: FileCheck, color: "bg-blue-100 text-blue-600" },
    { href: "/admin/categories", label: "分类管理", desc: "管理技能分类", icon: FolderTree, color: "bg-purple-100 text-purple-600" },
    { href: "/admin/orders", label: "订单概览", desc: "查看所有订单", icon: ShoppingBag, color: "bg-emerald-100 text-emerald-600" },
    { href: "/admin/users", label: "用户管理", desc: "管理用户和权限", icon: Users, color: "bg-purple-100 text-purple-600" },
    { href: "/admin/audit-logs", label: "审计日志", desc: "查看操作记录", icon: ScrollText, color: "bg-orange-100 text-orange-600" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">管理员后台</h1>
        <p className="mt-1 text-sm text-gray-500">平台管理与内容治理</p>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-md hover:shadow-lg transition-shadow duration-200 border-t-[3px] border-t-blue-400">
          <p className="text-3xl font-extrabold text-gray-900">{skillCount || 0}</p>
          <p className="mt-1 text-sm text-gray-500">技能总数</p>
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-md hover:shadow-lg transition-shadow duration-200 border-t-[3px] border-t-emerald-400">
          <p className="text-3xl font-extrabold text-gray-900">{orderCount || 0}</p>
          <p className="mt-1 text-sm text-gray-500">订单总数</p>
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-md hover:shadow-lg transition-shadow duration-200 border-t-[3px] border-t-purple-400">
          <p className="text-3xl font-extrabold text-gray-900">{userCount || 0}</p>
          <p className="mt-1 text-sm text-gray-500">用户总数</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm hover:shadow-lg hover:border-blue-300/50 transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="flex items-start gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${link.color} group-hover:scale-110 transition-transform duration-200`}>
                <link.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{link.label}</h3>
                <p className="mt-1 text-sm text-gray-500">{link.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
