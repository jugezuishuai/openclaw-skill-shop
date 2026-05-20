"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/Toast";
import { Shield, Users, Plus, X } from "lucide-react";
import Link from "next/link";

interface UserProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  role: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", display_name: "", role: "user" });
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const toast = useToast();
  const initRef = useRef(false);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "加载失败");
        if (res.status === 403) setError("需要管理员权限");
        return;
      }
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast("error", "邮箱和密码不能为空");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast("error", data.error || "创建失败");
      } else {
        toast("success", "用户创建成功");
        setShowCreate(false);
        setForm({ email: "", password: "", display_name: "", role: "user" });
        fetchUsers();
      }
    } catch {
      toast("error", "网络错误");
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast("error", data.error || "更新失败");
      } else {
        toast("success", newRole === "admin" ? "已设为管理员" : "已取消管理员权限");
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
        );
      }
    } catch {
      toast("error", "网络错误");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
          <p className="mt-1 text-sm text-gray-500">管理系统用户和权限</p>
          <div className="mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" />
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 shadow-md hover:shadow-lg active:scale-[0.97] transition-all duration-200"
        >
          <Plus className="h-4 w-4" /> 创建用户
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200/80 bg-white p-16 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-[3px] border-gray-200 border-t-purple-600" />
          <p className="mt-3 text-sm text-gray-500">加载中...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-gray-200/80 bg-white p-16 text-center">
          {error === "需要管理员权限" ? (
            <>
              <Shield className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-3 text-lg font-medium text-gray-900">无权访问</p>
              <p className="mt-1 text-sm text-gray-500">需要管理员权限</p>
              <Link
                href="/admin"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
              >
                返回管理后台
              </Link>
            </>
          ) : (
            <>
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchUsers}
                className="mt-4 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                重试
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200/80 bg-white overflow-x-auto shadow-md">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100/50 text-left text-gray-600 border-b-2">
              <tr>
                <th className="px-5 py-3.5 font-medium">用户</th>
                <th className="px-5 py-3.5 font-medium">邮箱</th>
                <th className="px-5 py-3.5 font-medium">角色</th>
                <th className="px-5 py-3.5 font-medium">注册时间</th>
                <th className="px-5 py-3.5 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-gray-100 hover:bg-purple-50/30 transition-colors duration-150"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-sm font-bold text-white shadow-sm ring-1 ring-purple-400/20">
                        {(u.display_name || u.email || "?")[0]}
                      </div>
                      <span className="font-medium text-gray-900">
                        {u.display_name || "未设置"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{u.email || "-"}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          u.role === "admin" ? "bg-purple-500" : "bg-gray-400"
                        }`}
                      />
                      {u.role === "admin" ? "管理员" : "用户"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400">
                    {new Date(u.created_at).toLocaleDateString("zh-CN")}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() =>
                        handleRoleChange(u.id, u.role === "admin" ? "user" : "admin")
                      }
                      disabled={updatingId === u.id}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-50 ${
                        u.role === "admin"
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                          : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                      }`}
                    >
                      {updatingId === u.id ? "…" : u.role === "admin" ? "取消管理员" : "设为管理员"}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-gray-400">
                    <Users className="mx-auto h-8 w-8 mb-2 text-gray-300" />
                    暂无用户
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create user modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-900/5 animate-[scaleIn_0.15s_ease]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">创建用户</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 hover:border-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 hover:border-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  placeholder="至少 8 位密码"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">显示名称</label>
                <input
                  type="text"
                  value={form.display_name}
                  onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 hover:border-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  placeholder="可选"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm hover:border-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                >
                  <option value="user">用户</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 shadow-md hover:shadow-lg active:scale-[0.97] transition-all duration-200"
              >
                {creating ? "创建中..." : "创建用户"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
