import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 animate-[fadeIn_0.4s_ease]">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner">
        <FileQuestion className="h-8 w-8 text-gray-400" />
      </div>
      <h1 className="mt-4 text-xl font-bold text-gray-900">页面未找到</h1>
      <p className="mt-2 text-sm text-gray-500">你访问的页面不存在或已被移除</p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-[0.97] transition-all duration-200"
      >
        返回首页
      </Link>
    </div>
  );
}
