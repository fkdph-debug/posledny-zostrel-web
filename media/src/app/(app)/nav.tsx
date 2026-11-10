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
    <nav className="flex flex-row gap-1 md:flex-col">
      {ITEMS.map(({ href, label, icon: Icon, match }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors",
            match(pathname)
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
          )}
        >
          <Icon className="size-4" /> {label}
        </Link>
      ))}
    </nav>
  );
}
