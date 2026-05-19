import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSkillBySlug } from "@/lib/db/skills";
import { createOrder, getUserOrders } from "@/lib/db/orders";
import { handleSupabaseError } from "@/lib/supabase/errors";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const orders = await getUserOrders(user.id);
    return NextResponse.json(orders);
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

    const order = await createOrder(user.id, skill.id, skill.price_cents);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const appError = handleSupabaseError(error);
    return NextResponse.json({ error: appError.message }, { status: appError.status });
  }
}
