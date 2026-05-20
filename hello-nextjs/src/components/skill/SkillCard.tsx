import Link from "next/link";
import Image from "next/image";
import { Star, Download } from "lucide-react";
import type { Skill } from "@/lib/db/skills";

export default function SkillCard({ skill }: { skill: Skill }) {
  const isFree = skill.pricing_type === "free";
  const price = isFree ? null : `$${(skill.price_cents / 100).toFixed(2)}`;

  return (
    <Link
      href={`/skills/${skill.slug}`}
      className="group rounded-xl border border-gray-200/80 bg-white p-5 shadow-md hover:shadow-xl hover:border-blue-300/50 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="mb-4 flex items-start gap-3">
        {skill.icon_url ? (
          <Image
            src={skill.icon_url}
            alt=""
            width={48}
            height={48}
            className="rounded-xl object-cover flex-shrink-0"
          />
        ) : (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-500 text-lg font-bold text-white shadow-md ring-1 ring-blue-400/20 group-hover:shadow-lg transition-shadow">
            {skill.name.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors duration-200">
            {skill.name}
          </h3>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
            <span className="inline-flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {skill.rating_avg.toFixed(1)}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-0.5">
              <Download className="h-3 w-3" />
              {skill.install_count.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <p className="line-clamp-2 text-sm text-gray-500 leading-relaxed min-h-[2.5rem] group-hover:text-gray-600 transition-colors duration-200">
        {skill.short_description || "暂无简介"}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <span className={`text-sm font-bold tracking-tight ${isFree ? "text-emerald-600" : "text-gray-900"}`}>
          {isFree ? "免费" : price}
        </span>
        {skill.tags.length > 0 && (
          <span className="rounded-full bg-gray-100/80 px-2.5 py-0.5 text-xs font-medium text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-700 transition-all duration-300">
            {skill.tags[0]}
          </span>
        )}
      </div>
    </Link>
  );
}
