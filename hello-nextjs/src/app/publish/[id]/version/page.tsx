import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import PackageUploader from "@/components/publish/PackageUploader";

export default async function PublishVersionPage({
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">发布新版本</h1>
      <p className="mb-6 text-gray-500">为 &ldquo;{skill.name}&rdquo; 上传新版本</p>
      <PackageUploader skillId={skill.id} skillSlug={skill.slug} />
    </div>
  );
}
