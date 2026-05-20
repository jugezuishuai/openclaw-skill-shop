import { createClient } from "@/lib/supabase/server";
import { getSkillVersions } from "@/lib/db/skills";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Star, ShoppingBag, MessageSquare } from "lucide-react";

export default async function SkillManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const { data: skill } = await supabase
    .from("skills")
    .select("*")
    .eq("id", id)
    .single();

  if (!skill || skill.author_id !== user.id) notFound();

  const versions = await getSkillVersions(skill.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回控制台
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 text-2xl font-bold text-white shadow-sm">
          {skill.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{skill.name}</h1>
          <p className="text-sm text-gray-500">状态：{skill.status}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-10">
        <StatCard label="安装量" value={skill.install_count} icon={<Download className="h-4 w-4" />} />
        <StatCard label="评分" value={skill.rating_avg?.toFixed(1) || "-"} icon={<Star className="h-4 w-4" />} />
        <StatCard label="购买量" value={skill.purchase_count} icon={<ShoppingBag className="h-4 w-4" />} />
        <StatCard label="评价数" value={skill.rating_count} icon={<MessageSquare className="h-4 w-4" />} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">版本管理</h2>
        {versions.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">暂无版本</p>
        ) : (
          <div className="space-y-3">
            {versions.map((v, i) => (
              <div key={v.id} className={`flex items-center justify-between rounded-xl border p-4 ${i === 0 ? "border-blue-200 bg-blue-50/50" : "border-gray-100"}`}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${i === 0 ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"}`}>
                    v{v.version.split(".")[0]}
                  </div>
                  <div>
                    <span className="font-mono font-semibold text-gray-900">v{v.version}</span>
                    {i === 0 && <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-600">最新</span>}
                    <span className="ml-2 text-xs text-gray-400">{v.status}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(v.created_at).toLocaleDateString("zh-CN")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-center">
      <div className="mb-1 inline-flex text-gray-400">{icon}</div>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
