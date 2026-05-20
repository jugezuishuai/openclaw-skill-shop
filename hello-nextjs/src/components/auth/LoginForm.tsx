"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, type AuthState } from "@/lib/auth/actions";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import { Mail, Lock, LogIn } from "lucide-react";

const initialState: AuthState = {};

export default function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, action, pending] = useActionState(login, initialState);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const redirectTo = (state as AuthState & { redirectTo?: string }).redirectTo;
    if (redirectTo) {
      toast("success", (state as AuthState & { message?: string }).message || "登录成功");
      router.push(redirectTo);
    }
  }, [state, toast, router]);

  const fullState = state as AuthState & { redirectTo?: string };

  return (
    <form action={action} className="space-y-5">
      {fullState.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200 flex items-center gap-2 animate-[fadeInUp_0.3s_ease]">
          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500 text-xs font-bold">!</div>
          {fullState.error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
          邮箱地址
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="your@email.com"
            className="block w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:shadow-md transition-all duration-200"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
          密码
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="请输入密码"
            className="block w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:shadow-md transition-all duration-200"
          />
        </div>
      </div>

      {callbackUrl && (
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-[0.97] transition-all duration-200"
      >
        <LogIn className="h-4 w-4" />
        {pending ? "登录中..." : "登录"}
      </button>

      <p className="text-center text-sm text-gray-500">
        还没有账号？{" "}
        <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
          立即注册
        </Link>
      </p>
    </form>
  );
}
