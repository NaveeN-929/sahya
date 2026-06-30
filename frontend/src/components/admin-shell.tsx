"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/button";
import { adminLogout, getAdminToken, getStoredAdminName } from "@/lib/admin-api";

const ADMIN_NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/knowledge", label: "Knowledge" },
  { href: "/admin/directory", label: "Directory" },
  { href: "/admin/crisis", label: "Crisis" },
  { href: "/admin/users", label: "Data requests" },
  { href: "/admin/audit", label: "Audit log" },
];

/**
 * Auth guard + chrome for every `/admin/*` page except `/admin/login`. Checked
 * client-side in an effect after mount (same hydration-safe pattern as `app-shell.tsx` —
 * the server can never see localStorage, so the redirect decision can't be made during
 * render).
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Reading localStorage/deciding the redirect can only happen client-side after mount —
    // same hydration-safe reasoning as `app-shell.tsx`'s documented localStorage pattern, so
    // these synchronous setState calls are the deliberate exception, not an oversight.
    if (pathname === "/admin/login") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChecked(true);
      return;
    }
    if (!getAdminToken()) {
      router.replace("/admin/login");
      return;
    }
    setName(getStoredAdminName());
    setChecked(true);
  }, [pathname, router]);

  if (pathname === "/admin/login") {
    return <div className="flex min-h-full flex-col bg-canvas">{children}</div>;
  }

  if (!checked) {
    return <div className="flex min-h-full items-center justify-center bg-canvas" />;
  }

  return (
    <div className="flex min-h-full flex-col bg-canvas">
      <header className="sticky top-0 z-20 border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-desktop items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-heading text-base font-semibold text-brand">
              Sahay admin
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {ADMIN_NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-button px-3 py-2 text-sm transition-colors duration-fast ${
                    pathname === link.href || (link.href !== "/admin" && pathname?.startsWith(link.href))
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
            {name && <span className="hidden text-xs text-ink-muted sm:inline">{name}</span>}
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  await adminLogout();
                } finally {
                  router.replace("/admin/login");
                }
              }}
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              Log out
            </Button>
          </div>
        </div>
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-2 md:hidden">
          {ADMIN_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-button px-3 py-1.5 text-sm transition-colors duration-fast ${
                pathname === link.href || (link.href !== "/admin" && pathname?.startsWith(link.href))
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
