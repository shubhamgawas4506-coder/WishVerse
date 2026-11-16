import type { Metadata } from "next";
import { ReceiverExperience } from "@/components/receiver-experience";

export const metadata: Metadata = {
  title: "Someone made a WishVerse for you",
  description: "A private interactive gift is waiting. Tap to open it.",
  robots: { index: false, follow: false },
  openGraph: { title: "A WishVerse is waiting for you", description: "Someone made a private interactive experience for you.", type: "website" },
};

export default function GiftPage(){return <ReceiverExperience/>}
