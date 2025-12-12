import { redirect, notFound } from "next/navigation";

interface PageProps {
  params: {
    id: string;
  };
}

const pointPrefixes = ["point-", "kp-", "knowledge-point-"];

export default function KnowledgeEntryPage({ params }: PageProps) {
  const { id } = params;

  if (!id) {
    notFound();
  }

  const lowerId = id.toLowerCase();
  const isPoint = pointPrefixes.some((prefix) => lowerId.startsWith(prefix));

  if (isPoint) {
    redirect(`/knowledge/point/${id}`);
  }

  redirect(`/knowledge/chapter/${id}`);
}

