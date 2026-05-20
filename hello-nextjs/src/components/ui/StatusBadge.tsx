export default function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    pending_review: "bg-yellow-100 text-yellow-700",
    published: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-600",
    suspended: "bg-red-100 text-red-600",
    archived: "bg-gray-100 text-gray-400",
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-gray-100 text-gray-500",
    refunded: "bg-blue-100 text-blue-700",
    failed: "bg-red-100 text-red-600",
  };
  const dots: Record<string, string> = {
    draft: "bg-gray-400",
    pending_review: "bg-yellow-500",
    published: "bg-emerald-500",
    rejected: "bg-red-500",
    suspended: "bg-red-500",
    archived: "bg-gray-400",
    pending: "bg-yellow-500",
    paid: "bg-emerald-500",
    cancelled: "bg-gray-400",
    refunded: "bg-blue-500",
    failed: "bg-red-500",
  };
  const labels: Record<string, string> = {
    draft: "草稿", pending_review: "待审", published: "已发布",
    rejected: "已驳回", suspended: "已下架", archived: "已归档",
    pending: "待支付", paid: "已支付", cancelled: "已取消",
    refunded: "已退款", failed: "失败",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-600"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status] || "bg-gray-400"}`} />
      {labels[status] || status}
    </span>
  );
}
