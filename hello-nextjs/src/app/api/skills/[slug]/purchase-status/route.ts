import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSkillBySlug } from "@/lib/db/skills";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ purchased: false });
    }

    const { slug } = await params;
    const skill = await getSkillBySlug(slug);

    const { data: purchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("skill_id", skill.id)
      .maybeSingle();

    return NextResponse.json({ purchased: !!purchase });
  } catch {
    return NextResponse.json({ purchased: false });
  }
}
