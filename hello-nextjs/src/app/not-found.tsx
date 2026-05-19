import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-gray-200">404</h1>
      <h2 className="mt-2 text-2xl font-bold text-gray-900">页面未找到</h2>
      <p className="mt-2 text-gray-500">你访问的页面不存在或已被移除</p>
      <Link
        href="/"
        className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
      >
        返回首页
      </Link>
    </div>
  );
}
