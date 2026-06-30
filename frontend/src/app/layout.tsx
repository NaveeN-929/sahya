import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sahay — Support, privately",
  description:
    "Anonymous AI support, legal-process education, and private journaling for men navigating abuse, legal distress, and mental health challenges in India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}
