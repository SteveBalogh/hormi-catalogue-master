import { Link, createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Navigation, Phone, Smartphone, User } from "lucide-react";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/kontakt")({
  head: () => ({
    meta: [
      { title: "Kontakt – HORMI s.r.o. Komárno" },
      {
        name: "description",
        content:
          "Kontaktujte HORMI s.r.o.: Rákocziho 38, Komárno. Telefón +421 35 7701 302, e-mail hormi@hormi.sk. Otváracie hodiny a mapa predajne.",
      },
      { property: "og:title", content: "Kontakt – HORMI s.r.o. Komárno" },
      {
        property: "og:description",
        content: "Predajňa a sklad na Rákocziho 38 v Komárne. Volajte alebo napíšte pre cenovú ponuku.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(SITE.address)}&output=embed`;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
        <p className="eyebrow">Kontakt</p>
        <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Sme v Komárne</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Predajňa aj sklad na jednej adrese. Radi vám poradíme s výberom zváracej techniky, ochranných prostriedkov či
          plynov.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-lg font-semibold">Spojenie</h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
                  <span>{SITE.address}</span>
                </li>
                <li className="flex gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-accent" />
                  <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="hover:underline">
                    {SITE.phone}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Smartphone className="mt-0.5 size-4 shrink-0 text-accent" />
                  <a href={`tel:${SITE.mobile.replace(/\s/g, "")}`} className="hover:underline">
                    {SITE.mobile}
                  </a>
                </li>
                <li className="flex gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-accent" />
                  <a href={`mailto:${SITE.email}`} className="hover:underline">
                    {SITE.email}
                  </a>
                </li>
                <li className="flex gap-3">
                  <User className="mt-0.5 size-4 shrink-0 text-accent" />
                  <span>{SITE.contactPerson}</span>
                </li>
                <li className="flex gap-3">
                  <Navigation className="mt-0.5 size-4 shrink-0 text-accent" />
                  <span>{SITE.gps}</span>
                </li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild>
                  <a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>Zavolať</a>
                </Button>
                <Button asChild variant="outline">
                  <a href={`mailto:${SITE.email}?subject=${encodeURIComponent("Cenová ponuka")}`}>Napísať e-mail</a>
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
                <Clock className="size-4 text-accent" /> Otváracie hodiny
              </h2>
              <dl className="mt-4 divide-y divide-border text-sm">
                {SITE.hours.map((h) => (
                  <div key={h.day} className="flex justify-between gap-4 py-2">
                    <dt className="text-muted-foreground">{h.day}</dt>
                    <dd className="font-medium">{h.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <p className="text-sm text-muted-foreground">
              Hľadáte konkrétny produkt? Prezrite si{" "}
              <Link to="/produkty" className="text-accent hover:underline">
                katalóg
              </Link>
              .
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-secondary">
            <iframe
              title="Mapa – HORMI s.r.o. Komárno"
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[420px] w-full lg:h-full"
            />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
