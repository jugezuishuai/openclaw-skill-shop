import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminSkillsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: skills } = await supabase
    .from("skills")
    .select("*, profiles:author_id(display_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">技能审核</h1>
      <div className="rounded-lg border border-gray-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3">名称</th>
              <th className="px-4 py-3">作者</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">安装</th>
              <th className="px-4 py-3">日期</th>
            </tr>
          </thead>
          <tbody>
            {skills?.map((s: Record<string, unknown>) => (
              <tr key={s.id as string} className="border-b border-gray-100">
                <td className="px-4 py-3 font-medium">{s.name as string}</td>
                <td className="px-4 py-3 text-gray-500">
                  {(s.profiles as { display_name?: string })?.display_name || "匿名"}
                </td>
                <td className="px-4 py-3">{s.status as string}</td>
                <td className="px-4 py-3">{s.install_count as number}</td>
                <td className="px-4 py-3 text-gray-400">
                  {new Date(s.created_at as string).toLocaleDateString("zh-CN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
