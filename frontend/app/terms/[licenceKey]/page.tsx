import { LicenceFolio } from "@/term-sheet/LicenceFolio";

export default async function TermsPage({ params }: { params: Promise<{ licenceKey: string }> }) {
  const { licenceKey } = await params;
  return <LicenceFolio licenceKey={decodeURIComponent(licenceKey)} />;
}
