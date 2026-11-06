import { Skeleton } from "../primitives/skeleton";

export function EventCardSkeleton() {
  return <div aria-hidden="true" className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
    <Skeleton className="aspect-[1.9/1] max-h-[220px] min-h-[180px] w-full shrink-0 rounded-none" />
    <div className="flex flex-1 flex-col p-4 sm:p-[18px]">
      <Skeleton className="mb-3 h-5 w-28 rounded-full" />
      <Skeleton className="h-5 w-5/6" /><Skeleton className="mt-2 h-5 w-3/5" />
      <Skeleton className="mt-3 h-3 w-2/5" />
      <div className="mt-4 mb-4 flex gap-2"><Skeleton className="h-5 w-16 rounded-full" /><Skeleton className="h-5 w-20 rounded-full" /></div>
      <div className="mt-auto space-y-3 border-t border-line pt-3"><Skeleton className="h-3.5 w-4/5" /><div className="flex justify-between gap-4"><Skeleton className="h-3.5 w-2/5" /><Skeleton className="h-3.5 w-1/3" /></div></div>
    </div>
  </div>;
}
