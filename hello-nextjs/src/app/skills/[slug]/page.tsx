import { getSkillBySlug, getSkillVersions } from "@/lib/db/skills";
import { getSkillReviews } from "@/lib/db/reviews";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import FavoriteButton from "./FavoriteButton";
import InstallButton from "./InstallButton";
import ReviewForm from "./ReviewForm";
import { Star, Download, Tag, Package, History, MessageSquare } from "lucide-react";

export default async function SkillDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ review?: string }>;
}) {
  const { slug } = await params;
  const { review: showReview } = await searchParams;
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
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* Skill header card */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-8 shadow-md">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-500 text-4xl font-bold text-white shadow-lg ring-2 ring-blue-100">
            {skill.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{skill.name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <span>作者：{skill.profiles?.display_name || "匿名"}</span>
              {skill.categories && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                    {(skill.categories as { name?: string }).name}
                  </span>
                </>
              )}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-50 px-3 py-1.5 text-yellow-700 shadow-sm hover:scale-[1.02] transition-transform">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{skill.rating_avg?.toFixed(1) || "0"}</span>
                <span className="text-yellow-500">({skill.rating_count})</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-blue-700 shadow-sm hover:scale-[1.02] transition-transform">
                <Download className="h-4 w-4" />
                <span className="font-semibold">{skill.install_count.toLocaleString()}</span>
                <span className="text-blue-500">安装</span>
              </span>
              <span className={`text-2xl font-extrabold ${isFree ? "text-emerald-600" : "text-gray-900"}`}>
                {isFree ? "免费" : `$${(skill.price_cents / 100).toFixed(2)}`}
              </span>
            </div>
            {skill.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {skill.tags.map((t: string) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    <Tag className="h-3 w-3" /> {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {user && <FavoriteButton slug={slug} />}
          {user && <InstallButton slug={slug} skillId={skill.id} isAuthor={isAuthor} isFree={isFree} />}
        </div>

        {user && showReview === "1" && (
          <div className="mt-6">
            <ReviewForm slug={slug} />
          </div>
        )}

        {skill.description && (
          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Package className="h-5 w-5 text-blue-500" /> 关于此技能
            </h2>
            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap border-l-4 border-blue-200 pl-4">
              {skill.description}
            </div>
          </div>
        )}
      </div>

      {/* Versions */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-8 shadow-md">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <History className="h-5 w-5 text-blue-500" /> 版本历史
        </h2>
        {versions.length > 0 ? (
          <div className="space-y-3">
            {versions.map((v, i) => (
              <div key={v.id} className={`flex items-center gap-4 rounded-xl border p-4 border-l-[3px] transition-all duration-200 ${i === 0 ? "border-blue-200 bg-blue-50/50 border-l-blue-500" : "border-gray-100 border-l-gray-300 hover:border-l-blue-400"}`}>
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${i === 0 ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"}`}>
                  v{v.version.split(".")[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-gray-900">v{v.version}</span>
                    {i === 0 && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-600">最新</span>}
                  </div>
                  {v.changelog && <p className="mt-0.5 text-sm text-gray-500">{v.changelog}</p>}
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(v.created_at).toLocaleDateString("zh-CN")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-4 text-center">暂无版本发布</p>
        )}
      </div>

      {/* Reviews */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-8 shadow-md">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <MessageSquare className="h-5 w-5 text-blue-500" /> 用户评价
        </h2>
        {reviews && reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((r: Record<string, unknown>) => (
              <div key={r.id as string} className="rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-blue-200/50 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-xs font-bold text-white shadow-sm">
                    {((r.profiles as { display_name?: string })?.display_name || "匿").charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {(r.profiles as { display_name?: string })?.display_name || "匿名"}
                    </p>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${star <= (r.rating as number) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(r.created_at as string).toLocaleDateString("zh-CN")}
                  </span>
                </div>
                {typeof r.content === "string" && (
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed pl-12">{r.content}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-4 text-center">暂无评价，成为第一个评价者</p>
        )}
      </div>
    </div>
  );
}
