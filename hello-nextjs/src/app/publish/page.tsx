import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SkillBasicForm from "@/components/publish/SkillBasicForm";

export default async function PublishPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?callbackUrl=/publish");

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("enabled", true)
    .order("sort_order");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">发布技能</h1>
      <p className="mb-8 text-gray-500">填写以下信息创建新技能草稿</p>
      <SkillBasicForm categories={categories || []} />
    </div>
  );
}
