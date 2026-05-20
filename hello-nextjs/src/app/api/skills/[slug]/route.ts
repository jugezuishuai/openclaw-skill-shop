import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getSkillBySlug } from "@/lib/db/skills";
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const isAdmin = profile?.role === "admin";
    const { slug } = await params;

    // Admin uses service client to bypass RLS
    const client = isAdmin ? createServiceClient() : supabase;

    // Look up skill — use the same client so admin can see non-published skills
    const { data: skill } = await client
      .from("skills")
      .select("id, author_id, slug")
      .eq("slug", slug)
      .maybeSingle();

    if (!skill) {
      return NextResponse.json({ error: "技能不存在" }, { status: 404 });
    }

    if (!isAdmin && skill.author_id !== user.id) {
      return NextResponse.json({ error: "无权修改此技能" }, { status: 403 });
    }

    const body = await request.json();
    const { data: updated, error } = await client
      .from("skills")
      .update(body)
      .eq("id", skill.id)
      .select()
      .maybeSingle();

    if (error) throw error;

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const isAdmin = profile?.role === "admin";
    const { slug } = await params;

    const client = isAdmin ? createServiceClient() : supabase;

    const { data: skill } = await client
      .from("skills")
      .select("id, author_id, slug")
      .eq("slug", slug)
      .maybeSingle();

    if (!skill) {
      return NextResponse.json({ error: "技能不存在" }, { status: 404 });
    }

    if (!isAdmin && skill.author_id !== user.id) {
      return NextResponse.json({ error: "无权删除此技能" }, { status: 403 });
    }

    const { data: updated, error } = await client
      .from("skills")
      .update({ status: "archived" })
      .eq("id", skill.id)
      .select()
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json(updated);
  } catch (error) {
    const appError = handleSupabaseError(error);
    return NextResponse.json(
      { error: appError.message },
      { status: appError.status }
    );
  }
}
