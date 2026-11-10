import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { ExternalLink, LogOut, ShoppingCart } from "lucide-react";
import { Nav } from "./nav";
import { emailToUsername } from "@/lib/username";
import { SALE_LABEL, SALE_URL } from "@/lib/types";

function LogoutButton() {
  return (
    <form action={signOut}>
      <Button variant="ghost" size="icon-sm" title="Odhlásiť sa" className="size-10 md:size-8">
        <LogOut />
      </Button>
    </form>
  );
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const who = emailToUsername(auth.user?.email);

  const brand = (
    <Link href="/" className="flex min-w-0 items-center gap-2.5 md:gap-3">
      <Image src="/logo-letka.png" alt="" width={617} height={526} className="h-8 w-auto md:h-9" priority />
      <span className="min-w-0 leading-tight">
        <span className="block truncate font-serif text-base font-bold">Posledný zostrel</span>
        <span className="text-muted-foreground block text-[10px] tracking-[0.2em] uppercase">Media hub</span>
      </span>
    </Link>
  );

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      {/* ---------- mobil: lepkavá hlavička ---------- */}
      <header className="bg-card/95 sticky top-0 z-40 border-b backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-2 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-1">
          {brand}
          <div className="flex shrink-0 items-center">
            <span className="text-muted-foreground mr-1 text-xs">{who}</span>
            <LogoutButton />
          </div>
        </div>
        <div className="px-3 pb-2">
          <Nav />
        </div>
        <div className="border-brand-green/20 bg-brand-green/5 flex items-center gap-2 border-t px-3 py-1.5">
          <ShoppingCart className="text-brand-green-dark size-4 shrink-0" />
          <a href={SALE_URL} target="_blank" rel="noopener" className="min-w-0 flex-1 truncate text-sm font-medium">
            {SALE_LABEL}
          </a>
          <CopyButton text={SALE_URL} label="Kopírovať" copiedLabel="Skopírované" className="bg-card h-8 shrink-0" />
        </div>
      </header>

      {/* ---------- desktop: bočný panel ---------- */}
      <aside className="bg-card hidden border-r md:block md:w-64 md:shrink-0">
        <div className="sticky top-0 flex h-dvh flex-col gap-4 p-4">
          {brand}
          <Nav />

          <div className="border-brand-green/30 bg-brand-green/5 space-y-2 rounded-lg border p-3">
            <p className="text-brand-green-dark flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase">
              <ShoppingCart className="size-3.5" /> Predaj knihy
            </p>
            <a
              href={SALE_URL}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-1 text-sm font-medium break-all underline-offset-4 hover:underline"
            >
              {SALE_LABEL} <ExternalLink className="size-3 shrink-0" />
            </a>
            <CopyButton text={SALE_URL} label="Kopírovať odkaz" copiedLabel="Odkaz skopírovaný" className="bg-card w-full" />
            <p className="text-muted-foreground text-[11px] leading-snug">
              Vždy používajte tento odkaz – presmeruje s UTM, takže vidíme, odkiaľ prišiel nákup.
            </p>
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3">
            <span className="text-muted-foreground truncate text-xs">{who}</span>
            <LogoutButton />
          </div>
        </div>
      </aside>

      <main className="flex-1 px-3 pt-4 pb-[max(2rem,env(safe-area-inset-bottom))] md:p-8">
        <div className="mx-auto w-full max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
