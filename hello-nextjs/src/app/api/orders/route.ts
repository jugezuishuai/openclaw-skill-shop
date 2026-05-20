import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSkillBySlug } from "@/lib/db/skills";
import { createOrder, getUserOrders, markOrderPaid } from "@/lib/db/orders";
import { handleSupabaseError } from "@/lib/supabase/errors";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const status = request.nextUrl.searchParams.get("status") || undefined;
    const page = Number(request.nextUrl.searchParams.get("page")) || 1;
    const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 10, 50);

    const result = await getUserOrders(user.id, { status, page, limit });
    return NextResponse.json(result);
  } catch (error) {
    const appError = handleSupabaseError(error);
    return NextResponse.json({ error: appError.message }, { status: appError.status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const body = await request.json();
    const skill = await getSkillBySlug(body.slug);

    if (skill.pricing_type === "free") {
      const { data: purchase } = await supabase
        .from("purchases")
        .insert({ user_id: user.id, skill_id: skill.id })
        .select()
        .single();

      return NextResponse.json({ purchase, free: true });
    }

    // Check if user already owns this skill
    const { data: existingPurchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("skill_id", skill.id)
      .maybeSingle();

    if (existingPurchase) {
      return NextResponse.json(
        { error: "您已购买过此技能", paid: true, skill_name: skill.name, skill_slug: skill.slug },
        { status: 200 }
      );
    }

    // For paid skills: create order and auto-mark as paid (mock payment)
    const order = await createOrder(user.id, skill.id, skill.price_cents);
    const result = await markOrderPaid(order.id, "auto_" + Date.now());

    return NextResponse.json({ ...result, paid: true, skill_name: skill.name, skill_slug: skill.slug }, { status: 201 });
  } catch (error) {
    const appError = handleSupabaseError(error);
    return NextResponse.json({ error: appError.message }, { status: appError.status });
  }
}
