import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <button
        type="button"
        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-normal hover:bg-zinc-50 disabled:opacity-50"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
      >
        Prev
      </button>
      <span className="text-sm text-zinc-600">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-normal hover:bg-zinc-50 disabled:opacity-50"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </div>
  );
}


