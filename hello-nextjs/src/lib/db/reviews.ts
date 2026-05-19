import { createClient } from "@/lib/supabase/server";

export interface Review {
  id: string;
  user_id: string;
  skill_id: string;
  rating: number;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewCreateInput {
  rating: number;
  content?: string;
}

export interface ReviewUpdateInput {
  rating?: number;
  content?: string;
}

export async function createReview(
  userId: string,
  skillId: string,
  input: ReviewCreateInput
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      user_id: userId,
      skill_id: skillId,
      rating: input.rating,
      content: input.content,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Review;
}

export async function updateReview(
  reviewId: string,
  userId: string,
  input: ReviewUpdateInput
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .update(input)
    .eq("id", reviewId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as Review;
}

export async function deleteReview(reviewId: string, userId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function getSkillReviews(
  skillId: string,
  page = 1,
  limit = 10
) {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("reviews")
    .select("*, profiles:user_id(display_name, avatar_url)", { count: "exact" })
    .eq("skill_id", skillId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { data, total: count || 0 };
}

export async function refreshSkillRating(skillId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("skill_id", skillId);

  if (error) throw error;

  const ratings = data || [];
  const avg = ratings.length
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  await supabase
    .from("skills")
    .update({
      rating_avg: avg,
      rating_count: ratings.length,
    })
    .eq("id", skillId);
}
