import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HackRadar — Discover Your Next Hackathon",
  description: "Find hackathons, coding competitions, workshops, meetups and developer communities in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
