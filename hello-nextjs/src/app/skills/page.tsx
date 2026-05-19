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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">技能商店</h1>

      <SearchBar defaultValue={params.keyword} />

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/skills"
          className={`rounded-full px-3 py-1 text-sm ${!params.category ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          全部
        </Link>
        {Array.isArray(categories) &&
          categories.map((cat: { id: string; name: string; slug: string }) => (
            <Link
              key={cat.id}
              href={`/skills?category=${cat.slug}`}
              className={`rounded-full px-3 py-1 text-sm ${params.category === cat.slug ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {cat.name}
            </Link>
          ))}
      </div>

      <div className="mt-4 flex items-center gap-3 text-sm">
        <span className="text-gray-500">排序：</span>
        <Link
          href={`/skills?${buildQuery(params, { sort: "latest" })}`}
          className={params.sort !== "popular" && params.sort !== "rating" ? "text-blue-600 font-medium" : "text-gray-500"}
        >
          最新
        </Link>
        <Link
          href={`/skills?${buildQuery(params, { sort: "popular" })}`}
          className={params.sort === "popular" ? "text-blue-600 font-medium" : "text-gray-500"}
        >
          最热
        </Link>
        <Link
          href={`/skills?${buildQuery(params, { sort: "rating" })}`}
          className={params.sort === "rating" ? "text-blue-600 font-medium" : "text-gray-500"}
        >
          评分
        </Link>
      </div>

      {skills.length > 0 ? (
        <>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={`/skills?${buildQuery(params, { page: String(page) })}`}
                  className={`rounded-md px-3 py-1 text-sm ${(Number(params.page) || 1) === page ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
                >
                  {page}
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="py-16 text-center">
          <p className="text-lg text-gray-500">
            {params.keyword ? `未找到包含 "${params.keyword}" 的技能` : "暂无技能"}
          </p>
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
