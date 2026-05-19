import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSkillBySlug } from "@/lib/db/skills";
import { getSkillReviews, createReview } from "@/lib/db/reviews";
import { handleSupabaseError } from "@/lib/supabase/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const skill = await getSkillBySlug(slug);
    const page = Number(request.nextUrl.searchParams.get("page")) || 1;
    const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 10, 50);
    const result = await getSkillReviews(skill.id, page, limit);
    return NextResponse.json(result);
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
    const body = await request.json();
    const review = await createReview(user.id, skill.id, body);
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    const appError = handleSupabaseError(error);
    return NextResponse.json({ error: appError.message }, { status: appError.status });
  }
}
