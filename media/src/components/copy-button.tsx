"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

export function CopyButton({
  text,
  label = "Kopírovať",
  copiedLabel = "Skopírované",
  variant = "outline",
  size = "sm",
  className,
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
  variant?: "outline" | "ghost" | "default" | "secondary";
  size?: "sm" | "default" | "icon-sm";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      title={label}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await copyText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
    >
      {copied ? <Check className="text-brand-green" /> : <Copy />}
      {size !== "icon-sm" && (copied ? copiedLabel : label)}
    </Button>
  );
}
