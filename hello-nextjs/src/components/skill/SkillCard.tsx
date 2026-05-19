import Link from "next/link";
import Image from "next/image";
import type { Skill } from "@/lib/db/skills";

export default function SkillCard({ skill }: { skill: Skill }) {
  return (
    <Link
      href={`/skills/${skill.slug}`}
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
    >
      <div className="mb-3 flex items-center gap-3">
        {skill.icon_url ? (
          <Image src={skill.icon_url} alt="" width={40} height={40} className="rounded-lg object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 font-bold">
            {skill.name.charAt(0)}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-900">{skill.name}</h3>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>★ {skill.rating_avg.toFixed(1)}</span>
            <span>·</span>
            <span>↓ {skill.install_count}</span>
          </div>
        </div>
      </div>
      <p className="line-clamp-2 text-sm text-gray-500">
        {skill.short_description || "暂无简介"}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-bold text-gray-900">
          {skill.pricing_type === "paid"
            ? `$${(skill.price_cents || 0) / 100}`
            : "免费"}
        </span>
        {skill.tags.length > 0 && (
          <span className="text-xs rounded bg-gray-100 px-2 py-0.5 text-gray-600">
            {skill.tags[0]}
          </span>
        )}
      </div>
    </Link>
  );
}
