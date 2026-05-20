import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StatusBadge from "@/components/ui/StatusBadge";
import AdminSkillActions from "@/components/admin/AdminSkillActions";

export default async function AdminSkillsPage() {
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
  const { data: skills } = await serviceClient
    .from("skills")
    .select("*, profiles:author_id(display_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">技能审核</h1>
      <p className="text-sm text-gray-500 mb-8">审核和管理平台所有技能</p>
      <div className="rounded-xl border border-gray-200/80 bg-white overflow-x-auto shadow-md">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100/50 text-left text-gray-600 border-b-2">
            <tr>
              <th className="px-5 py-3.5 font-medium">名称</th>
              <th className="px-5 py-3.5 font-medium">作者</th>
              <th className="px-5 py-3.5 font-medium">状态</th>
              <th className="px-5 py-3.5 font-medium">安装</th>
              <th className="px-5 py-3.5 font-medium">日期</th>
              <th className="px-5 py-3.5 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {skills?.map((s: Record<string, unknown>) => (
              <tr key={s.id as string} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors duration-150">
                <td className="px-5 py-3.5 font-medium text-gray-900">{s.name as string}</td>
                <td className="px-5 py-3.5 text-gray-500">
                  {(s.profiles as { display_name?: string })?.display_name || "匿名"}
                </td>
                <td className="px-5 py-3.5"><StatusBadge status={s.status as string} /></td>
                <td className="px-5 py-3.5 text-gray-600">{s.install_count as number}</td>
                <td className="px-5 py-3.5 text-gray-400">
                  {new Date(s.created_at as string).toLocaleDateString("zh-CN")}
                </td>
                <td className="px-5 py-3.5">
                  <AdminSkillActions
                    skillSlug={s.slug as string}
                    currentStatus={s.status as "draft" | "pending_review" | "published" | "rejected" | "suspended" | "archived"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
