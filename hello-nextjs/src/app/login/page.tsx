import LoginForm from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "登录 - OpenClaw Skill Shop",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
          登录
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          登录到你的 OpenClaw Skill Shop 账号
        </p>

        {params.message && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-600 border border-green-200">
            {params.message}
          </div>
        )}

        <LoginForm callbackUrl={params.callbackUrl} />
      </div>
    </div>
  );
}
