import React from "react";
import TireDetailClient from "./pageClient";

type RouteParams = { id: string };

export default function TireDetailPage({ params }: { params: RouteParams | Promise<RouteParams> }) {
  const { id } = React.use(Promise.resolve(params));
  return <TireDetailClient id={id} />;
}

