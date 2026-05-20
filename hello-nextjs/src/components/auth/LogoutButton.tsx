"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logout } from "@/lib/auth/actions";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export default function LogoutButton({ className }: { className?: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();

  const handleLogout = () => {
    startTransition(async () => {
      const result = await logout();
      toast("info", (result as { message?: string })?.message || "已退出登录");
      if (result?.redirectTo) {
        router.push(result.redirectTo);
      } else {
        router.push("/login");
      }
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={pending}
      className={cn(
        "rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition-all duration-200",
        className
      )}
    >
      <LogOut className="h-4 w-4" />
      {pending ? "退出中..." : "退出登录"}
    </button>
  );
}
