import { TirePageClient } from "./pageClient";

export default function TirePage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return <TirePageClient searchParams={searchParams ?? {}} />;
}

