import { LOCALES, LOCALE_LABELS, useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      role="group"
      aria-label={t("lang.label")}
      className={cn(
        "inline-flex items-center overflow-hidden rounded-md border",
        tone === "dark" ? "border-white/20" : "border-border",
        className,
      )}
    >
      {LOCALES.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            className={cn(
              "px-2 py-1 text-[0.7rem] font-semibold tracking-wide transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : tone === "dark"
                  ? "text-ink-foreground/70 hover:bg-white/10"
                  : "text-muted-foreground hover:bg-secondary",
            )}
          >
            {LOCALE_LABELS[code]}
          </button>
        );
      })}
    </div>
  );
}
