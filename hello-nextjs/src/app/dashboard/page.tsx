import { createClient } from "@/lib/supabase/server";
import { getUserSkills } from "@/lib/db/skills";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle, Eye, BarChart3, Star, Download, ArrowRight } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import SkillStatusActions from "@/components/dashboard/SkillStatusActions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?callbackUrl=/dashboard");

  const skills = await getUserSkills(user.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">作者控制台</h1>
          <p className="mt-1 text-sm text-gray-500">管理你发布的所有技能</p>
          <div className="mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
        </div>
        <Link
          href="/publish"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-[0.97] transition-all duration-200"
        >
          <PlusCircle className="h-4 w-4" /> 发布新技能
        </Link>
      </div>

      {skills.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-300/80 bg-white p-16 text-center animate-[fadeIn_0.4s_ease]">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-3 text-lg font-medium text-gray-900">还没有发布任何技能</p>
          <p className="mt-1 text-sm text-gray-500">创建你的第一个技能，与社区分享吧</p>
          <Link
            href="/publish"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-[0.97] transition-all duration-200"
          >
            开始发布 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {skills.map((skill) => {
            const statusBorderColor: Record<string, string> = {
              draft: "border-l-gray-300",
              pending_review: "border-l-yellow-400",
              published: "border-l-emerald-400",
              rejected: "border-l-red-400",
              suspended: "border-l-red-400",
              archived: "border-l-gray-300",
            };
            return (
            <div key={skill.id} className={`rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm hover:shadow-lg transition-all duration-200 border-l-[3px] ${statusBorderColor[skill.status] || "border-l-gray-300"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-500 text-lg font-bold text-white shadow-md ring-1 ring-blue-400/20">
                    {skill.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{skill.name}</p>
                    <p className="text-xs text-gray-400">{skill.slug}</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-6 text-sm text-gray-500">
                  <div className="text-center">
                    <p className="flex items-center gap-1"><Download className="h-3.5 w-3.5" />{skill.install_count}</p>
                    <p className="text-xs text-gray-400">安装</p>
                  </div>
                  <div className="text-center">
                    <p className="flex items-center gap-1"><Star className="h-3.5 w-3.5" />{skill.rating_avg?.toFixed(1) || "-"}</p>
                    <p className="text-xs text-gray-400">评分</p>
                  </div>
                  <StatusBadge status={skill.status} />
                  <SkillStatusActions skillSlug={skill.slug} currentStatus={skill.status} />
                </div>
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/skills/${skill.slug}`}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                    title="预览"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/dashboard/skills/${skill.id}`}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    管理
                  </Link>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}
