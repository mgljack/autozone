import React from "react";
import CarDetailClient from "./CarDetailClient";

type RouteParams = { id: string };

export default function CarDetailPage({ params }: { params: RouteParams | Promise<RouteParams> }) {
  const { id } = React.use(Promise.resolve(params));
  return <CarDetailClient id={id} />;
}


