import Spinner from "@/components/ui/Spinner";

export default function LoadingPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-gray-500 animate-[fadeIn_0.5s_ease]">加载中...</p>
    </div>
  );
}
