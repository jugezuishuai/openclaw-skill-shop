"use client";

import { useActionState } from "react";

const initialState = { error: "", success: "" };

export default function PackageUploader({
  skillSlug,
}: {
  skillId: string;
  skillSlug: string;
}) {
  const [state, action, pending] = useActionState(
    async (prev: typeof initialState, formData: FormData) => {
      const version = formData.get("version") as string;
      const changelog = formData.get("changelog") as string;

      if (!version) return { error: "请填写版本号", success: "" };

      try {
        const res = await fetch(`/api/skills/${skillSlug}/versions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            version,
            changelog: changelog || undefined,
            manifest: {
              name: skillSlug,
              version,
              description: "See changelog",
              author: "author",
              entry: "index.js",
              permissions: [],
              commands: [{ name: "run", description: "Run the skill" }],
            },
          }),
        });
        const data = await res.json();
        if (!res.ok) return { error: data.error || "上传失败", success: "" };
        return { error: "", success: `版本 ${version} 发布成功！` };
      } catch {
        return { error: "网络错误", success: "" };
      }
    },
    initialState
  );

  return (
    <form action={action} className="space-y-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {state.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{state.error}</div>
      )}
      {state.success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">{state.success}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">版本号</label>
        <input
          name="version"
          placeholder="1.0.0"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">更新说明</label>
        <textarea
          name="changelog"
          rows={4}
          placeholder="此版本的新功能和修复..."
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <p className="text-sm text-gray-500">技能包上传将通过 API 接口完成</p>
        <p className="mt-1 text-xs text-gray-400">
          使用 POST /api/skills/{skillSlug}/versions 上传 zip 包
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "发布中..." : "发布版本"}
      </button>
    </form>
  );
}
