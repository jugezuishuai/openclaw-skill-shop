import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listSkills, type Skill } from "@/lib/db/skills";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("enabled", true)
    .order("sort_order", { ascending: true });

  const { data: latestSkills } = await listSkills({ sort: "latest", limit: 6 });
  const { data: popularSkills } = await listSkills({ sort: "popular", limit: 6 });
  const { data: freeSkills } = await listSkills({ pricing_type: "free", limit: 3 });

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-20 text-center text-white">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          OpenClaw Skill Shop
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
          发现、安装和分享高质量的 OpenClaw 技能包
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/skills"
            className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-600 shadow-md hover:bg-gray-50 transition-colors"
          >
            浏览商店
          </Link>
          {user ? (
            <Link
              href="/publish"
              className="rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white shadow-md hover:bg-blue-400 transition-colors"
            >
              发布技能
            </Link>
          ) : (
            <Link
              href="/register"
              className="rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white shadow-md hover:bg-blue-400 transition-colors"
            >
              免费注册
            </Link>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 space-y-16">
        {Array.isArray(categories) && categories.length > 0 && (
          <section>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">热门分类</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {categories.map((cat: { id: string; name: string; slug: string }) => (
                <Link
                  key={cat.id}
                  href={`/skills?category=${cat.slug}`}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-center text-sm font-medium text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {latestSkills.length > 0 && (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">最新上架</h2>
              <Link href="/skills?sort=latest" className="text-sm text-blue-600 hover:underline">
                查看全部
              </Link>
            </div>
            <SkillGrid skills={latestSkills} />
          </section>
        )}

        {popularSkills.length > 0 && (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">热门技能</h2>
              <Link href="/skills?sort=popular" className="text-sm text-blue-600 hover:underline">
                查看全部
              </Link>
            </div>
            <SkillGrid skills={popularSkills} />
          </section>
        )}

        {freeSkills.length > 0 && (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">免费技能</h2>
              <Link href="/skills?pricing_type=free" className="text-sm text-blue-600 hover:underline">
                查看全部
              </Link>
            </div>
            <SkillGrid skills={freeSkills} />
          </section>
        )}

        {latestSkills.length === 0 && (
          <section className="py-16 text-center">
            <p className="text-lg text-gray-500">还没有发布的技能。成为第一个发布者！</p>
            <Link
              href="/publish"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors"
            >
              发布技能
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}

function SkillGrid({ skills }: { skills: Skill[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {skills.map((skill) => (
        <Link
          key={skill.id}
          href={`/skills/${skill.slug}`}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
        >
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 font-bold">
              {skill.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{skill.name}</h3>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>★ {skill.rating_avg || 0}</span>
                <span>·</span>
                <span>↓ {skill.install_count || 0}</span>
              </div>
            </div>
          </div>
          <p className="line-clamp-2 text-sm text-gray-500">
            {skill.short_description || "暂无简介"}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-900">
              {skill.pricing_type === "paid"
                ? `$${(skill.price_cents || 0) / 100}`
                : "免费"}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
