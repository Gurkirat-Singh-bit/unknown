import type { Metadata } from "next";
import "./globals.css";
import dmSansUrl from "../../../packages/ui/src/fonts/DM-Sans-variable.woff2?url";
import manropeUrl from "../../../packages/ui/src/fonts/Manrope-variable.woff2?url";

export const metadata: Metadata = {
  title: "HackRadar — Discover Your Next Hackathon",
  description: "Discover open and upcoming hackathons, explore themes, and find your next challenge.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href={dmSansUrl} as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href={manropeUrl} as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
