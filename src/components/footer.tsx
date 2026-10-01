import Link from "next/link";
import { Brand } from "@/components/app-shell";

const FOOTER_COLUMNS: Array<{
  title: string;
  items: Array<{ label: string; href: string }>;
}> = [
  {
    title: "Platform",
    items: [
      { label: "Deal rooms", href: "/platform/deal-rooms" },
      { label: "Document vault", href: "/platform/document-vault" },
      { label: "Commission engine", href: "/platform/commission-engine" },
      { label: "Audit log", href: "/platform/audit-log" },
    ],
  },
  {
    title: "Compliance",
    items: [
      { label: "KYC & screening", href: "/compliance/kyc-screening" },
      { label: "Sanctions policy", href: "/compliance/sanctions-policy" },
      { label: "Data residency", href: "/compliance/data-residency" },
      { label: "Security", href: "/compliance/security" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About Shaqal", href: "/company/about" },
      { label: "Contact desk", href: "/company/contact" },
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];

/**
 * THE site footer — single source of truth for every page (marketing, legal,
 * product and compliance pages). Update link targets or copy here once and it
 * changes everywhere.
 */
export function Footer() {
  return (
    <footer className="border-t border-border bg-sidebar/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div className="min-w-0">
          <Brand short />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Audited deal infrastructure for gold, minerals and high-value physical commodity
            trade.
          </p>
        </div>
        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-xs uppercase tracking-[0.18em] text-gold">{col.title}</p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {col.items.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="transition-colors hover:text-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="tnum">© 2026 Shaqal Metals FZE · ISO 27001 · FATF aligned</p>
          <p>Dubai · Accra · Geneva</p>
        </div>
      </div>
    </footer>
  );
}
