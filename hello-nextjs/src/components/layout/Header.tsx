import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Package, ShoppingBag, PlusCircle, Library } from "lucide-react";
import MobileMenu from "./MobileMenu";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const navLinks = [
    { href: "/skills", label: "商店", icon: ShoppingBag },
    { href: "/library", label: "我的技能库", icon: Library },
    { href: "/publish", label: "发布技能", icon: PlusCircle },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <Package className="h-6 w-6 text-blue-600" />
          <span>Skill Shop</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <LogoutButton />
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              登录
            </Link>
          )}
        </div>

        <MobileMenu user={user} navLinks={navLinks} />
      </div>
    </header>
  );
}
