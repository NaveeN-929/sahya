"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Users, AlertTriangle, ClipboardList } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { listAdminArticles, listAdminProfessionals } from "@/lib/admin-api";

export default function AdminDashboardPage() {
  const [unreviewedCount, setUnreviewedCount] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    listAdminArticles()
      .then((articles) => setUnreviewedCount(articles.filter((a) => !a.reviewed_at).length))
      .catch((err) => console.error("could not load knowledge articles", err));
    listAdminProfessionals("pending")
      .then((rows) => setPendingCount(rows.length))
      .catch((err) => console.error("could not load professionals", err));
  }, []);

  const cards = [
    {
      href: "/admin/knowledge",
      icon: BookOpen,
      title: "Knowledge review",
      description: "Articles awaiting Tier 1 legal review",
      value: unreviewedCount,
    },
    {
      href: "/admin/directory",
      icon: Users,
      title: "Directory vetting",
      description: "Professionals awaiting verification",
      value: pendingCount,
    },
    {
      href: "/admin/crisis",
      icon: AlertTriangle,
      title: "Crisis monitoring",
      description: "Aggregate signal trends, no per-user data",
      value: null,
    },
    {
      href: "/admin/users",
      icon: ClipboardList,
      title: "Data requests",
      description: "Break-glass export/delete by handle",
      value: null,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-secondary">Operational overview of admin-gated work.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="h-full">
              <CardHeader>
                <card.icon className="h-5 w-5 text-primary-600" strokeWidth={1.75} aria-hidden="true" />
                <CardTitle className="mt-2">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              {card.value !== null && (
                <p className="font-heading text-2xl font-semibold text-ink">{card.value}</p>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
