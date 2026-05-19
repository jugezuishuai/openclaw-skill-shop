"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createSkill } from "@/lib/db/skills";

export async function publishSkill(
  prevState: { error: string; success: string },
  formData: FormData
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "请先登录", success: "" };
  }

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const category_id = formData.get("category_id") as string;
  const short_description = formData.get("short_description") as string;
  const description = formData.get("description") as string;
  const pricing_type = formData.get("pricing_type") as "free" | "paid";
  const tagsStr = formData.get("tags") as string;

  if (!name || !slug) {
    return { error: "名称和 slug 为必填项", success: "" };
  }

  try {
    await createSkill(user.id, {
      name,
      slug,
      category_id: category_id || undefined,
      short_description: short_description || undefined,
      description: description || undefined,
      pricing_type: pricing_type || "free",
      tags: tagsStr ? tagsStr.split(",").map((t) => t.trim()).filter(Boolean) : [],
    });

    revalidatePath("/dashboard");
    revalidatePath("/publish");
    redirect(`/dashboard`);
  } catch (e) {
    return { error: (e as Error).message || "创建失败", success: "" };
  }
}
