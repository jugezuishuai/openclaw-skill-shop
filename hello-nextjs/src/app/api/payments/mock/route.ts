import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { markOrderPaid } from "@/lib/db/orders";
import { handleSupabaseError } from "@/lib/supabase/errors";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const body = await request.json();
    const result = await markOrderPaid(body.order_id, "mock_" + Date.now());

    return NextResponse.json(result);
  } catch (error) {
    const appError = handleSupabaseError(error);
    return NextResponse.json({ error: appError.message }, { status: appError.status });
  }
}
