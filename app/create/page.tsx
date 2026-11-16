import type { Metadata } from "next";
import { CreatorStudio } from "@/components/creator-studio";

export const metadata: Metadata = {
  title: "Create a WishVerse",
  description: "Turn a note into a beautiful interactive world.",
};

export default function CreatePage() {
  return <CreatorStudio />;
}
