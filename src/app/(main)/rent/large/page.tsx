import { RentTypeClient } from "./pageClient";

export default function RentLargePage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return <RentTypeClient type="large" searchParams={searchParams ?? {}} />;
}

