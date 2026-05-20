import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Package, ShoppingBag, PlusCircle, Library, Shield } from "lucide-react";
import MobileMenu from "./MobileMenu";
import UserMenu from "./UserMenu";

export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  let displayName: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
    displayName = profile?.display_name || user.email?.split("@")[0] || null;
  }

  const navLinks = [
    { href: "/skills", label: "商店", icon: ShoppingBag },
    { href: "/library", label: "我的技能库", icon: Library },
    { href: "/publish", label: "发布技能", icon: PlusCircle },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75 transition-shadow duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-gray-900 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-md ring-1 ring-blue-400/20">
            <Package className="h-4 w-4" />
          </div>
          <span className="text-lg tracking-tight">Skill Shop</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              <Shield className="h-4 w-4" />
              管理后台
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <UserMenu email={user.email} displayName={displayName} isAdmin={isAdmin} />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-md active:scale-[0.97] transition-all duration-200"
              >
                注册
              </Link>
            </div>
          )}
        </div>

        <MobileMenu user={user} isAdmin={isAdmin} />
      </div>
    </header>
  );
}
