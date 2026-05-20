import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Download, Heart, ShoppingBag, ArrowRight } from "lucide-react";

export default async function LibraryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?callbackUrl=/library");

  const { data: purchases } = await supabase
    .from("purchases")
    .select("*, skills:skill_id(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: installs } = await supabase
    .from("installs")
    .select("*, skills:skill_id(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: favorites } = await supabase
    .from("favorites")
    .select("*, skills:skill_id(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">我的技能库</h1>
      <p className="text-sm text-gray-500 mb-8">管理你已购买、已安装和已收藏的技能</p>

      <div className="space-y-10">
        <Section
          title="已购买" subtitle={`${purchases?.length || 0} 个技能`}
          icon={<ShoppingBag className="h-5 w-5" />} iconBg="bg-emerald-100" iconColor="text-emerald-600"
          items={purchases} emptyHref="/skills" emptyText="浏览商店"
        />
        <Section
          title="已安装" subtitle={`${installs?.length || 0} 个技能`}
          icon={<Download className="h-5 w-5" />} iconBg="bg-blue-100" iconColor="text-blue-600"
          items={installs} emptyHref="/skills" emptyText="浏览可安装技能"
        />
        <Section
          title="已收藏" subtitle={`${favorites?.length || 0} 个技能`}
          icon={<Heart className="h-5 w-5" />} iconBg="bg-red-100" iconColor="text-red-500"
          items={favorites} emptyHref="/skills" emptyText="发现技能"
        />
      </div>
    </div>
  );
}

function Section({
  title, subtitle, icon, iconBg, iconColor,
  items, emptyHref, emptyText,
}: {
  title: string; subtitle: string;
  icon: React.ReactNode; iconBg: string; iconColor: string;
  items: Record<string, unknown>[] | null;
  emptyHref: string; emptyText: string;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-sm ${iconBg} ${iconColor}`}>
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
      </div>
      {items && items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => {
            const skill = item.skills as Record<string, unknown>;
            return (
              <Link
                key={item.id as string}
                href={`/skills/${skill?.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm hover:shadow-lg hover:border-blue-300/50 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-500 text-sm font-bold text-white shadow-md ring-1 ring-blue-400/20 group-hover:shadow-lg transition-shadow">
                  {(skill?.name as string)?.charAt(0) || "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-200">{skill?.name as string || "未知"}</p>
                  <p className="text-xs text-gray-400">
                    {item.created_at
                      ? new Date(item.created_at as string).toLocaleDateString("zh-CN")
                      : ""}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-gray-300/80 bg-gradient-to-b from-gray-50 to-white p-10 text-center hover:border-blue-300/50 transition-colors duration-300">
          <p className="text-sm text-gray-500">暂无记录</p>
          <Link href={emptyHref} className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            {emptyText} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </section>
  );
}
