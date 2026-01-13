import React from "react";
import MediaDetailClient from "./pageClient";

type RouteParams = { id: string };

export default function MediaDetailPage({ params }: { params: RouteParams | Promise<RouteParams> }) {
  const { id } = React.use(Promise.resolve(params));
  return <MediaDetailClient id={id} />;
}

