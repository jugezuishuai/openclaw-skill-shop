"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";

interface OrderItem {
  id: string;
  skill_id: string;
  amount_cents: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  skills?: { name?: string; slug?: string };
}

const statusOptions = [
  { value: "", label: "全部" },
  { value: "paid", label: "已支付" },
  { value: "pending", label: "待支付" },
  { value: "cancelled", label: "已取消" },
  { value: "refunded", label: "已退款" },
  { value: "failed", label: "失败" },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-l-yellow-400",
  paid: "bg-emerald-100 text-emerald-700 border-l-emerald-400",
  cancelled: "bg-gray-100 text-gray-500 border-l-gray-400",
  refunded: "bg-blue-100 text-blue-700 border-l-blue-400",
  failed: "bg-red-100 text-red-600 border-l-red-400",
};

const statusLabels: Record<string, string> = {
  pending: "待支付",
  paid: "已支付",
  cancelled: "已取消",
  refunded: "已退款",
  failed: "失败",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const initRef = useRef(false);

  async function fetchOrders(p?: number, s?: string) {
    const currentPage = p ?? page;
    const currentStatus = s ?? status;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(limit));
      if (currentStatus) params.set("status", currentStatus);

      const res = await fetch("/api/orders?" + params.toString());
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "加载失败");
        return;
      }
      setOrders(data.data || []);
      setTotal(data.total || 0);
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      fetchOrders();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleStatusChange(s: string) {
    setStatus(s);
    setPage(1);
    fetchOrders(1, s);
  }

  function handlePageChange(p: number) {
    setPage(p);
    fetchOrders(p, status);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">我的订单</h1>
      <p className="text-sm text-gray-500 mb-6">查看和管理你的订单</p>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleStatusChange(opt.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 active:scale-[0.96] ${
              status === opt.value
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-200/80 bg-white p-16 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-blue-600" />
          <p className="mt-3 text-sm text-gray-500">加载中...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-gray-200/80 bg-white p-16 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => fetchOrders()}
            className="mt-4 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            重试
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-300/80 bg-white p-16 text-center animate-[fadeIn_0.4s_ease]">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-3 text-lg font-medium text-gray-900">暂无订单</p>
          <p className="mt-1 text-sm text-gray-500">去商店选购你喜欢的技能吧</p>
          <Link href="/skills" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            浏览技能商店 <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => {
              const skill = order.skills;
              const isPending = order.status === "pending";
              return (
                <div
                  key={order.id}
                  className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border-l-[3px]"
                  style={{
                    borderLeftColor: statusColors[order.status]?.split("border-l-")[1]?.split(" ")[0] || "#d1d5db",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-sm ${
                        isPending ? "bg-yellow-100 text-yellow-700" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {isPending ? "⏳" : "✓"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{skill?.name || "未知"}</p>
                        <p className="text-xs text-gray-400">
                          订单号：{(order.id).slice(0, 8)}... · {new Date(order.created_at).toLocaleString("zh-CN")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900 text-lg">${(order.amount_cents / 100).toFixed(2)}</p>
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status]?.split(" ").slice(0, 2).join(" ") || ""}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
                    <Link
                      href={`/orders/${order.id}`}
                      className="rounded-lg border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      查看详情
                    </Link>
                    {order.status === "paid" && skill?.slug && (
                      <Link
                        href={`/skills/${skill.slug}?review=1`}
                        className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 shadow-sm active:scale-[0.97] transition-all duration-200"
                      >
                        写评价
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`min-w-[36px] rounded-lg px-2 py-1.5 text-sm font-medium transition-all duration-200 active:scale-[0.96] ${
                    p === page
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <span className="ml-3 text-xs text-gray-400">共 {total} 条</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
