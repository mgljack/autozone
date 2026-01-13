import { RentTypeClient } from "./pageClient";

export default function RentTruckPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return <RentTypeClient type="truck" searchParams={searchParams ?? {}} />;
}

