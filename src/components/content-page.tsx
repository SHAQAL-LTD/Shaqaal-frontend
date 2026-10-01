import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "@/components/app-shell";
import { Footer } from "@/components/footer";

/* ────────────────────────────────────────────────────────────────────────
   Shared chrome for public pages. Three layouts by content type:
   · LegalPage  — clause cards + sticky anchor TOC (Terms, Privacy, Sanctions)
   · FeaturePage — hero + visual placeholder + feature card grid (product pages)
   · SpecPage   — explanatory prose mixed with structured spec tables
                 (compliance/security pages)
   All three render the same header and THE shared Footer.
   ──────────────────────────────────────────────────────────────────────── */

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ContentHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-8">
        <Brand />
        <Link
          href="/login"
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to Login
        </Link>
      </div>
    </header>
  );
}

function TitleBlock({
  eyebrow,
  title,
  intro,
  updated,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  updated?: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gold">{eyebrow}</p>
      <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{intro}</p>
      {updated ? <p className="tnum mt-3 text-xs text-muted-foreground">{updated}</p> : null}
    </div>
  );
}

export interface ContentSection {
  title: string;
  body: ReactNode;
}

export interface SpecRow {
  term: string;
  detail: ReactNode;
}

export interface SpecBlock {
  title: string;
  body?: ReactNode;
  specs?: SpecRow[];
}

/* ── Legal ─────────────────────────────────────────────────────────────── */

/**
 * Long-form legal text: numbered clause cards with an anchor-link table of
 * contents — sticky sidebar on desktop, collapsible "On this page" on mobile.
 */
export function LegalPage({
  eyebrow,
  title,
  intro,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  updated?: string;
  sections: ContentSection[];
}) {
  const toc = (
    <ol className="space-y-2.5 text-sm">
      {sections.map((s) => (
        <li key={s.title}>
          <a
            href={`#${slugify(s.title)}`}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {s.title}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="min-h-screen">
      <ContentHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <TitleBlock eyebrow={eyebrow} title={title} intro={intro} updated={updated} />

        {/* Mobile: top anchor TOC */}
        <details className="mt-8 rounded-2xl border border-border bg-secondary/40 p-4 lg:hidden">
          <summary className="cursor-pointer text-sm font-medium text-foreground">
            On this page
          </summary>
          <div className="mt-3 border-l border-border pl-4">{toc}</div>
        </details>

        <div className="mt-10 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* Desktop: sticky sidebar TOC */}
          <nav aria-label="On this page" className="hidden lg:block">
            <div className="sticky top-20">
              <p className="text-xs font-semibold uppercase tracking-widest text-gold">
                On this page
              </p>
              <div className="mt-4 border-l border-border pl-4">{toc}</div>
            </div>
          </nav>

          <div className="min-w-0 space-y-6">
            {sections.map((s) => (
              <section
                key={s.title}
                id={slugify(s.title)}
                className="glass scroll-mt-24 rounded-2xl p-6 shadow-2xl shadow-black/40"
              >
                <h2 className="mb-3 text-[15px] font-semibold text-foreground">{s.title}</h2>
                <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* ── Feature / product ─────────────────────────────────────────────────── */

/** Browser-frame visual placeholder for product pages. */
export function VisualFrame({
  caption,
  icon: Icon,
  children,
}: {
  caption: string;
  icon: React.ElementType;
  children?: ReactNode;
}) {
  return (
    <div className="mt-10 max-w-3xl overflow-hidden rounded-2xl border border-border bg-sidebar/60 shadow-2xl shadow-black/40">
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-gold/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/40" />
        <span className="ml-3 truncate text-[11px] text-muted-foreground">{caption}</span>
      </div>
      <div className="grid place-items-center gap-4 px-6 py-10 text-center">
        <Icon size={32} strokeWidth={1.5} className="text-gold/70" />
        {children ?? <p className="text-xs text-muted-foreground">{caption}</p>}
      </div>
    </div>
  );
}

/**
 * Product/feature page: marketing hero (headline + value prop + visual) over
 * an unnumbered two-column feature-card grid — deliberately NOT a legal
 * clause layout.
 */
export function FeaturePage({
  eyebrow,
  title,
  lead,
  visual,
  sections,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  visual?: ReactNode;
  sections: ContentSection[];
}) {
  return (
    <div className="min-h-screen">
      <ContentHeader />
      <main>
        <section className="border-b border-border bg-sidebar/30">
          <div className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-20">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold">{eyebrow}</p>
            <h1 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {lead}
            </p>
            {visual}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="button-gold inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-medium"
              >
                Get started
              </Link>
              <Link
                href="/company/contact"
                className="inline-flex items-center rounded-xl border border-border bg-secondary/60 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-gold/50 hover:text-gold-bright"
              >
                Talk to the desk
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-2 md:px-8">
          {sections.map((s) => (
            <div key={s.title} className="glass rounded-2xl p-6 shadow-2xl shadow-black/40">
              <h2 className="mb-3 text-lg font-semibold text-foreground">{s.title}</h2>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </div>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}

/* ── Compliance / technical spec ───────────────────────────────────────── */

/**
 * Compliance/security page: short explanatory prose mixed with structured
 * spec tables (term → detail rows) — technical and scannable, distinct from
 * both the legal clause format and the marketing feature layout.
 */
export function SpecPage({
  eyebrow,
  title,
  intro,
  updated,
  blocks,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  updated?: string;
  blocks: SpecBlock[];
}) {
  return (
    <div className="min-h-screen">
      <ContentHeader />
      <main className="mx-auto max-w-5xl px-4 py-12 md:px-8">
        <TitleBlock eyebrow={eyebrow} title={title} intro={intro} updated={updated} />

        <div className="mt-10 space-y-6">
          {blocks.map((b) => (
            <section
              key={b.title}
              className="glass rounded-2xl p-6 shadow-2xl shadow-black/40"
            >
              <h2 className="text-[15px] font-semibold text-foreground">{b.title}</h2>
              {b.body ? (
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
                  {b.body}
                </div>
              ) : null}
              {b.specs ? (
                <dl className="mt-4 divide-y divide-border/60 overflow-hidden rounded-xl border border-border">
                  {b.specs.map((row) => (
                    <div
                      key={row.term}
                      className="grid gap-1 px-4 py-3 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6"
                    >
                      <dt className="text-xs font-semibold uppercase tracking-wider text-gold">
                        {row.term}
                      </dt>
                      <dd className="text-sm text-muted-foreground">{row.detail}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
