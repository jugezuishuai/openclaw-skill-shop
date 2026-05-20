import { createClient, createServiceClient } from "@/lib/supabase/server";

export type OrderStatus = "pending" | "paid" | "cancelled" | "refunded" | "failed";

export interface Order {
  id: string;
  user_id: string;
  skill_id: string;
  amount_cents: number;
  currency: string;
  status: OrderStatus;
  payment_provider: string | null;
  payment_ref: string | null;
  created_at: string;
  paid_at: string | null;
}

export interface Purchase {
  id: string;
  user_id: string;
  skill_id: string;
  order_id: string | null;
  created_at: string;
}

export async function createOrder(
  userId: string,
  skillId: string,
  amountCents: number,
  currency = "USD"
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      skill_id: skillId,
      amount_cents: amountCents,
      currency,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}

export async function markOrderPaid(
  orderId: string,
  paymentRef?: string
) {
  const supabase = createServiceClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) throw orderError;
  if (!order) throw new Error("Order not found");

  // Upsert purchase to handle re-purchase of same skill gracefully
  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .upsert(
      { user_id: order.user_id, skill_id: order.skill_id, order_id: orderId },
      { onConflict: "user_id, skill_id" }
    )
    .select()
    .maybeSingle();

  if (purchaseError) throw purchaseError;

  const { data: updatedOrder, error: updateError } = await supabase
    .from("orders")
    .update({
      status: "paid",
      payment_ref: paymentRef,
      paid_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .select()
    .maybeSingle();

  if (updateError) throw updateError;

  return { order: updatedOrder as Order, purchase: purchase as Purchase };
}

export async function getUserPurchases(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchases")
    .select("*, skills:skill_id(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function canAccessSkill(
  userId: string,
  skillId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data: skill } = await supabase
    .from("skills")
    .select("pricing_type, author_id")
    .eq("id", skillId)
    .single();

  if (!skill) return false;

  if (skill.pricing_type === "free" || skill.author_id === userId) {
    return true;
  }

  const { data: purchase } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("skill_id", skillId)
    .maybeSingle();

  return !!purchase;
}

export interface OrderListParams {
  status?: string;
  page?: number;
  limit?: number;
}

export async function getUserOrders(userId: string, params: OrderListParams = {}) {
  const supabase = await createClient();
  const { status, page = 1, limit = 10 } = params;

  let query = supabase
    .from("orders")
    .select("*, skills:skill_id(name, slug)", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;
  return { data, total: count || 0, page, limit };
}

export async function getOrderById(orderId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, skills:skill_id(name, slug, icon_url)")
    .eq("id", orderId)
    .single();

  if (error) throw error;
  return data;
}
