import "./globals.css";
import "dialkit/styles.css";
import { DialRoot } from "dialkit";

export const metadata = {
  title: "Interaction",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-50 antialiased">
        {children}
        <DialRoot />
      </body>
    </html>
  );
}
