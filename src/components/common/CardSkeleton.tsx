export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="h-32 rounded-xl bg-zinc-100" />
      <div className="mt-4 h-4 w-2/3 rounded bg-zinc-100" />
      <div className="mt-2 h-4 w-1/2 rounded bg-zinc-100" />
    </div>
  );
}


