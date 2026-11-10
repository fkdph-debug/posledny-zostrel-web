import { createClient } from "@/lib/supabase/server";
import type { Asset, AssetView } from "@/lib/types";

/** K súborom doplní podpísané adresy náhľadov (1 hodina). */
export async function withThumbs(assets: Asset[]): Promise<AssetView[]> {
  const paths = assets.map((a) => a.thumb_path).filter(Boolean) as string[];
  const map = new Map<string, string>();
  if (paths.length) {
    const supabase = await createClient();
    const { data } = await supabase.storage.from("media").createSignedUrls(paths, 60 * 60);
    data?.forEach((d) => {
      if (d.path && d.signedUrl) map.set(d.path, d.signedUrl);
    });
  }
  return assets.map((a) => ({ ...a, thumbUrl: a.thumb_path ? map.get(a.thumb_path) ?? null : null }));
}
