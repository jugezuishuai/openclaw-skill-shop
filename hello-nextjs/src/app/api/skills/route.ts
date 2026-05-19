import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listSkills, createSkill } from "@/lib/db/skills";
import { handleSupabaseError } from "@/lib/supabase/errors";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  try {
    const result = await listSkills({
      category: searchParams.get("category") || undefined,
      keyword: searchParams.get("keyword") || undefined,
      pricing_type: (searchParams.get("pricing_type") as "free" | "paid") || undefined,
      sort: (searchParams.get("sort") as "latest" | "popular" | "rating") || "latest",
      page: Number(searchParams.get("page")) || 1,
      limit: Math.min(Number(searchParams.get("limit")) || 12, 50),
    });

    return NextResponse.json(result);
  } catch (error) {
    const appError = handleSupabaseError(error);
    return NextResponse.json(
      { error: appError.message },
      { status: appError.status }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const body = await request.json();
    const skill = await createSkill(user.id, body);

    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    const appError = handleSupabaseError(error);
    return NextResponse.json(
      { error: appError.message },
      { status: appError.status }
    );
  }
}
