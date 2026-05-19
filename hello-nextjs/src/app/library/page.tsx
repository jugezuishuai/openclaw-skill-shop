import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Download, Heart, ShoppingBag } from "lucide-react";

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
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-10">
      <h1 className="text-2xl font-bold text-gray-900">我的技能库</h1>

      <Section title="已购买" icon={<ShoppingBag className="h-5 w-5" />} items={purchases} emptyHref="/skills" emptyText="浏览商店" />
      <Section title="已安装" icon={<Download className="h-5 w-5" />} items={installs} emptyHref="/skills" emptyText="浏览可安装技能" />
      <Section title="已收藏" icon={<Heart className="h-5 w-5" />} items={favorites} emptyHref="/skills" emptyText="发现技能" />
    </div>
  );
}

function Section({
  title,
  icon,
  items,
  emptyHref,
  emptyText,
}: {
  title: string;
  icon: React.ReactNode;
  items: Record<string, unknown>[] | null;
  emptyHref: string;
  emptyText: string;
}) {
  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
        {icon} {title}
      </h2>
      {items && items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => {
            const skill = item.skills as Record<string, unknown>;
            return (
              <Link
                key={item.id as string}
                href={`/skills/${skill?.slug}`}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:shadow-sm hover:border-blue-200 transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 font-bold text-blue-600">
                  {(skill?.name as string)?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{skill?.name as string || "未知"}</p>
                  <p className="text-xs text-gray-400">
                    {item.created_at
                      ? new Date(item.created_at as string).toLocaleDateString("zh-CN")
                      : ""}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-500">暂无记录</p>
          <Link href={emptyHref} className="mt-1 inline-block text-sm text-blue-600 hover:underline">
            {emptyText}
          </Link>
        </div>
      )}
    </section>
  );
}
