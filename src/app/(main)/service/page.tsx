import { ServiceCentersClient } from "./pageClient";

export default function ServiceCentersPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return <ServiceCentersClient searchParams={searchParams ?? {}} />;
}


