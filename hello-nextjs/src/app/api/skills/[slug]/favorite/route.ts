import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSkillBySlug } from "@/lib/db/skills";
import { favoriteSkill, unfavoriteSkill } from "@/lib/db/skills";
import { handleSupabaseError } from "@/lib/supabase/errors";

export async function POST(
  _request: NextRequest,
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
    await favoriteSkill(user.id, skill.id);
    return NextResponse.json({ favorited: true });
  } catch (error) {
    const appError = handleSupabaseError(error);
    return NextResponse.json({ error: appError.message }, { status: appError.status });
  }
}

export async function DELETE(
  _request: NextRequest,
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
    await unfavoriteSkill(user.id, skill.id);
    return NextResponse.json({ favorited: false });
  } catch (error) {
    const appError = handleSupabaseError(error);
    return NextResponse.json({ error: appError.message }, { status: appError.status });
  }
}
