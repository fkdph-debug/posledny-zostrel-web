"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { copyText } from "@/components/copy-button";
import { cn } from "@/lib/utils";
import { Check, Share2 } from "lucide-react";

/**
 * Zdieľanie odkazu na časť appky (udalosť, sekcia media kitu).
 * Na mobile otvorí systémové zdieľanie (WhatsApp, Messenger…), inak skopíruje odkaz.
 */
export function ShareButton({
  path,
  title,
  text,
  iconOnly = false,
  className,
}: {
  path: string;
  title: string;
  text?: string;
  iconOnly?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url = window.location.origin + path;
    const nav = typeof navigator !== "undefined" ? navigator : null;
    if (nav?.share && /Android|iPhone|iPad/i.test(nav.userAgent)) {
      try {
        await nav.share({ title, text: text ?? title, url });
        return;
      } catch {
        /* zrušené – skopírujeme */
      }
    }
    await copyText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const icon = copied ? <Check className="text-brand-green" /> : <Share2 />;
  if (iconOnly)
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title={copied ? "Odkaz skopírovaný" : "Zdieľať odkaz"}
        aria-label="Zdieľať odkaz"
        onClick={share}
        className={cn("text-muted-foreground hover:text-foreground size-9 shrink-0 md:size-8", className)}
      >
        {icon}
      </Button>
    );
  return (
    <Button type="button" variant="outline" size="sm" onClick={share} className={cn("bg-card", className)}>
      {icon} {copied ? "Odkaz skopírovaný" : "Zdieľať"}
    </Button>
  );
}
