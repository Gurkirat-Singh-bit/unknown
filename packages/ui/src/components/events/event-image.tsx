"use client";

import { useState } from "react";

export function EventImage({ src, alt = "", className = "" }: { src?: string | null; alt?: string; className?: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<string | null>(null);
  const unavailable = !src || failed === src;
  const pending = !unavailable && loaded !== src;
  return <div aria-busy={pending} className={`relative overflow-hidden bg-ink ${className}`}>
    {unavailable ? <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-linear-to-br from-ink via-poster-mid to-ink text-white/65">
      <span aria-hidden="true" className="grid size-14 place-items-center rounded-2xl border border-white/20 text-2xl">⌘</span>
      <span className="text-xs font-medium">Preview unavailable</span>
    </div> : <>
      {pending && <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-line/80 motion-reduce:animate-none"><div className="absolute inset-0 m-auto size-12 rounded-xl border-2 border-white/40" /></div>}
      <img src={src ?? undefined} alt={alt} loading="lazy" ref={(image) => { if (image?.complete && image.naturalWidth > 0 && loaded !== src) setLoaded(src!); }} onLoad={() => setLoaded(src!)} onError={() => setFailed(src!)} className="absolute inset-0 size-full object-contain" />
    </>}
  </div>;
}
