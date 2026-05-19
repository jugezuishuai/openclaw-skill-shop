"use client";

import { useActionState } from "react";
import { publishSkill } from "./actions";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const initialState = { error: "", success: "" };

export default function SkillBasicForm({ categories }: { categories: Category[] }) {
  const [state, action, pending] = useActionState(publishSkill, initialState);

  return (
    <form action={action} className="space-y-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {state.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{state.error}</div>
      )}
      {state.success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">{state.success}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">技能名称</label>
        <input name="name" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Slug</label>
        <input name="slug" required placeholder="my-skill-name" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">分类</label>
        <select name="category_id" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option value="">选择分类</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">短描述</label>
        <input name="short_description" maxLength={200} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">详细描述</label>
        <textarea name="description" rows={5} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">定价</label>
        <select name="pricing_type" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option value="free">免费</option>
          <option value="paid">付费</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">标签（逗号分隔）</label>
        <input name="tags" placeholder="AI, Automation" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "保存中..." : "保存草稿"}
      </button>
    </form>
  );
}
