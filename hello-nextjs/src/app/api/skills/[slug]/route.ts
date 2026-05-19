import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSkillBySlug, updateSkill } from "@/lib/db/skills";
import { handleSupabaseError } from "@/lib/supabase/errors";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const skill = await getSkillBySlug(slug);
    return NextResponse.json(skill);
  } catch (error) {
    const appError = handleSupabaseError(error);
    return NextResponse.json(
      { error: appError.message },
      { status: appError.status }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { slug } = await params;
    const skill = await getSkillBySlug(slug);

    if (skill.author_id !== user.id) {
      const isAdmin = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
        .then(({ data }) => data?.role === "admin");

      if (!isAdmin) {
        return NextResponse.json({ error: "无权修改此技能" }, { status: 403 });
      }
    }

    const body = await request.json();
    const updated = await updateSkill(skill.id, body);

    return NextResponse.json(updated);
  } catch (error) {
    const appError = handleSupabaseError(error);
    return NextResponse.json(
      { error: appError.message },
      { status: appError.status }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { slug } = await params;
    const skill = await getSkillBySlug(slug);

    if (skill.author_id !== user.id) {
      const isAdmin = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
        .then(({ data }) => data?.role === "admin");

      if (!isAdmin) {
        return NextResponse.json({ error: "无权删除此技能" }, { status: 403 });
      }
    }

    const updated = await updateSkill(skill.id, { status: "archived" });

    return NextResponse.json(updated);
  } catch (error) {
    const appError = handleSupabaseError(error);
    return NextResponse.json(
      { error: appError.message },
      { status: appError.status }
    );
  }
}
