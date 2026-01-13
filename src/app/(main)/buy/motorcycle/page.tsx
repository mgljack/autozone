import { MotorcycleAllClient } from "./pageClient";

export default function BuyAllMotorcyclesPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return <MotorcycleAllClient searchParams={searchParams ?? {}} />;
}


