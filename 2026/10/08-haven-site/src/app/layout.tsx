import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { DevAgentation } from "@/components/DevAgentation";
import { DevTuner } from "@/components/DevTuner";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const title = "Haven AI | AI Workers for Property Management";
const description =
  "Haven trains and manages custom AI workers that answer every maintenance call and leasing lead, around the clock.";

export const metadata: Metadata = {
  // Link previews need absolute image URLs. The base path (/project-365/…) is added by Next on top of this.
  // When the site moves to its own domain, change this (or set NEXT_PUBLIC_SITE_ORIGIN).
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://abdussalam-popsy.github.io"),
  title,
  description,
  // The preview image itself is src/app/opengraph-image.jpg (1200×630), picked up automatically for every page.
  openGraph: { type: "website", siteName: "Haven", title, description },
  twitter: { card: "summary_large_image", title, description },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="bg-mist font-sans text-ink antialiased">
        {children}
        <DevTuner />
        <DevAgentation />
      </body>
    </html>
  );
}
