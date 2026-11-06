"use client";
import { useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { HeroSection } from "@repo/ui";
import { catalogueUrl } from "../lib/catalogue-url";

export function HomeHero({ statisticsSlot }: { statisticsSlot: ReactNode }) {
  const router = useRouter();
  const [pending, startNavigation] = useTransition();
  return <HeroSection statisticsSlot={statisticsSlot} loading={pending} onSearch={(query) => startNavigation(() => router.push(catalogueUrl({ q: query.trim() || undefined })))} />;
}
