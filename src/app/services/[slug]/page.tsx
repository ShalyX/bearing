import { redirect } from "next/navigation";
import { getService } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) redirect("/marketplace");
  redirect(`/agents/${service.agentSlug}#run-service`);
}
