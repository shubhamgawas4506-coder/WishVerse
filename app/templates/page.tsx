import type { Metadata } from "next";
import { TemplateBrowser } from "@/components/template-browser";

export const metadata: Metadata = {
  title: "Interactive Experiences | WishVerse",
  description: "Browse unique interactive gifts, letters, bouquets, memory films, birthday surprises and more.",
};

export default function TemplatesPage(){return <TemplateBrowser/>}
