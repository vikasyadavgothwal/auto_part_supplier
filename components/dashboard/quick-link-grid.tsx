import Link from "next/link"

import type { QuickLink } from "./types"

type QuickLinkGridProps = {
  links: readonly QuickLink[]
}

export function QuickLinkGrid({ links }: QuickLinkGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {links.map((link) => {
        const Icon = link.icon

        return (
          <Link
            key={link.label}
            href={link.href}
            className={`flex items-center gap-4 p-6 rounded-sm border transition-all ${
              link.highlight
                ? "bg-[#DC2626]/10 border-[#DC2626]/20 hover:bg-[#DC2626]/20"
                : "bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#DC2626]"
            }`}
          >
            <div
              className={`p-3 rounded-sm ${
                link.highlight
                  ? "bg-[#DC2626]"
                  : "bg-[#DC2626]/10 border border-[#DC2626]/20"
              }`}
            >
              <Icon
                className={`w-6 h-6 ${
                  link.highlight ? "text-white" : "text-[#DC2626]"
                }`}
              />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{link.value}</p>
              <p className="text-sm text-[#9CA3AF]">{link.label}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
