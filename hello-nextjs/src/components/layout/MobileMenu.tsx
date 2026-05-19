"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { LucideIcon } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export default function MobileMenu({
  user,
  navLinks,
}: {
  user: User | null;
  navLinks: NavLink[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-16 border-b border-gray-200 bg-white shadow-lg">
          <nav className="flex flex-col p-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 pt-3">
              {user ? (
                <LogoutButton />
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white"
                >
                  登录
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
