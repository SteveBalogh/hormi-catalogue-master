import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const LOCALES = ["sk", "hu", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "sk";
const STORAGE_KEY = "hormi.locale";

export const LOCALE_LABELS: Record<Locale, string> = { sk: "SK", hu: "HU", en: "EN" };
export const HTML_LANG: Record<Locale, string> = { sk: "sk", hu: "hu", en: "en" };
export const INTL_LOCALE: Record<Locale, string> = { sk: "sk-SK", hu: "hu-HU", en: "en-GB" };

type Dict = Record<string, string>;

const sk: Dict = {
  "nav.home": "Domov",
  "nav.products": "Produkty",
  "nav.categories": "Kategórie",
  "nav.about": "O nás",
  "nav.contact": "Kontakt",
  "nav.menu": "Menu",
  "nav.quote": "Cenová ponuka",
  "search.placeholder": "Hľadať produkt…",
  "search.label": "Hľadať produkt",
  "search.cataloguePlaceholder": "Hľadať podľa názvu, popisu alebo kódu…",
  "search.catalogueLabel": "Hľadať v katalógu",
  "search.submit": "Hľadať",
  "lang.label": "Jazyk",

  "footer.catalogue": "Katalóg",
  "footer.allProducts": "Všetky produkty",
  "footer.featured": "Odporúčané",
  "footer.company": "Spoločnosť",
  "footer.adminLogin": "Prihlásenie do správy",
  "footer.contact": "Kontakt",
  "footer.rights": "Všetky práva vyhradené.",

  "product.featured": "Odporúčané",
  "product.priceOnRequest": "Cena na vyžiadanie",
  "product.specifications": "Technické parametre",
  "product.documents": "Dokumenty",
  "product.related": "Súvisiace produkty",
  "product.sku": "Kód",
  "product.requestQuote": "Vyžiadať cenovú ponuku",
  "product.callUs": "Zavolať",

  "home.heroTitle": "Technika a materiál pre profesionálov v Komárne",
  "home.heroText":
    "dodáva zváracie stroje, spotrebný materiál, ochranné pracovné prostriedky, technické plyny, propán-bután, závlahové systémy a reklamný textil — s poradenstvom a zásobou na predajni.",
  "home.browseCatalogue": "Prezrieť katalóg",
  "home.contactUs": "Kontaktovať nás",
  "home.hoursNote": "(Po – Pi)",
  "home.h1.brands": "Overené značky",
  "home.h1.brandsText": "Zváracia technika a OOPP od výrobcov s certifikáciou.",
  "home.h2.advice": "Odborné poradenstvo",
  "home.h2.adviceText": "Pomôžeme vybrať správnu technológiu aj spotrebný materiál.",
  "home.h3.gas": "Plyny a rozvoz",
  "home.h3.gasText": "Technické plyny a propán-bután s výmenou fliaš na predajni.",
  "home.assortment": "Sortiment",
  "home.categoriesTitle": "Kategórie produktov",
  "home.allCategories": "Všetky kategórie",
  "home.view": "Zobraziť",
  "home.selection": "Výber",
  "home.featuredTitle": "Odporúčané produkty",
  "home.wholeCatalogue": "Celý katalóg",
  "home.ctaTitle": "Potrebujete cenovú ponuku?",
  "home.ctaText":
    "Napíšte nám alebo zavolajte — pripravíme ponuku na zváraciu techniku, plyny aj ochranné prostriedky.",
  "home.call": "Zavolať",

  "categories.title": "Kategórie produktov",
  "categories.intro":
    "Šesť hlavných oblastí, v ktorých dodávame materiál, techniku aj poradenstvo pre priemysel, remeslo aj domácnosti.",
  "categories.productsCount": "produktov",
  "categories.loadError": "Kategórie sa nepodarilo načítať.",

  "products.title": "Katalóg produktov",
  "products.intro":
    "produktov pripravených na dodanie alebo na objednávku. Filtrujte podľa kategórie alebo hľadajte podľa názvu a kódu.",
  "products.filters": "Filtre",
  "products.categories": "Kategórie",
  "products.all": "Všetky",
  "products.selection": "Výber",
  "products.onlyFeatured": "Len odporúčané",
  "products.showing": "Zobrazené",
  "products.of": "z",
  "products.sortLabel": "Zoradenie",
  "products.emptyTitle": "Žiadne produkty",
  "products.emptyText": "Skúste iné hľadané slovo alebo zrušte filtre.",
  "products.prev": "Predchádzajúca",
  "products.next": "Ďalšia",
  "products.loadError": "Katalóg sa nepodarilo načítať.",
  "common.notFound": "Nenájdené.",
  "common.breadcrumb": "Navigácia",

  "sort.recommended": "Odporúčané",
  "sort.name-asc": "Názov A – Z",
  "sort.name-desc": "Názov Z – A",
  "sort.price-asc": "Cena od najnižšej",
  "sort.price-desc": "Cena od najvyššej",
  "sort.newest": "Najnovšie",

  "avail.in-stock": "Na sklade",
  "avail.on-order": "Na objednávku",

  "about.title": "O spoločnosti HORMI",
  "contact.title": "Kontakt",
  "contact.hours": "Otváracie hodiny",
};

const hu: Dict = {
  "nav.home": "Főoldal",
  "nav.products": "Termékek",
  "nav.categories": "Kategóriák",
  "nav.about": "Rólunk",
  "nav.contact": "Kapcsolat",
  "nav.menu": "Menü",
  "nav.quote": "Árajánlat",
  "search.placeholder": "Termék keresése…",
  "search.label": "Termék keresése",
  "search.cataloguePlaceholder": "Keresés név, leírás vagy kód szerint…",
  "search.catalogueLabel": "Keresés a katalógusban",
  "search.submit": "Keresés",
  "lang.label": "Nyelv",

  "footer.catalogue": "Katalógus",
  "footer.allProducts": "Összes termék",
  "footer.featured": "Kiemelt",
  "footer.company": "Vállalat",
  "footer.adminLogin": "Belépés az adminba",
  "footer.contact": "Kapcsolat",
  "footer.rights": "Minden jog fenntartva.",

  "product.featured": "Kiemelt",
  "product.priceOnRequest": "Ár kérésre",
  "product.specifications": "Műszaki paraméterek",
  "product.documents": "Dokumentumok",
  "product.related": "Kapcsolódó termékek",
  "product.sku": "Kód",
  "product.requestQuote": "Árajánlat kérése",
  "product.callUs": "Hívás",

  "home.heroTitle": "Technika és anyag szakembereknek Komáromban",
  "home.heroText":
    "hegesztőgépeket, fogyóanyagokat, egyéni védőeszközöket, műszaki gázokat, propán-butánt, öntözőrendszereket és reklámtextilt szállít — szaktanácsadással és raktárkészlettel.",
  "home.browseCatalogue": "Katalógus megtekintése",
  "home.contactUs": "Kapcsolatfelvétel",
  "home.hoursNote": "(H – P)",
  "home.h1.brands": "Bevált márkák",
  "home.h1.brandsText": "Hegesztéstechnika és védőeszközök tanúsított gyártóktól.",
  "home.h2.advice": "Szakmai tanácsadás",
  "home.h2.adviceText": "Segítünk kiválasztani a megfelelő technológiát és fogyóanyagot.",
  "home.h3.gas": "Gázok és kiszállítás",
  "home.h3.gasText": "Műszaki gázok és propán-bután palackcserével az üzletben.",
  "home.assortment": "Kínálat",
  "home.categoriesTitle": "Termékkategóriák",
  "home.allCategories": "Összes kategória",
  "home.view": "Megtekintés",
  "home.selection": "Válogatás",
  "home.featuredTitle": "Kiemelt termékek",
  "home.wholeCatalogue": "Teljes katalógus",
  "home.ctaTitle": "Árajánlatra van szüksége?",
  "home.ctaText":
    "Írjon vagy hívjon minket — ajánlatot készítünk hegesztéstechnikára, gázokra és védőeszközökre.",
  "home.call": "Hívás",

  "categories.title": "Termékkategóriák",
  "categories.intro":
    "Hat fő terület, amelyen anyagot, technikát és tanácsadást biztosítunk az ipar, a kisipar és a háztartások számára.",
  "categories.productsCount": "termék",
  "categories.loadError": "A kategóriákat nem sikerült betölteni.",

  "products.title": "Termékkatalógus",
  "products.intro":
    "termék azonnali szállításra vagy megrendelésre. Szűrjön kategória szerint, vagy keressen név és kód alapján.",
  "products.filters": "Szűrők",
  "products.categories": "Kategóriák",
  "products.all": "Összes",
  "products.selection": "Válogatás",
  "products.onlyFeatured": "Csak kiemelt",
  "products.showing": "Megjelenítve",
  "products.of": "/",
  "products.sortLabel": "Rendezés",
  "products.emptyTitle": "Nincs találat",
  "products.emptyText": "Próbáljon más keresőszót, vagy törölje a szűrőket.",
  "products.prev": "Előző",
  "products.next": "Következő",
  "products.loadError": "A katalógust nem sikerült betölteni.",
  "common.notFound": "Nem található.",
  "common.breadcrumb": "Navigáció",

  "sort.recommended": "Kiemelt",
  "sort.name-asc": "Név A – Z",
  "sort.name-desc": "Név Z – A",
  "sort.price-asc": "Ár szerint növekvő",
  "sort.price-desc": "Ár szerint csökkenő",
  "sort.newest": "Legújabb",

  "avail.in-stock": "Raktáron",
  "avail.on-order": "Megrendelésre",

  "about.title": "A HORMI vállalatról",
  "contact.title": "Kapcsolat",
  "contact.hours": "Nyitvatartás",
};

const en: Dict = {
  "nav.home": "Home",
  "nav.products": "Products",
  "nav.categories": "Categories",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.menu": "Menu",
  "nav.quote": "Request a quote",
  "search.placeholder": "Search products…",
  "search.label": "Search products",
  "search.cataloguePlaceholder": "Search by name, description or code…",
  "search.catalogueLabel": "Search the catalogue",
  "search.submit": "Search",
  "lang.label": "Language",

  "footer.catalogue": "Catalogue",
  "footer.allProducts": "All products",
  "footer.featured": "Featured",
  "footer.company": "Company",
  "footer.adminLogin": "Admin sign in",
  "footer.contact": "Contact",
  "footer.rights": "All rights reserved.",

  "product.featured": "Featured",
  "product.priceOnRequest": "Price on request",
  "product.specifications": "Specifications",
  "product.documents": "Documents",
  "product.related": "Related products",
  "product.sku": "Code",
  "product.requestQuote": "Request a quote",
  "product.callUs": "Call us",

  "home.heroTitle": "Equipment and materials for professionals in Komárno",
  "home.heroText":
    "supplies welding machines, consumables, personal protective equipment, technical gases, propane-butane, irrigation systems and promotional textiles — with expert advice and stock on site.",
  "home.browseCatalogue": "Browse the catalogue",
  "home.contactUs": "Contact us",
  "home.hoursNote": "(Mon – Fri)",
  "home.h1.brands": "Trusted brands",
  "home.h1.brandsText": "Welding equipment and PPE from certified manufacturers.",
  "home.h2.advice": "Expert advice",
  "home.h2.adviceText": "We help you choose the right technology and consumables.",
  "home.h3.gas": "Gases and delivery",
  "home.h3.gasText": "Technical gases and propane-butane with cylinder exchange in store.",
  "home.assortment": "Range",
  "home.categoriesTitle": "Product categories",
  "home.allCategories": "All categories",
  "home.view": "View",
  "home.selection": "Selection",
  "home.featuredTitle": "Featured products",
  "home.wholeCatalogue": "Full catalogue",
  "home.ctaTitle": "Need a quote?",
  "home.ctaText": "Write or call us — we will prepare an offer for welding equipment, gases and protective gear.",
  "home.call": "Call",

  "categories.title": "Product categories",
  "categories.intro":
    "Six core areas in which we supply materials, equipment and advice for industry, trades and households.",
  "categories.productsCount": "products",
  "categories.loadError": "Categories could not be loaded.",

  "products.title": "Product catalogue",
  "products.intro":
    "products ready for delivery or to order. Filter by category or search by name and code.",
  "products.filters": "Filters",
  "products.categories": "Categories",
  "products.all": "All",
  "products.selection": "Selection",
  "products.onlyFeatured": "Featured only",
  "products.showing": "Showing",
  "products.of": "of",
  "products.sortLabel": "Sorting",
  "products.emptyTitle": "No products",
  "products.emptyText": "Try a different search term or clear the filters.",
  "products.prev": "Previous",
  "products.next": "Next",
  "products.loadError": "The catalogue could not be loaded.",
  "common.notFound": "Not found.",
  "common.breadcrumb": "Breadcrumb",

  "sort.recommended": "Recommended",
  "sort.name-asc": "Name A – Z",
  "sort.name-desc": "Name Z – A",
  "sort.price-asc": "Price low to high",
  "sort.price-desc": "Price high to low",
  "sort.newest": "Newest",

  "avail.in-stock": "In stock",
  "avail.on-order": "To order",

  "about.title": "About HORMI",
  "contact.title": "Contact",
  "contact.hours": "Opening hours",
};

const DICTS: Record<Locale, Dict> = { sk, hu, en };

/** Localized catalogue category copy keyed by stable slug; falls back to stored values. */
const CATEGORY_COPY: Record<string, Partial<Record<Locale, { name: string; description?: string }>>> = {
  "zvaracia-technika": {
    hu: { name: "Hegesztéstechnika" },
    en: { name: "Welding technology" },
  },
  "osobne-ochranne-pracovne-prostriedky": {
    hu: { name: "Egyéni védőeszközök" },
    en: { name: "Personal protective equipment" },
  },
  "reklamny-textil": {
    hu: { name: "Reklámtextil" },
    en: { name: "Promotional textiles" },
  },
  "zavlahove-systemy": {
    hu: { name: "Öntözőrendszerek" },
    en: { name: "Irrigation systems" },
  },
  "propan-butan": {
    hu: { name: "Propán-bután" },
    en: { name: "Propane-butane" },
  },
  "technicke-plyny": {
    hu: { name: "Műszaki gázok" },
    en: { name: "Technical gases" },
  },
};

const AVAILABILITY_ALIASES: Record<string, string> = {
  "na sklade": "in-stock",
  "raktáron": "in-stock",
  "in stock": "in-stock",
  "na objednávku": "on-order",
  "na objednavku": "on-order",
  "to order": "on-order",
};

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  categoryName: (slug: string | null | undefined, fallback: string) => string;
  categoryDescription: (slug: string | null | undefined, fallback: string | null) => string | null;
  availability: (value: string | null | undefined) => string | null;
  formatPrice: (price: number | null, currency?: string) => string | null;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && (LOCALES as readonly string[]).includes(stored)) setLocaleState(stored as Locale);
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[locale];
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const value = useMemo<LocaleContextValue>(() => {
    const dict = DICTS[locale];
    return {
      locale,
      setLocale,
      t: (key) => dict[key] ?? DICTS.sk[key] ?? key,
      categoryName: (slug, fallback) => (slug && CATEGORY_COPY[slug]?.[locale]?.name) || fallback,
      categoryDescription: (slug, fallback) =>
        (slug && CATEGORY_COPY[slug]?.[locale]?.description) || fallback,
      availability: (raw) => {
        if (!raw) return null;
        const key = AVAILABILITY_ALIASES[raw.trim().toLowerCase()];
        return key ? dict[`avail.${key}`] ?? raw : raw;
      },
      formatPrice: (price, currency = "EUR") =>
        price === null || price === undefined
          ? null
          : new Intl.NumberFormat(INTL_LOCALE[locale], {
              style: "currency",
              currency: currency || "EUR",
              minimumFractionDigits: 2,
            }).format(price),
    };
  }, [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
