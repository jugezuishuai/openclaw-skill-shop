import { createClient } from "@/lib/supabase/server";

export type SkillStatus = "draft" | "pending_review" | "published" | "rejected" | "suspended" | "archived";
export type PricingType = "free" | "paid";
export type SkillVersionStatus = "draft" | "active" | "deprecated" | "blocked";

export interface Skill {
  id: string;
  author_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  icon_url: string | null;
  status: SkillStatus;
  pricing_type: PricingType;
  price_cents: number;
  currency: string;
  tags: string[];
  rating_avg: number;
  rating_count: number;
  install_count: number;
  purchase_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface SkillCreateInput {
  name: string;
  slug: string;
  category_id?: string;
  short_description?: string;
  description?: string;
  pricing_type?: PricingType;
  price_cents?: number;
  tags?: string[];
  icon_url?: string;
}

export interface SkillUpdateInput {
  name?: string;
  category_id?: string | null;
  short_description?: string | null;
  description?: string | null;
  pricing_type?: PricingType;
  price_cents?: number;
  tags?: string[];
  icon_url?: string | null;
  status?: SkillStatus;
}

export interface SkillListParams {
  category?: string;
  keyword?: string;
  pricing_type?: PricingType;
  status?: SkillStatus;
  sort?: "latest" | "popular" | "rating";
  page?: number;
  limit?: number;
}

export interface SkillVersion {
  id: string;
  skill_id: string;
  version: string;
  manifest: Record<string, unknown>;
  changelog: string | null;
  package_path: string | null;
  checksum: string | null;
  package_size: number | null;
  status: SkillVersionStatus;
  created_at: string;
}

export interface SkillVersionCreateInput {
  version: string;
  manifest: Record<string, unknown>;
  changelog?: string;
  package_path?: string;
  checksum?: string;
  package_size?: number;
}

export async function createSkill(authorId: string, input: SkillCreateInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("skills")
    .insert({
      author_id: authorId,
      name: input.name,
      slug: input.slug,
      category_id: input.category_id,
      short_description: input.short_description,
      description: input.description,
      pricing_type: input.pricing_type || "free",
      price_cents: input.price_cents || 0,
      tags: input.tags || [],
      icon_url: input.icon_url,
      status: "draft",
    })
    .select()
    .single();

  if (error) throw error;
  return data as Skill;
}

export async function updateSkill(skillId: string, input: SkillUpdateInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("skills")
    .update(input)
    .eq("id", skillId)
    .select()
    .single();

  if (error) throw error;
  return data as Skill;
}

export async function getSkillBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("skills")
    .select("*, profiles:author_id(display_name, avatar_url), categories:category_id(name, slug)")
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return data;
}

export async function listSkills(params: SkillListParams = {}) {
  const supabase = await createClient();
  const { category, keyword, pricing_type, sort = "latest", page = 1, limit = 12 } = params;

  let query = supabase
    .from("skills")
    .select("*, profiles:author_id(display_name, avatar_url)", { count: "exact" })
    .eq("status", params.status || "published");

  if (category) {
    query = query.eq("categories.slug", category);
  }

  if (keyword) {
    query = query.or(
      `name.ilike.%${keyword}%,short_description.ilike.%${keyword}%`
    );
  }

  if (pricing_type) {
    query = query.eq("pricing_type", pricing_type);
  }

  switch (sort) {
    case "popular":
      query = query.order("install_count", { ascending: false });
      break;
    case "rating":
      query = query.order("rating_avg", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;
  return { data: data as Skill[], total: count || 0 };
}

export async function getUserSkills(authorId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("author_id", authorId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Skill[];
}

export async function publishSkillVersion(
  skillId: string,
  input: SkillVersionCreateInput
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("skill_versions")
    .insert({
      skill_id: skillId,
      version: input.version,
      manifest: input.manifest,
      changelog: input.changelog,
      package_path: input.package_path,
      checksum: input.checksum,
      package_size: input.package_size,
      status: "active",
    })
    .select()
    .single();

  if (error) throw error;

  await supabase
    .from("skills")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", skillId);

  return data as SkillVersion;
}

export async function getSkillVersions(skillId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("skill_versions")
    .select("*")
    .eq("skill_id", skillId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as SkillVersion[];
}

export async function favoriteSkill(userId: string, skillId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: userId, skill_id: skillId });

  if (error) throw error;
}

export async function unfavoriteSkill(userId: string, skillId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("skill_id", skillId);

  if (error) throw error;
}

export async function recordInstall(
  userId: string,
  skillId: string,
  versionId?: string,
  clientVersion?: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("installs")
    .insert({
      user_id: userId,
      skill_id: skillId,
      version_id: versionId,
      client_version: clientVersion,
    });

  if (error) throw error;
}
