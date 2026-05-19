import { createClient } from "@/lib/supabase/server";
import { getSkillVersions } from "@/lib/db/skills";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

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
      <Link href="/dashboard" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        &larr; 返回控制台
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">{skill.name}</h1>
      <p className="text-gray-500">状态：{skill.status}</p>

      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="安装量" value={skill.install_count} />
          <StatCard label="评分" value={skill.rating_avg?.toFixed(1) || "-"} />
          <StatCard label="购买量" value={skill.purchase_count} />
          <StatCard label="评价数" value={skill.rating_count} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">版本管理</h2>
        {versions.length === 0 ? (
          <p className="text-sm text-gray-400">暂无版本</p>
        ) : (
          <ul className="space-y-2">
            {versions.map((v) => (
              <li key={v.id} className="flex items-center justify-between rounded border border-gray-200 bg-white p-3">
                <div>
                  <span className="font-mono font-medium">v{v.version}</span>
                  <span className="ml-2 text-xs text-gray-400">{v.status}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(v.created_at).toLocaleDateString("zh-CN")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
