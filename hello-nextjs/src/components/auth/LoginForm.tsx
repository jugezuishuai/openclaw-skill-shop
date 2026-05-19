"use client";

import { useActionState } from "react";
import { login, type AuthState } from "@/lib/auth/actions";
import Link from "next/link";

const initialState: AuthState = {};

export default function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, action, pending] = useActionState(login, initialState);

  return (
    <form action={action} className="space-y-5">
      {state.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          邮箱
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="your@email.com"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          密码
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="请输入密码"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {callbackUrl && (
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? "登录中..." : "登录"}
      </button>

      <p className="text-center text-sm text-gray-500">
        还没有账号？{" "}
        <Link href="/register" className="text-blue-600 hover:underline">
          注册
        </Link>
      </p>
    </form>
  );
}
