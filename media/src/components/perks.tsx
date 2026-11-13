"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { SALE_LABEL, SALE_URL } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Download, ExternalLink } from "lucide-react";

export const PERKS = [
  { badge: "−13 %", sub: "", title: "Zľava 13 % z ceny knihy", text: "25,90 € namiesto 29,90 €", color: "bg-brand-red" },
  { badge: "0 €", sub: "poštovné", title: "Dodanie knihy zdarma", text: "už od jedného kusu", color: "bg-brand-green" },
  { badge: "−5 %", sub: "", title: "Ďalších 5 % pri nákupe 2 a viac kusov", text: "pre rodinu, kamarátov aj kolegov", color: "bg-[#BC975B]" },
];

const IMG = "/kniha-vianoce.jpg";

/** Výhody pri predaji; kliknutie otvorí vianočný vizuál z poslednyzostrel.sk. */
export function Perks({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ul className={compact ? "flex gap-2" : "space-y-1.5"}>
        {PERKS.map((p) => (
          <li key={p.title} className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setOpen(true)}
              title="Zobraziť vianočný vizuál"
              className="bg-card hover:border-brand-gold/60 flex w-full cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-left transition-colors"
            >
              <span className={cn(p.color, "flex size-9 shrink-0 flex-col items-center justify-center rounded-full leading-none text-white")}>
                <span className="text-[11px] font-bold">{p.badge}</span>
                {p.sub && <span className="text-[7px] font-medium">{p.sub}</span>}
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate font-serif text-xs font-semibold">{p.title}</span>
                {!compact && <span className="text-muted-foreground block text-[11px]">{p.text}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[95dvh] overflow-y-auto p-3 sm:max-w-2xl sm:p-5">
          <DialogTitle className="font-serif text-lg">Ideálne ako vianočný darček</DialogTitle>
          <div className="relative overflow-hidden rounded-lg">
            <Image src={IMG} alt="Kniha Posledný zostrel na vianočnom pozadí" width={1000} height={720} className="w-full" priority />
            <span
              aria-hidden
              className="bg-brand-red absolute w-[95%] py-2.5 text-center text-[0.75rem] font-bold tracking-[0.12em] text-white uppercase shadow-md sm:text-[0.85rem]"
              style={{ left: "82%", top: "18.5%", transform: "translate(-50%,-50%) rotate(36.5deg)" }}
            >
              Vianočný darček
            </span>
            <span
              aria-hidden
              className="absolute w-[95%] bg-[#E8C97A] py-2.5 text-center text-[0.75rem] font-bold tracking-[0.12em] text-[#16483A] uppercase shadow-md sm:text-[0.85rem]"
              style={{ left: "18%", top: "73.2%", transform: "translate(-50%,-50%) rotate(47deg)" }}
            >
              Zľava 13 %
            </span>
          </div>
          <ul className="space-y-1.5">
            {PERKS.map((p) => (
              <li key={p.title} className="bg-card flex items-center gap-3 rounded-md border px-3 py-2">
                <span className={cn(p.color, "flex size-11 shrink-0 flex-col items-center justify-center rounded-full leading-none text-white")}>
                  <span className="text-[13px] font-bold">{p.badge}</span>
                  {p.sub && <span className="text-[8px] font-medium">{p.sub}</span>}
                </span>
                <span className="leading-tight">
                  <b className="block font-serif text-sm font-semibold">{p.title}</b>
                  <span className="text-muted-foreground text-xs">{p.text}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="bg-brand-green hover:bg-brand-green-dark text-white">
              <a href={IMG} download="posledny-zostrel-vianocny-darcek.jpg">
                <Download /> Stiahnuť obrázok
              </a>
            </Button>
            <CopyButton text={SALE_URL} label="Kopírovať odkaz na predaj" copiedLabel="Odkaz skopírovaný" size="default" className="bg-card" />
            <Button asChild variant="outline" className="bg-card">
              <a href={SALE_URL} target="_blank" rel="noopener">
                <ExternalLink /> {SALE_LABEL}
              </a>
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            Obrázok je bez pások – tie sú len na webe. Text k postu: „Zľava 13 % – 25,90 € namiesto 29,90 €, dodanie zdarma už od jedného kusu, ďalších −5 % pri 2 a viac kusoch.“
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
