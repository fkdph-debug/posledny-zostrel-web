import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchContent, fetchThumb, getMeta, isOneDriveUrl } from "@/lib/onedrive";

// /api/onedrive?url=<zdieľací odkaz>&mode=meta|thumb|view
//  meta  – JSON {ok, name, size, mime}
//  thumb – malý náhľad (stream, max ~4 MB)
//  view  – presmerovanie na priamu adresu originálu (prehliadač ho stiahne priamo z OneDrive)
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_STREAM = 4 * 1024 * 1024; // limit odpovede Vercel funkcie

function fileName(res: Response) {
  const cd = res.headers.get("content-disposition") ?? "";
  const star = cd.match(/filename\*=UTF-8''([^;]+)/i);
  if (star) return decodeURIComponent(star[1]);
  const plain = cd.match(/filename="?([^";]+)"?/i);
  return plain ? plain[1] : null;
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "Neprihlásený." }, { status: 401 });

  const url = req.nextUrl.searchParams.get("url") ?? "";
  const mode = req.nextUrl.searchParams.get("mode") ?? "view";
  if (!isOneDriveUrl(url))
    return NextResponse.json({ ok: false, error: "Toto nie je odkaz na OneDrive / SharePoint." }, { status: 400 });

  if (mode === "meta") {
    const meta = await getMeta(url);
    const res = await fetchContent(url);
    if (!res && !meta)
      return NextResponse.json(
        { ok: false, error: "Odkaz sa nepodarilo načítať. Je súbor zdieľaný ako „Ktokoľvek s odkazom“?" },
        { status: 404 }
      );
    const out = {
      ok: !!res,
      name: meta?.name ?? (res ? fileName(res) : null),
      size: meta?.size ?? (res ? Number(res.headers.get("content-length")) || null : null),
      mime: meta?.mime ?? res?.headers.get("content-type")?.split(";")[0] ?? null,
    };
    res?.body?.cancel().catch(() => {});
    return NextResponse.json(out);
  }

  if (mode === "thumb") {
    let res = await fetchThumb(url);
    if (!res) {
      const full = await fetchContent(url);
      const len = Number(full?.headers.get("content-length")) || 0;
      if (full && full.headers.get("content-type")?.startsWith("image/") && len > 0 && len <= MAX_STREAM) res = full;
      else full?.body?.cancel().catch(() => {});
    }
    if (!res) return new NextResponse("Náhľad nie je k dispozícii", { status: 404 });
    return new NextResponse(res.body, {
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "private, max-age=3600",
      },
    });
  }

  // view / download
  const res = await fetchContent(url);
  if (!res) return new NextResponse("Súbor sa nepodarilo načítať z OneDrive.", { status: 404 });
  res.body?.cancel().catch(() => {});
  return NextResponse.redirect(res.url, 302);
}
