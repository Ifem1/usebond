import type { Metadata } from "next";
import "./globals.css";
import { RightsIdentityScope } from "@/signer/rights-identity";

export const metadata: Metadata = {
  title: "USEBOND",
  description: "Consensus-backed permission decisions for frozen licence terms and exact intended uses.",
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
