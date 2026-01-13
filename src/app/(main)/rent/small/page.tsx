import { RentTypeClient } from "./pageClient";

export default function RentSmallPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return <RentTypeClient type="small" searchParams={searchParams ?? {}} />;
}

