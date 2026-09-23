import type { Metadata } from "next";
import "./globals.css";
import "./landing.css";
import { RightsIdentityScope } from "@/signer/rights-identity";

export const metadata: Metadata = {
  title: "USEBOND · Rights clearing for exact intended uses",
  description: "Consensus-backed permission decisions for frozen licence terms and exact intended uses on GenLayer.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <RightsIdentityScope>{children}</RightsIdentityScope>
      </body>
    </html>
  );
}
