import RegisterForm from "@/components/auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "注册 - OpenClaw Skill Shop",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
          注册
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          创建你的 OpenClaw Skill Shop 账号
        </p>

        <RegisterForm />
      </div>
    </div>
  );
}
