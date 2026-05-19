import { getSkillBySlug, getSkillVersions } from "@/lib/db/skills";
import { getSkillReviews } from "@/lib/db/reviews";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import FavoriteButton from "./FavoriteButton";
import InstallButton from "./InstallButton";
import { Star, Download, Tag } from "lucide-react";

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let skill;
  try {
    skill = await getSkillBySlug(slug);
  } catch {
    notFound();
  }

  const versions = await getSkillVersions(skill.id);
  const { data: reviews } = await getSkillReviews(skill.id, 1, 10);

  const isAuthor = user?.id === skill.author_id;
  const isFree = skill.pricing_type === "free";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-3xl font-bold text-blue-600">
            {skill.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{skill.name}</h1>
            <p className="mt-1 text-gray-500">
              作者：{skill.profiles?.display_name || "匿名"}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400" />
                {skill.rating_avg?.toFixed(1) || "0"} ({skill.rating_count})
              </span>
              <span className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                {skill.install_count} 安装
              </span>
              <span className="text-lg font-bold text-gray-900">
                {isFree ? "免费" : `$${(skill.price_cents || 0) / 100}`}
              </span>
            </div>
            {skill.tags?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {skill.tags.map((t: string) => (
                  <span key={t} className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    <Tag className="h-3 w-3" /> {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          {user && <FavoriteButton slug={slug} />}
          {user && <InstallButton slug={slug} skillId={skill.id} isAuthor={isAuthor} isFree={isFree} />}
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">关于此技能</h2>
          <p className="whitespace-pre-wrap text-gray-600 leading-relaxed">
            {skill.description || skill.short_description || "暂无详细描述"}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">版本历史</h2>
        {versions.length > 0 ? (
          <ul className="space-y-3">
            {versions.map((v) => (
              <li key={v.id} className="rounded border border-gray-100 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-medium">v{v.version}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(v.created_at).toLocaleDateString("zh-CN")}
                  </span>
                </div>
                {v.changelog && (
                  <p className="mt-1 text-sm text-gray-500">{v.changelog}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">暂无版本发布</p>
        )}
      </div>

      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">评价</h2>
        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((r: Record<string, unknown>) => (
              <div key={r.id as string} className="rounded border border-gray-100 p-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {(r.profiles as { display_name?: string })?.display_name || "匿名"}
                  </span>
                  <span className="text-yellow-400">
                    {"★".repeat(r.rating as number)}{"☆".repeat(5 - (r.rating as number))}
                  </span>
                </div>
                {typeof r.content === "string" && <p className="mt-1 text-sm text-gray-600">{r.content}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">暂无评价</p>
        )}
      </div>
    </div>
  );
}
