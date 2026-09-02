import irrigation from "@/assets/category-irrigation.jpg";
import lpg from "@/assets/category-lpg.jpg";
import ppe from "@/assets/category-ppe.jpg";
import gases from "@/assets/category-technical-gases.jpg";
import textile from "@/assets/category-textile.jpg";
import welding from "@/assets/category-welding.jpg";

import { imageSrc } from "./catalog-types";

/** Curated fallback visuals mapped by stable category slug. */
const CATEGORY_IMAGES: Record<string, string> = {
  "zvaracia-technika": welding,
  "osobne-ochranne-pracovne-prostriedky": ppe,
  "reklamny-textil": textile,
  "zavlahove-systemy": irrigation,
  "propan-butan": lpg,
  "technicke-plyny": gases,
};

/** Stored image wins; otherwise use the curated visual for this category. */
export function categoryImage(slug: string | null | undefined, storedUrl?: string | null): string | null {
  return imageSrc(storedUrl) ?? (slug ? CATEGORY_IMAGES[slug] ?? null : null);
}
