import React from "react";
import ServiceCenterDetailClient from "./pageClient";

type RouteParams = { id: string };

export default function ServiceCenterDetailPage({ params }: { params: RouteParams | Promise<RouteParams> }) {
  const { id } = React.use(Promise.resolve(params));
  return <ServiceCenterDetailClient id={id} />;
}


