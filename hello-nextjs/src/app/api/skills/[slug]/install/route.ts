import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSkillBySlug } from "@/lib/db/skills";
import { canAccessSkill } from "@/lib/db/orders";
import { recordInstall } from "@/lib/db/skills";
import { handleSupabaseError } from "@/lib/supabase/errors";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { slug } = await params;
    const skill = await getSkillBySlug(slug);

    const hasAccess = await canAccessSkill(user.id, skill.id);
    if (!hasAccess) {
      return NextResponse.json({ error: "请先购买此技能" }, { status: 403 });
    }

    const body = await request.json();
    await recordInstall(user.id, skill.id, body.version_id, body.client_version);

    return NextResponse.json({ installed: true });
  } catch (error) {
    const appError = handleSupabaseError(error);
    return NextResponse.json({ error: appError.message }, { status: appError.status });
  }
}
