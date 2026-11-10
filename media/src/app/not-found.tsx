import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-2 p-4">
      <p className="text-lg font-medium">Stránka neexistuje</p>
      <Link href="/" className="text-muted-foreground text-sm underline-offset-4 hover:underline">
        Späť na prehľad
      </Link>
    </main>
  );
}
