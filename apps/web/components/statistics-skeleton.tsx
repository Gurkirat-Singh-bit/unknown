import { Skeleton } from "@repo/ui";

export function StatisticsSkeleton() {
  return <div aria-busy="true"><span role="status" className="sr-only">Loading catalogue statistics</span><dl className="mx-auto mt-8 grid w-full max-w-4xl grid-cols-2 gap-y-6 border-t border-ink/10 pt-6 text-center sm:grid-cols-4 sm:divide-x sm:divide-ink/10">{["Hackathons", "Open registrations", "Upcoming registrations", "Online events"].map((label) => <div key={label} className="flex flex-col items-center px-3"><dt className="order-2 mt-1.5 text-xs text-muted">{label}</dt><dd className="order-1 flex h-8 items-center sm:h-9"><Skeleton className="h-7 w-14 sm:h-8" /></dd></div>)}</dl></div>;
}
