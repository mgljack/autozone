import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  className,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600", className)}>
      <div className="text-base font-normal text-zinc-900">{title}</div>
      {description ? <div className="mt-1">{description}</div> : null}
      {actionHref && actionLabel ? (
        <div className="mt-4">
          <Link href={actionHref}>
            <Button>{actionLabel}</Button>
          </Link>
        </div>
      ) : null}
    </div>
  );
}


