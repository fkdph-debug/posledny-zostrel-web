"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { Download, ExternalLink } from "lucide-react";

export const VYSTAVA = {
  nazov: "Posledný zostrel",
  podnazov: "Spomienka na leteckú legendu Mateja Beznáka",
  miesto: "STM – Múzeum dopravy v Bratislave, Šancová 1/B",
  termin: "2. 10. – 29. 11. 2026",
  web: "https://poslednyzostrel.sk/#vystava",
};

const FOTKY = [
  { n: "01", popis: "Otvorenie výstavy – príhovory hostí" },
  { n: "02", popis: "Príhovor kurátora Jakuba Prokeša" },
  { n: "03", popis: "Návštevníci počas otvorenia výstavy" },
  { n: "04", popis: "Druhé, doplnené vydanie knihy Posledný zostrel" },
  { n: "05", popis: "Výstavný banner a vitrína s obrazmi lietadiel" },
  { n: "06", popis: "Vitríny s pozostalosťou a obrazy lietadiel" },
  { n: "07", popis: "Letecká výstroj, kompasy a modely lietadiel" },
  { n: "08", popis: "Mapy Luftwaffe, poľná pošta a dobové fotografie" },
  { n: "09", popis: "Osobné doklady, vyznamenania a portrét Mateja Beznáka" },
];

const BANNER_WIDE = "/vystava/fb-1200x630.jpg";
const BANNER_SQUARE = "/vystava/fb-1080x1080.jpg";

const POST =
  "Výstava Posledný zostrel – spomienka na leteckú legendu Mateja Beznáka. " +
  "Originály osobných dokumentov, vyznamenania, mapy a kompasy z pozostalosti, " +
  "obrazy lietadiel Kombinovanej letky od Pavla Sluku a lietadiel 2. svetovej vojny od Jána Pálffyho. " +
  "Pod záštitou riaditeľa Vojenského historického ústavu, kurátor Jakub Prokeš. " +
  "STM – Múzeum dopravy v Bratislave, Šancová 1/B, do 29. novembra 2026. " +
  "Viac na poslednyzostrel.sk";

/** Výstava v Múzeu dopravy: fotografie z otvorenia a hotové vizuály na sociálne siete. */
export function Vystava({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Fotografie z otvorenia výstavy a vizuály na FB"
        className="bg-card hover:border-brand-gold/60 flex w-full cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-left transition-colors"
      >
        <span className="flex -space-x-2">
          {FOTKY.slice(0, 3).map((f) => (
            <Image
              key={f.n}
              src={`/vystava/${f.n}-t.jpg`}
              alt=""
              width={560}
              height={420}
              className="border-card size-9 shrink-0 rounded-full border-2 object-cover"
            />
          ))}
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate font-serif text-xs font-semibold">Výstava v Múzeu dopravy</span>
          {!compact && <span className="text-muted-foreground block text-[11px]">fotky z otvorenia · do 29. 11. 2026</span>}
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[95dvh] overflow-y-auto p-3 sm:max-w-3xl sm:p-5">
          <DialogTitle className="font-serif text-lg">
            Výstava {VYSTAVA.nazov} – {VYSTAVA.podnazov}
          </DialogTitle>

          <dl className="text-sm">
            <div className="flex gap-2">
              <dt className="text-muted-foreground w-14 shrink-0">Kde</dt>
              <dd className="font-medium">{VYSTAVA.miesto}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted-foreground w-14 shrink-0">Kedy</dt>
              <dd className="font-medium">{VYSTAVA.termin}</dd>
            </div>
          </dl>

          <div>
            <p className="text-muted-foreground mb-1.5 text-[11px] font-semibold tracking-wide uppercase">
              Fotografie z otvorenia · klik stiahne plnú veľkosť
            </p>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {FOTKY.map((f) => (
                <li key={f.n}>
                  <a
                    href={`/vystava/${f.n}.jpg`}
                    download={`posledny-zostrel-vystava-${f.n}.jpg`}
                    title={f.popis}
                    className="hover:border-brand-gold/60 block overflow-hidden rounded-md border transition-colors"
                  >
                    <Image
                      src={`/vystava/${f.n}-t.jpg`}
                      alt={f.popis}
                      width={560}
                      height={420}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-muted-foreground mb-1.5 text-[11px] font-semibold tracking-wide uppercase">
              Hotové vizuály na sociálne siete
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <a
                href={BANNER_WIDE}
                download="posledny-zostrel-vystava-fb-1200x630.jpg"
                className="hover:border-brand-gold/60 block overflow-hidden rounded-md border transition-colors"
              >
                <Image src={BANNER_WIDE} alt="Banner k výstave 1200 × 630" width={1200} height={630} className="w-full" />
              </a>
              <a
                href={BANNER_SQUARE}
                download="posledny-zostrel-vystava-fb-1080x1080.jpg"
                className="hover:border-brand-gold/60 block overflow-hidden rounded-md border transition-colors"
              >
                <Image src={BANNER_SQUARE} alt="Banner k výstave 1080 × 1080" width={1080} height={1080} className="w-full" />
              </a>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild className="bg-brand-green hover:bg-brand-green-dark text-white">
              <a href={BANNER_WIDE} download="posledny-zostrel-vystava-fb-1200x630.jpg">
                <Download /> Stiahnuť banner 1200 × 630
              </a>
            </Button>
            <CopyButton text={POST} label="Kopírovať text k postu" copiedLabel="Text skopírovaný" size="default" className="bg-card" />
            <Button asChild variant="outline" className="bg-card">
              <a href={VYSTAVA.web} target="_blank" rel="noopener">
                <ExternalLink /> Výstava na webe
              </a>
            </Button>
          </div>

          <p className="text-muted-foreground text-xs">
            Fotografie sú z otvorenia výstavy a sú voľné na redakčné použitie v súvislosti s knihou a výstavou.
            Výstava potrvá do 29. novembra 2026.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
