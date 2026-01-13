import { BuyAllClient } from "./pageClient";

export default function BuyAllVehiclesPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return <BuyAllClient searchParams={searchParams ?? {}} />;
}


