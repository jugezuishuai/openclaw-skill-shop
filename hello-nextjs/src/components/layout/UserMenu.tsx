"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Settings, Shield, ChevronDown } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";

export default function UserMenu({
  email,
  displayName,
  isAdmin,
}: {
  email?: string;
  displayName: string | null;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-500 text-sm font-medium text-white shadow-md ring-2 ring-white">
          {(displayName || email || "U").charAt(0).toUpperCase()}
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-gray-200/80 bg-white shadow-xl ring-1 ring-gray-900/5 py-1.5 animate-[scaleIn_0.15s_ease]">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">{displayName || "用户"}</p>
              <p className="text-xs text-gray-400 truncate">{email}</p>
            </div>
            <Link
              href="/library"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-blue-50/50 transition-colors duration-150"
            >
              <User className="h-4 w-4" /> 我的技能库
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-blue-50/50 transition-colors duration-150"
            >
              <Settings className="h-4 w-4" /> 作者控制台
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors duration-150"
              >
                <Shield className="h-4 w-4" /> 管理后台
              </Link>
            )}
            <div className="border-t border-gray-100 mt-1 pt-1">
              <div className="px-4 py-1.5">
                <LogoutButton className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
