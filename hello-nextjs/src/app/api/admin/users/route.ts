import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
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
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "无权访问" }, { status: 403 });
    }

    // Get all profiles with auth user emails via admin API
    const serviceClient = createServiceClient();
    const { data: authUsers } = await serviceClient.auth.admin.listUsers();

    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    // Merge auth emails into profiles
    const users = profiles?.map((p) => {
      const authUser = authUsers?.users?.find((u) => u.id === p.id);
      return {
        ...p,
        email: authUser?.email ?? null,
      };
    });

    return NextResponse.json(users ?? []);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "获取用户列表失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "无权访问" }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, display_name, role } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "邮箱和密码不能为空" }, { status: 400 });
    }

    const serviceClient = createServiceClient();
    const { data: newUser, error: createError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: display_name || email.split("@")[0] },
    });

    if (createError || !newUser.user) {
      return NextResponse.json(
        { error: createError?.message || "创建用户失败" },
        { status: 400 }
      );
    }

    // Update profile role
    const { error: updateError } = await serviceClient
      .from("profiles")
      .update({ role: role || "user", display_name: display_name || email.split("@")[0] })
      .eq("id", newUser.user.id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: newUser.user.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "创建用户失败" },
      { status: 500 }
    );
  }
}
