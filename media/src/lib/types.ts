export type EventKind = "nazivo" | "media" | "online" | "ine";

export const KINDS: Record<EventKind, string> = {
  nazivo: "Naživo",
  media: "V médiách",
  online: "Online",
  ine: "Iné",
};

export type EventRow = {
  id: string;
  date: string;
  title: string;
  kind: EventKind;
  place: string | null;
  url: string | null;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Asset = {
  id: string;
  event_id: string | null;
  kit_category: string | null;
  name: string;
  path: string | null;
  external_url: string | null;
  thumb_path: string | null;
  size: number;
  mime: string | null;
  width: number | null;
  height: number | null;
  caption: string | null;
  uploaded_by: string | null;
  created_at: string;
};

/** Asset s podpísanou adresou náhľadu (platí 1 hodinu). */
export type AssetView = Asset & { thumbUrl: string | null };

export type Snippet = {
  id: string;
  title: string;
  body: string;
  lang: string;
  position: number;
  updated_by: string | null;
  updated_at: string;
};

export const KIT_CATEGORIES = [
  { slug: "kniha", name: "Fotky z knihy", hint: "Dvojstrany, ukážky strán, dobové fotografie z knihy" },
  { slug: "vizualy", name: "Obálka a vizuály", hint: "Obálka, mockupy, maľba súboja, bannery, thumbnaily" },
  { slug: "videa", name: "Videá", hint: "FB video 4:5, short / reel 9:16, reportáže" },
  { slug: "autor", name: "Matej Beznák a autor", hint: "Portréty, fotky autora Jakuba Prokeša" },
  { slug: "logo", name: "Logá", hint: "Znak letky, logá partnerov" },
  { slug: "tlac", name: "Tlačové správy a dokumenty", hint: "PDF, DOCX – tlačové správy, ukážky textu" },
] as const;

export const SALE_URL = "https://www.luc.sk/poslednyzostrel";
export const SALE_LABEL = "www.luc.sk/poslednyzostrel";
