import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSkillBySlug, getSkillVersions, publishSkillVersion } from "@/lib/db/skills";
import { handleSupabaseError } from "@/lib/supabase/errors";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const skill = await getSkillBySlug(slug);
    const versions = await getSkillVersions(skill.id);
    return NextResponse.json(versions);
  } catch (error) {
    const appError = handleSupabaseError(error);
    return NextResponse.json({ error: appError.message }, { status: appError.status });
  }
}

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
    if (skill.author_id !== user.id) {
      return NextResponse.json({ error: "无权操作此技能" }, { status: 403 });
    }

    const body = await request.json();
    const version = await publishSkillVersion(skill.id, body);
    return NextResponse.json(version, { status: 201 });
  } catch (error) {
    const appError = handleSupabaseError(error);
    return NextResponse.json({ error: appError.message }, { status: appError.status });
  }
}
