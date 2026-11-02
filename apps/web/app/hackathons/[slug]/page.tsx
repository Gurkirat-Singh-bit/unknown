import { HackathonDetailsPage } from "@repo/ui";

export default async function HackathonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <HackathonDetailsPage slug={slug} />;
}
