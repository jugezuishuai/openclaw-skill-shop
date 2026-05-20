import Link from "next/link";
import { Package } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200/80 bg-gradient-to-b from-white to-gray-50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-sm ring-1 ring-blue-400/20">
                <Package className="h-3.5 w-3.5" />
              </div>
              Skill Shop
            </Link>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              OpenClaw Skill 线上商店 — 发现、安装和分享高质量的技能包。
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">导航</h3>
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/skills" className="text-sm text-gray-500 hover:text-gray-900 hover:underline underline-offset-4 transition-colors">技能商店</Link>
              <Link href="/publish" className="text-sm text-gray-500 hover:text-gray-900 hover:underline underline-offset-4 transition-colors">发布技能</Link>
              <Link href="/library" className="text-sm text-gray-500 hover:text-gray-900 hover:underline underline-offset-4 transition-colors">我的技能库</Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">关于</h3>
            <div className="mt-3 flex flex-col gap-2">
              <span className="text-sm text-gray-400">隐私政策</span>
              <span className="text-sm text-gray-400">服务条款</span>
              <span className="text-sm text-gray-400">联系我们</span>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} OpenClaw Skill Shop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
