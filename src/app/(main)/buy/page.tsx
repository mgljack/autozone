import { BuyLandingClient } from "./pageClient";

export default function BuyLandingPage({
  searchParams,
}: {
  searchParams?: { type?: string };
}) {
  return <BuyLandingClient type={searchParams?.type ?? null} />;
}


