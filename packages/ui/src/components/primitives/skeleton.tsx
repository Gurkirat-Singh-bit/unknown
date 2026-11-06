export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-md bg-line/65 motion-reduce:animate-none ${className}`} />;
}
