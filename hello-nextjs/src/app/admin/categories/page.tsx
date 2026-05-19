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
      <h1 className="mb-6 text-2xl font-bold text-gray-900">分类管理</h1>
      <div className="rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3">名称</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">排序</th>
              <th className="px-4 py-3">状态</th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((c) => (
              <tr key={c.id} className="border-b border-gray-100">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-gray-500">{c.slug}</td>
                <td className="px-4 py-3">{c.sort_order}</td>
                <td className="px-4 py-3">
                  {c.enabled ? (
                    <span className="text-green-600">启用</span>
                  ) : (
                    <span className="text-gray-400">禁用</span>
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
