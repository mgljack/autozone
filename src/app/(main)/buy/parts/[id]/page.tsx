import React from "react";
import PartDetailClient from "./pageClient";

type RouteParams = { id: string };

export default function PartDetailPage({ params }: { params: RouteParams | Promise<RouteParams> }) {
  const { id } = React.use(Promise.resolve(params));
  return <PartDetailClient id={id} />;
}

