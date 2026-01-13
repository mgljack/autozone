import { RentClient } from "./pageClient";

export default function RentPage({
  searchParams,
}: {
  searchParams?: { type?: string };
}) {
  return <RentClient type={searchParams?.type ?? null} />;
}


