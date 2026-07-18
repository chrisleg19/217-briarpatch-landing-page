"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Mail, ClipboardList, CalendarCheck, MessageSquare } from "lucide-react";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/inbox", label: "Email Review", icon: Mail },
  { href: "/leads", label: "Form Responses", icon: ClipboardList },
  { href: "/calendar", label: "Showings", icon: CalendarCheck },
  { href: "/messages", label: "Text Prospects", icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-full shrink-0 flex-col gap-1 border-b border-line bg-forest px-4 py-5 text-cream md:h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="mb-6 px-2">
        <p className="eyebrow text-brass-light">Legette Legacy Group</p>
        <h1 className="mt-1 text-2xl leading-tight text-cream">Marketing Ops</h1>
        <p className="mt-1 text-xs text-cream/60">217 Briarpatch Ct</p>
      </div>
      <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-brass text-white"
                  : "text-cream/80 hover:bg-forest-deep hover:text-cream"
              }`}
            >
              <Icon size={18} />
              <span className="whitespace-nowrap">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
