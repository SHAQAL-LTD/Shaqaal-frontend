import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Fingerprint,
  Lock,
  FileCheck2,
  Boxes,
  Scale,
  Globe2,
  Quote,
  Check,
  Users,
  Gavel,
  Landmark,
  Briefcase,
  Clock3,
  KeyRound,
  ServerCog,
} from "lucide-react";
import { Brand } from "@/components/app-shell";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui-kit";

const features = [
  {
    icon: ShieldCheck,
    title: "Compliance-gated rooms",
    body: "No deal advances until a compliance officer clears the stage. Every gate is logged against an operator identity.",
  },
  {
    icon: Boxes,
    title: "Ten linear stages",
    body: "From mandate intake to final settlement, each deal follows one auditable pipeline — no side channels, no lost paperwork.",
  },
  {
    icon: Lock,
    title: "Encrypted document vault",
    body: "SGS assays, POF, SPA drafts and BLs stored with per-party access control and tamper-evident hashing.",
  },
  {
    icon: Fingerprint,
    title: "UTID-sealed completion",
    body: "Completed transactions are sealed with a cryptographic Unique Transaction ID that anchors the full audit chain.",
  },
  {
    icon: Scale,
    title: "Commission splits",
    body: "Model multi-tier broker trees that always reconcile to exactly 100% before payout instructions are released.",
  },
  {
    icon: Globe2,
    title: "Cross-border KYC",
    body: "Country-aware onboarding for UAE, Ghana, DRC and beyond, with automatic sanctions and PEP screening.",
  },
];

const stats = [
  { value: "4,182", label: "Deals settled" },
  { value: "$3.1B", label: "Contract value processed" },
  { value: "27", label: "Jurisdictions covered" },
  { value: "100%", label: "Actions hash-chained" },
];

const stages = [
  { name: "Mandate intake", note: "Seller mandate, corporate docs, authority chain" },
  { name: "KYC & screening", note: "Sanctions, PEP and adverse-media checks" },
  { name: "LOI exchange", note: "Counter-signed intent with commercial terms" },
  { name: "Proof of product", note: "Warehouse receipt or origin certification" },
  { name: "Proof of funds", note: "Bank-verified POF or RWA confirmation" },
  { name: "Assay & inspection", note: "SGS / Alex Stewart report attached" },
  { name: "SPA execution", note: "Contract signed by all mandated parties" },
  { name: "Escrow funding", note: "Funds confirmed with escrow agent" },
  { name: "Logistics & BL", note: "Shipment booked, bill of lading issued" },
  { name: "UTID settlement", note: "Payout released, transaction sealed" },
];

const roles = [
  {
    icon: Briefcase,
    role: "Brokers & mandates",
    body: "Open a deal room, invite counterparties and prove your position without exposing your principal.",
  },
  {
    icon: Landmark,
    role: "Buyers & refineries",
    body: "See verified origin, assay and logistics evidence in one place before releasing capital.",
  },
  {
    icon: Gavel,
    role: "Compliance officers",
    body: "Approve or reject each gate with a reason on record and a permanent, exportable audit trail.",
  },
  {
    icon: Users,
    role: "Escrow & legal",
    body: "Read-only access scoped to the documents relevant to the release you are asked to authorise.",
  },
];

const trustPoints = [
  { icon: KeyRound, title: "AES-256 at rest", body: "Per-document keys, rotated per deal room." },
  { icon: ServerCog, title: "Regional residency", body: "UAE and EU data regions with no cross-copy." },
  { icon: Clock3, title: "Immutable timeline", body: "Append-only log, each entry hashed to the last." },
  { icon: FileCheck2, title: "Regulator export", body: "Full deal dossier as a signed PDF bundle." },
];

const faqs = [
  {
    q: "Who can see my documents?",
    a: "Only the parties you explicitly admit to a deal room, scoped per document. Compliance officers see evidence for the gate they are reviewing — never your commercial margin.",
  },
  {
    q: "Can a stage be skipped?",
    a: "No. The pipeline is linear by design. A stage only unlocks when the required evidence is on file and an authorised officer signs the gate.",
  },
  {
    q: "What is a UTID?",
    a: "A Unique Transaction ID generated at settlement. It hashes the full document and approval chain, so the deal can be independently verified years later.",
  },
  {
    q: "How long does onboarding take?",
    a: "Most corporate entities complete KYC in under 48 hours. Higher-risk jurisdictions require enhanced due diligence and additional review.",
  },
];

function Eyebrow({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-gold">
      <span className="h-px w-8 bg-gold/50" />
      {children}
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Brand short />
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#platform" className="transition-colors hover:text-gold">
              Platform
            </a>
            <a href="#pipeline" className="transition-colors hover:text-gold">
              Pipeline
            </a>
            <a href="#roles" className="transition-colors hover:text-gold">
              Who it&apos;s for
            </a>
            <a href="#trust" className="transition-colors hover:text-gold">
              Trust
            </a>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/login"
              className="hidden items-center rounded-xl border border-border bg-secondary/60 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-gold/50 hover:text-gold-bright sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="gold-glow inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-gold-bright to-gold px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gold/10 blur-[140px]" />
          <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:items-center">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs uppercase tracking-wider text-gold">
                <ShieldCheck className="h-3.5 w-3.5" /> ISO 27001 · FATF aligned
              </span>
              <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                Move gold, minerals and trust through one{" "}
                <span className="text-gold">audited pipeline</span>.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
                Shaqal replaces scattered WhatsApp threads and PDF chains with a single
                compliance-gated deal room — built for brokers, buyers, mandates and compliance
                officers working high-value commodity transactions.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="gold-glow inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-gold-bright to-gold px-5 py-3 text-sm font-semibold text-primary-foreground"
                >
                  Request platform access
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/60 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-gold/50 hover:text-gold-bright"
                >
                  Explore a live deal room
                </Link>
              </div>
              <dl className="tnum mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="font-display text-2xl font-semibold text-gold">{s.value}</dt>
                    <dd className="mt-1 text-xs text-muted-foreground">{s.label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-3xl border border-gold/20 shadow-2xl shadow-black/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/hero.jpg"
                  alt="Gold bullion bars and raw mineral ore under dramatic lighting"
                  width={1600}
                  height={1104}
                  className="h-full w-full object-cover"
                />
              </div>
              <Card className="absolute -bottom-6 left-4 right-4 sm:left-8 sm:right-auto sm:w-72">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Deal SQ-1042 · Stage 8
                </p>
                <p className="mt-2 text-sm text-foreground">
                  Assay verified · Escrow funded · Awaiting compliance release
                </p>
                <p className="tnum mt-3 text-xs text-gold">UTID 0x8f31…c47a</p>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-sidebar/30">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-10 gap-y-4 px-5 py-6 text-xs uppercase tracking-[0.18em] text-muted-foreground sm:px-8">
            <span className="text-gold/70">Trusted evidence standards</span>
            <span>SGS</span>
            <span>Alex Stewart</span>
            <span>DMCC</span>
            <span>LBMA chain of custody</span>
            <span>Basel III KYC</span>
          </div>
        </section>

        <section id="platform" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <Eyebrow>Platform</Eyebrow>
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Built for the parts of a trade that go wrong
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Documentation gaps, unverifiable mandates and unclear commission splits kill deals.
            Shaqal makes each of them a structured, reviewable step.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card
                key={f.title}
                className="group transition-colors duration-300 hover:border-gold/40"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-gold/30 bg-gold/10 transition-colors group-hover:bg-gold/20">
                  <f.icon className="h-4.5 w-4.5 text-gold" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </Card>
            ))}
          </div>
        </section>

        <section id="pipeline" className="border-y border-border bg-sidebar/40">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
            <Eyebrow>Pipeline</Eyebrow>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Ten stages. One direction.
            </h2>
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
              Deals only move forward when the evidence for the current stage is on file.
            </p>
            <ol className="mt-12 grid gap-x-10 gap-y-0 sm:grid-cols-2">
              {stages.map((stage, i) => (
                <li key={stage.name} className="group relative flex gap-5 pb-8">
                  <div className="flex flex-col items-center">
                    <span className="tnum grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/35 bg-background text-xs font-semibold text-gold transition-colors group-hover:border-gold group-hover:bg-gold/15">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="mt-2 w-px flex-1 bg-border" />
                  </div>
                  <div className="min-w-0 pt-1.5">
                    <p className="text-sm font-medium text-foreground">{stage.name}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {stage.note}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="roles" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <Eyebrow>Who it&apos;s for</Eyebrow>
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            One room, four vantage points
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Every participant sees exactly what their role requires — and nothing that would
            compromise the deal.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {roles.map((r) => (
              <Card key={r.role} className="flex gap-4 p-6">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-gold/25 bg-gold/10">
                  <r.icon className="h-5 w-5 text-gold" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-foreground">{r.role}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-sidebar/30">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-2 lg:items-center">
            <div className="overflow-hidden rounded-3xl border border-gold/20 shadow-2xl shadow-black/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero.jpg"
                alt="Sealed trade documents beside a gold bar on dark stone"
                width={1280}
                height={960}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <Eyebrow>The vault</Eyebrow>
              <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Paperwork that can defend itself
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Every file uploaded to a deal room is fingerprinted, versioned and bound to the
                stage it was submitted for. If a document changes, the chain shows it.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "SHA-256 fingerprint on every upload, visible to all admitted parties",
                  "Version history with the operator identity behind each change",
                  "Per-document access scoping — buyers never see broker margin",
                  "One-click regulator dossier covering the full ten-stage history",
                ].map((point) => (
                  <li key={point} className="flex gap-3 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <Card className="relative overflow-hidden p-8 sm:p-12">
            <Quote className="absolute -right-4 -top-4 h-28 w-28 text-gold/5" />
            <blockquote className="relative max-w-3xl font-display text-xl leading-relaxed text-foreground sm:text-2xl">
              &ldquo;We used to lose three weeks per transaction reconciling assay reports and
              mandate letters across five inboxes. On Shaqal the evidence is either in the room or
              the stage doesn&apos;t open.&rdquo;
            </blockquote>
            <figcaption className="relative mt-6 text-sm text-muted-foreground">
              <span className="font-medium text-gold">Head of Trade Compliance</span> · precious
              metals desk, Dubai
            </figcaption>
          </Card>
        </section>

        <section id="trust" className="border-y border-border bg-sidebar/40">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
            <Eyebrow>Trust</Eyebrow>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Every action is evidence
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Immutable, hash-chained audit logs mean any regulator, bank or counterparty can
              reconstruct the full history of a transaction in minutes — not weeks.
            </p>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {trustPoints.map((t) => (
                <Card key={t.title} className="p-6">
                  <t.icon className="h-5 w-5 text-gold" />
                  <h3 className="mt-4 text-sm font-semibold text-foreground">{t.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t.body}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div>
              <Eyebrow>Questions</Eyebrow>
              <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Before you open a room
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                The details counterparties ask about most often.
              </p>
            </div>
            <dl className="divide-y divide-border border-y border-border">
              {faqs.map((f) => (
                <div key={f.q} className="py-6">
                  <dt className="text-sm font-semibold text-foreground">{f.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
          <Card className="relative overflow-hidden p-8 text-center sm:p-14">
            <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 blur-[120px]" />
            <div className="relative">
              <FileCheck2 className="mx-auto h-6 w-6 text-gold" />
              <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Bring your next mandate into the light
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Onboarding is invitation-based. Submit your entity for KYC review and we&apos;ll
                open a sandbox deal room within 48 hours.
              </p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="gold-glow inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-gold-bright to-gold px-6 py-3 text-sm font-semibold text-primary-foreground"
                >
                  Request platform access
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard/kyc"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/60 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-gold/50 hover:text-gold-bright"
                >
                  Start KYC onboarding
                </Link>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
