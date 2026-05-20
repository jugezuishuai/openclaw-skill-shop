import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (currentProfile?.role !== "admin") {
      return NextResponse.json({ error: "无权访问" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { role } = body;

    if (!role || !["user", "admin"].includes(role)) {
      return NextResponse.json({ error: "无效的角色值" }, { status: 400 });
    }

    // Prevent admin from changing their own role
    if (id === user.id) {
      return NextResponse.json({ error: "不能修改自己的角色" }, { status: 400 });
    }

    const { data: updated, error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "更新用户失败" },
      { status: 500 }
    );
  }
}
