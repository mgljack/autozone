import { cn } from "@/lib/utils";

export function SectionTitle({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-1", className)}>
      <h1 className="text-2xl font-normal tracking-tight">{title}</h1>
      {subtitle ? <p className="text-sm text-zinc-600">{subtitle}</p> : null}
    </div>
  );
}


