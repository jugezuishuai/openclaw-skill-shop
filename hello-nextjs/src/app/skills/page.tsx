import Link from "next/link";
import { listSkills } from "@/lib/db/skills";
import SkillCard from "@/components/skill/SkillCard";
import { createClient } from "@/lib/supabase/server";
import SearchBar from "./SearchBar";

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("enabled", true)
    .order("sort_order", { ascending: true });

  const { data: skills, total } = await listSkills({
    category: params.category,
    keyword: params.keyword,
    pricing_type: (params.pricing_type as "free" | "paid") || undefined,
    sort: (params.sort as "latest" | "popular" | "rating") || "latest",
    page: Number(params.page) || 1,
    limit: 12,
  });

  const totalPages = Math.ceil(total / 12);
  const currentSort = params.sort || "latest";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">技能商店</h1>
      <p className="mt-1 text-sm text-gray-500">探索 {total} 个优质技能</p>
      <div className="mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />

      <div className="mt-6">
        <SearchBar defaultValue={params.keyword} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/skills"
          className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${!params.category ? "bg-blue-600 text-white shadow-md" : "bg-white border border-gray-200/80 text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 transition-all duration-200 active:scale-[0.96]"}`}
        >
          全部
        </Link>
        {Array.isArray(categories) &&
          categories.map((cat: { id: string; name: string; slug: string }) => (
            <Link
              key={cat.id}
              href={`/skills?category=${cat.slug}`}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${params.category === cat.slug ? "bg-blue-600 text-white shadow-md" : "bg-white border border-gray-200/80 text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 transition-all duration-200 active:scale-[0.96]"}`}
            >
              {cat.name}
            </Link>
          ))}
      </div>

      <div className="mt-5 flex items-center gap-1 rounded-xl bg-white border border-gray-200/80 p-1 w-fit shadow-sm">
        {[
          { key: "latest", label: "最新" },
          { key: "popular", label: "最热" },
          { key: "rating", label: "评分" },
        ].map(({ key, label }) => (
          <Link
            key={key}
            href={`/skills?${buildQuery(params, { sort: key })}`}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${currentSort === key || (!params.sort && key === "latest") ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {skills.length > 0 ? (
        <>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={`/skills?${buildQuery(params, { page: String(page) })}`}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${(Number(params.page) || 1) === page ? "bg-blue-600 text-white shadow-md" : "bg-white border border-gray-200/80 text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 transition-all duration-200 active:scale-[0.96]"}`}
                >
                  {page}
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="py-20 text-center">
          <p className="text-lg font-medium text-gray-900">
            {params.keyword ? `未找到包含 "${params.keyword}" 的技能` : "暂无技能"}
          </p>
          <p className="mt-1 text-sm text-gray-500">换个关键词试试，或浏览其他分类</p>
        </div>
      )}
    </div>
  );
}

function buildQuery(
  current: Record<string, string | undefined>,
  overrides: Record<string, string>
): string {
  const params = new URLSearchParams();
  const merged = { ...current, ...overrides };
  Object.entries(merged).forEach(([k, v]) => {
    if (v && !(k === "page" && v === "1")) params.set(k, v);
  });
  return params.toString();
}
