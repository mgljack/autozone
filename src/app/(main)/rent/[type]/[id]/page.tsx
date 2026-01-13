import React from "react";
import RentDetailClient from "./pageClient";

type RouteParams = { type: string; id: string };

export default function RentDetailPage({ params }: { params: RouteParams | Promise<RouteParams> }) {
  const resolved = React.use(Promise.resolve(params));
  return <RentDetailClient type={resolved.type} id={resolved.id} />;
}

