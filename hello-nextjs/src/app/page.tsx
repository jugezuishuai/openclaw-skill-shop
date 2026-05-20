import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listSkills } from "@/lib/db/skills";
import SkillCard from "@/components/skill/SkillCard";
import { Search, Star, TrendingUp, Zap, ArrowRight } from "lucide-react";

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
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 px-4 py-24 text-center text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDYwIEwgNjAgMCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.12),transparent_70%)]" />
        <div className="relative mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm backdrop-blur-sm animate-[fadeInUp_0.6s_ease]">
            <Zap className="h-3.5 w-3.5 text-yellow-400" />
            <span className="text-blue-100">现已支持 10+ 优质技能</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl animate-[fadeInUp_0.8s_ease]">
            OpenClaw <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">Skill Shop</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-blue-100/90 animate-[fadeInUp_0.8s_ease]">
            发现、安装和分享高质量的 OpenClaw 技能包。让 AI 更强大，让工作更高效。
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center animate-[fadeInUp_1s_ease]">
            <Link
              href="/skills"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-blue-700 shadow-lg hover:bg-blue-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Search className="h-4 w-4" /> 浏览商店
            </Link>
            {user ? (
              <Link
                href="/publish"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-6 py-3 font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-all"
              >
                发布技能 <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-6 py-3 font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-all"
              >
                免费注册 <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 space-y-16">
        {/* Categories */}
        {Array.isArray(categories) && categories.length > 0 && (
          <section>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl shadow-sm bg-indigo-100">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">热门分类</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              {categories.map((cat: { id: string; name: string; slug: string; description?: string }) => (
                <Link
                  key={cat.id}
                  href={`/skills?category=${cat.slug}`}
                  className="group rounded-xl border border-gray-200/80 bg-white p-4 text-center hover:border-blue-300 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                >
                  <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{cat.name}</p>
                  {cat.description && (
                    <p className="mt-1 text-xs text-gray-400 line-clamp-1">{cat.description}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Latest */}
        {latestSkills.length > 0 && (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl shadow-sm bg-green-100">
                  <Zap className="h-4 w-4 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">最新上架</h2>
              </div>
              <Link href="/skills?sort=latest" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                查看全部 <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestSkills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          </section>
        )}

        {/* Popular */}
        {popularSkills.length > 0 && (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl shadow-sm bg-orange-100">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">热门技能</h2>
              </div>
              <Link href="/skills?sort=popular" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                查看全部 <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {popularSkills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          </section>
        )}

        {/* Free */}
        {freeSkills.length > 0 && (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl shadow-sm bg-emerald-100">
                  <Star className="h-4 w-4 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">免费技能</h2>
              </div>
              <Link href="/skills?pricing_type=free" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                查看全部 <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {freeSkills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {latestSkills.length === 0 && (
          <section className="py-16 text-center animate-[fadeIn_0.4s_ease]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner">
              <PackageIcon className="h-8 w-8 text-gray-400" />
            </div>
            <p className="mt-4 text-lg font-medium text-gray-900">还没有发布的技能</p>
            <p className="mt-1 text-sm text-gray-500">成为第一个发布者，分享你的技能！</p>
            <Link
              href="/publish"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-[0.97] transition-all duration-200"
            >
              发布技能 <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
  );
}
