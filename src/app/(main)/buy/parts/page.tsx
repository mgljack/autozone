import { PartsClient } from "./pageClient";

export default function PartsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return <PartsClient searchParams={searchParams ?? {}} />;
}

