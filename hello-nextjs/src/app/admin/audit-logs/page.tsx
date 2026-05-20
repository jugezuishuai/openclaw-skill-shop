import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ScrollText } from "lucide-react";

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
      <h1 className="text-2xl font-bold text-gray-900 mb-2">审计日志</h1>
      <p className="text-sm text-gray-500 mb-8">平台操作记录</p>
      <div className="rounded-xl border border-gray-200/80 bg-white overflow-x-auto shadow-md">
        <table className="w-full text-sm">
          <thead className="border-b-2 border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100/50 text-left text-gray-600">
            <tr>
              <th className="px-5 py-3.5 font-medium">操作</th>
              <th className="px-5 py-3.5 font-medium">目标类型</th>
              <th className="px-5 py-3.5 font-medium">目标ID</th>
              <th className="px-5 py-3.5 font-medium">时间</th>
            </tr>
          </thead>
          <tbody>
            {logs?.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center">
                  <ScrollText className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2 text-gray-400">暂无审计日志</p>
                </td>
              </tr>
            ) : (
              logs?.map((log: Record<string, unknown>) => (
                <tr key={log.id as string} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors duration-150">
                  <td className="px-5 py-3.5">
                    <span className="rounded-md bg-gray-100 px-2 py-1 font-mono text-xs font-medium text-gray-700">
                      {log.action as string}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{log.target_type as string}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-400">
                    {(log.target_id as string)?.slice(0, 12) || "-"}
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">
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
