import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">分类管理</h1>
      <p className="text-sm text-gray-500 mb-8">管理技能分类和排序</p>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100/50 text-left text-gray-600 border-b-2">
            <tr>
              <th className="px-5 py-3.5 font-medium">名称</th>
              <th className="px-5 py-3.5 font-medium">Slug</th>
              <th className="px-5 py-3.5 font-medium">排序</th>
              <th className="px-5 py-3.5 font-medium">状态</th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors duration-150">
                <td className="px-5 py-3.5 font-medium text-gray-900">{c.name}</td>
                <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">{c.slug}</td>
                <td className="px-5 py-3.5 text-gray-600">{c.sort_order}</td>
                <td className="px-5 py-3.5">
                  {c.enabled ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> 启用
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">禁用</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
