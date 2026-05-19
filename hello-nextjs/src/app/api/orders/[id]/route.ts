import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrderById } from "@/lib/db/orders";
import { handleSupabaseError } from "@/lib/supabase/errors";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { id } = await params;
    const order = await getOrderById(id);

    if (order.user_id !== user.id) {
      return NextResponse.json({ error: "无权查看此订单" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    const appError = handleSupabaseError(error);
    return NextResponse.json({ error: appError.message }, { status: appError.status });
  }
}
