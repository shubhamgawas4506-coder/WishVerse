import type { Metadata } from "next";
import { ReceiverExperience } from "@/components/receiver-experience";

export const metadata: Metadata = {
  title: "Something is waiting for you — WishVerse",
  description: "Open your personal WishVerse experience.",
};

export default function ExperiencePage() {
  return <ReceiverExperience />;
}
