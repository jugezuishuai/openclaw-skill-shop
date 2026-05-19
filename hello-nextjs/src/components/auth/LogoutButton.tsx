"use client";

import { useTransition } from "react";
import { logout } from "@/lib/auth/actions";

export default function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => logout())}
      disabled={pending}
      className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-colors"
    >
      {pending ? "退出中..." : "退出登录"}
    </button>
  );
}
