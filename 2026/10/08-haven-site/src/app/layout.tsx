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
    <html lang="en" className={geist.variable}>
      <body className="bg-mist font-sans text-ink antialiased">
        {children}
        <DevTuner />
        <DevAgentation />
      </body>
    </html>
  );
}
