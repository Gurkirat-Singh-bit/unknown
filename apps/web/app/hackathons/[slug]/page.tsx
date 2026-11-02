import { HackathonDetailsPage } from "./event-details";

export default async function HackathonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <HackathonDetailsPage slug={slug} />;
}
