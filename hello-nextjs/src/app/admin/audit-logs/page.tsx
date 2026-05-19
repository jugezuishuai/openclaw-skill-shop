import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminAuditLogsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">审计日志</h1>
      <div className="rounded-lg border border-gray-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3">操作</th>
              <th className="px-4 py-3">目标类型</th>
              <th className="px-4 py-3">目标ID</th>
              <th className="px-4 py-3">时间</th>
            </tr>
          </thead>
          <tbody>
            {logs?.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  暂无审计日志
                </td>
              </tr>
            ) : (
              logs?.map((log: Record<string, unknown>) => (
                <tr key={log.id as string} className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium">{log.action as string}</td>
                  <td className="px-4 py-3">{log.target_type as string}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">
                    {(log.target_id as string)?.slice(0, 8) || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(log.created_at as string).toLocaleString("zh-CN")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
