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

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <aside className="bg-card border-b md:w-64 md:shrink-0 md:border-r md:border-b-0">
        <div className="flex h-full flex-col gap-4 p-4 md:sticky md:top-0 md:h-dvh">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-letka.png" alt="" width={617} height={526} className="h-9 w-auto" priority />
            <span className="leading-tight">
              <span className="block font-serif text-base font-bold">Posledný zostrel</span>
              <span className="text-muted-foreground block text-[10px] tracking-[0.2em] uppercase">Media hub</span>
            </span>
          </Link>

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
            <p className="text-muted-foreground hidden text-[11px] leading-snug md:block">
              Vždy používajte tento odkaz – presmeruje s UTM, takže vidíme, odkiaľ prišiel nákup.
            </p>
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3">
            <span className="text-muted-foreground truncate text-xs">{emailToUsername(auth.user?.email)}</span>
            <form action={signOut}>
              <Button variant="ghost" size="icon-sm" title="Odhlásiť sa">
                <LogOut />
              </Button>
            </form>
          </div>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto w-full max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
