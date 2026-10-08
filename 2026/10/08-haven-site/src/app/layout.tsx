import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Haven AI | AI Workers for Property Management",
  description:
    "Haven trains and manages custom AI workers that answer every maintenance call and leasing lead, around the clock.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={interTight.variable}>
      <body className="bg-mist font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
