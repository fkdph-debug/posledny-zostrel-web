// Načítanie obrázkov / videí z OneDrive (aj SharePoint / OneDrive for Business)
// cez zdieľací odkaz typu „Ktokoľvek s odkazom“.

const ALLOWED = [
  /(^|\.)1drv\.ms$/i,
  /(^|\.)onedrive\.live\.com$/i,
  /(^|\.)onedrive\.com$/i,
  /(^|\.)sharepoint\.com$/i,
  /(^|\.)1drv\.com$/i,
  /(^|\.)livefilestore\.com$/i,
];

export function isOneDriveUrl(raw: string) {
  try {
    const u = new URL(raw.trim());
    return u.protocol === "https:" && ALLOWED.some((r) => r.test(u.hostname));
  } catch {
    return false;
  }
}

/** Zdieľací odkaz zakódovaný pre OneDrive „shares“ API (u!base64url). */
export function shareToken(url: string) {
  const b64 = Buffer.from(url.trim(), "utf8").toString("base64");
  return "u!" + b64.replace(/=+$/, "").replace(/\//g, "_").replace(/\+/g, "-");
}

const UA = "Mozilla/5.0 (compatible; media.poslednyzostrel.sk)";

async function tryFetch(url: string, init?: RequestInit) {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": UA },
      cache: "no-store",
      ...init,
    });
    return res.ok ? res : null;
  } catch {
    return null;
  }
}

const isMedia = (res: Response | null) => {
  const t = res?.headers.get("content-type") ?? "";
  return t.startsWith("image/") || t.startsWith("video/");
};

export type DriveMeta = { name: string | null; size: number | null; mime: string | null };

/** Metadáta súboru (názov, veľkosť, typ), ak ich OneDrive vydá anonymne. */
export async function getMeta(url: string): Promise<DriveMeta | null> {
  const token = shareToken(url);
  for (const api of [
    `https://api.onedrive.com/v1.0/shares/${token}/driveItem`,
    `https://api.onedrive.com/v1.0/shares/${token}/root`,
  ]) {
    const res = await tryFetch(api, { headers: { Accept: "application/json", "User-Agent": UA } });
    if (!res) continue;
    try {
      const j = await res.json();
      return { name: j.name ?? null, size: j.size ?? null, mime: j.file?.mimeType ?? null };
    } catch {
      /* ďalší pokus */
    }
  }
  return null;
}

/** Kandidáti na priamu adresu obsahu – skúšajú sa postupne. */
function contentCandidates(url: string) {
  const u = new URL(url.trim());
  const token = shareToken(url);
  const out: string[] = [];
  if (/sharepoint\.com$/i.test(u.hostname)) {
    const d = new URL(u);
    d.searchParams.set("download", "1");
    out.push(d.toString());
  }
  out.push(`https://api.onedrive.com/v1.0/shares/${token}/root/content`);
  out.push(`https://api.onedrive.com/v1.0/shares/${token}/driveItem/content`);
  // starší formát odkazov: onedrive.live.com/?resid=…&authkey=…  →  /download
  const resid = u.searchParams.get("resid") ?? u.searchParams.get("id");
  const authkey = u.searchParams.get("authkey");
  if (resid && authkey)
    out.push(`https://onedrive.live.com/download?resid=${encodeURIComponent(resid)}&authkey=${encodeURIComponent(authkey)}`);
  if (/1drv\.ms$/i.test(u.hostname) || /onedrive\.live\.com$/i.test(u.hostname)) {
    const d = new URL(u);
    d.searchParams.set("download", "1");
    out.push(d.toString());
  }
  out.push(url.trim()); // priamy odkaz na obrázok
  return out;
}

/** Nájde funkčnú priamu adresu obsahu (vráti odpoveď so stream-om). */
export async function fetchContent(url: string): Promise<Response | null> {
  for (const c of contentCandidates(url)) {
    const res = await tryFetch(c);
    if (isMedia(res)) return res;
    res?.body?.cancel().catch(() => {});
  }
  return null;
}

/** Malý náhľad (OneDrive thumbnails API), keď je k dispozícii. */
export async function fetchThumb(url: string): Promise<Response | null> {
  const token = shareToken(url);
  for (const size of ["large", "medium"]) {
    const res = await tryFetch(`https://api.onedrive.com/v1.0/shares/${token}/root/thumbnails/0/${size}/content`);
    if (isMedia(res)) return res;
  }
  return null;
}
