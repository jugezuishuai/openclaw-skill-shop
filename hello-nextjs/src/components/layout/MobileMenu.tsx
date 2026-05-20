"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Shield, ShoppingBag, PlusCircle, Library } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { href: "/skills", label: "商店", icon: ShoppingBag },
  { href: "/library", label: "我的技能库", icon: Library },
  { href: "/publish", label: "发布技能", icon: PlusCircle },
];

export default function MobileMenu({
  user,
  isAdmin,
}: {
  user: User | null;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-16 border-b border-gray-200/60 bg-white/95 backdrop-blur-sm shadow-xl rounded-b-2xl animate-[fadeInUp_0.2s_ease]">
          <nav className="flex flex-col p-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <Shield className="h-4 w-4" />
                管理后台
              </Link>
            )}
            <div className="border-t border-gray-100 mt-2 pt-2">
              {user ? (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg bg-gray-100 px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  退出登录
                </Link>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg border border-gray-200 px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200"
                  >
                    登录
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 shadow-md active:scale-[0.97] transition-all duration-200"
                  >
                    注册
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
