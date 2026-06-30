"use client";

import Link from "next/link";
import { Phone } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ensureSession, getStoredHandle } from "@/lib/api";
import { Button } from "@/components/button";

const NAV_LINKS = [
  { href: "/chat", label: "Chat" },
  { href: "/journal", label: "Journal" },
  { href: "/directory", label: "Find help" },
  { href: "/knowledge", label: "Learn" },
  { href: "/privacy", label: "Privacy" },
];

const TELE_MANAS_TEL = "tel:14416";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Starts null on both server and the client's first paint on purpose — the server can
  // never know the client's localStorage value, so seeding this from getStoredHandle() in
  // a lazy initializer (the "obvious" fix) causes a hydration mismatch the moment a token
  // already exists. Set it for real only after mount, in the effect below.
  const [handle, setHandle] = useState<string | null>(null);

  useEffect(() => {
    // Post-hydration sync from localStorage; setting this any earlier reintroduces the
    // hydration mismatch explained above.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHandle(getStoredHandle());
    ensureSession()
      .then((session) => setHandle(session.pseudonymous_handle))
      .catch((err) => {
        console.error("could not start anonymous session", err);
      });
  }, []);

  return (
    <div className="flex min-h-full flex-col bg-canvas">
      <header className="sticky top-0 z-20 border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-desktop items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-heading text-base font-semibold text-brand">
              Sahay
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-button px-3 py-2 text-sm transition-colors duration-fast ${
                    pathname?.startsWith(link.href)
                      ? "bg-primary-50 text-primary-700"
                      : "text-ink-secondary hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {handle && <span className="hidden text-xs text-ink-muted sm:inline">{handle}</span>}
            <Button
              variant="emergency"
              size="sm"
              onClick={() => {
                window.location.href = TELE_MANAS_TEL;
              }}
            >
              <Phone className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              Get help now
            </Button>
          </div>
        </div>
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-2 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-button px-3 py-1.5 text-sm transition-colors duration-fast ${
                pathname?.startsWith(link.href)
                  ? "bg-primary-50 text-primary-700"
                  : "text-ink-secondary hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-desktop flex-1 px-6 py-10 md:px-12">{children}</main>
    </div>
  );
}
