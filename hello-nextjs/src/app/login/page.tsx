import LoginForm from "@/components/auth/LoginForm";
import { Package } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "登录 - OpenClaw Skill Shop",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
              <Package className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-gray-900">Skill Shop</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-8 shadow-md ring-1 ring-gray-900/5">
          <h1 className="text-2xl font-bold text-gray-900 text-center">欢迎回来</h1>
          <p className="mt-1 mb-6 text-center text-sm text-gray-500">
            登录你的 Skill Shop 账号
          </p>

          <LoginForm callbackUrl={params.callbackUrl} />
        </div>
      </div>
    </div>
  );
}
