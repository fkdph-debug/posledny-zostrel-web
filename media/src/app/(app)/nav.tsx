"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CalendarDays, Images } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Udalosti", icon: CalendarDays, match: (p: string) => p === "/" || p.startsWith("/udalosti") },
  { href: "/media-kit", label: "Media kit", icon: Images, match: (p: string) => p.startsWith("/media-kit") },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="bg-secondary grid grid-cols-2 gap-1 rounded-lg p-1 md:flex md:flex-col md:bg-transparent md:p-0">
      {ITEMS.map(({ href, label, icon: Icon, match }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex h-9 items-center justify-center gap-2 rounded-md px-2.5 text-sm transition-colors md:h-auto md:justify-start md:py-1.5",
            match(pathname)
              ? "bg-card text-foreground font-medium shadow-sm md:bg-accent md:shadow-none"
              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
          )}
        >
          <Icon className="size-4" /> {label}
        </Link>
      ))}
    </nav>
  );
}
