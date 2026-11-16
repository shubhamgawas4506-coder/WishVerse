import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExperienceMaker } from "@/components/experience-maker";
import { experienceMeta, ExperienceKind } from "@/lib/greeting";

export const metadata: Metadata = {
  title: "Create an experience — WishVerse",
  description: "Make a one-of-a-kind interactive greeting.",
};

export default async function ThemedCreatePage({ params }: { params: Promise<{ experience: string }> }) {
  const { experience } = await params;
  if (!(experience in experienceMeta)) notFound();
  return <ExperienceMaker experience={experience as ExperienceKind} />;
}
