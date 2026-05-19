import { createClient } from "@/lib/supabase/server";
import { getUserSkills } from "@/lib/db/skills";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle, Edit, Eye } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?callbackUrl=/dashboard");

  const skills = await getUserSkills(user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">作者控制台</h1>
        <Link
          href="/publish"
          className="flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          <PlusCircle className="h-4 w-4" /> 发布新技能
        </Link>
      </div>

      {skills.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">你还没有发布任何技能</p>
          <Link href="/publish" className="mt-4 inline-block text-blue-600 hover:underline">
            发布你的第一个技能
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">技能</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">安装</th>
                <th className="px-4 py-3 font-medium">评分</th>
                <th className="px-4 py-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((skill) => (
                <tr key={skill.id} className="border-b border-gray-100">
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">{skill.name}</span>
                    <span className="ml-2 text-xs text-gray-400">{skill.slug}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={skill.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{skill.install_count}</td>
                  <td className="px-4 py-3 text-gray-600">{skill.rating_avg?.toFixed(1) || "-"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/skills/${skill.slug}`} className="rounded p-1 text-gray-400 hover:text-blue-600">
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link href={`/dashboard/skills/${skill.id}`} className="rounded p-1 text-gray-400 hover:text-blue-600">
                        <Edit className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    pending_review: "bg-yellow-100 text-yellow-700",
    published: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-600",
    suspended: "bg-red-100 text-red-600",
    archived: "bg-gray-100 text-gray-400",
  };
  const labels: Record<string, string> = {
    draft: "草稿",
    pending_review: "待审",
    published: "已发布",
    rejected: "已驳回",
    suspended: "已下架",
    archived: "已归档",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || ""}`}>
      {labels[status] || status}
    </span>
  );
}
