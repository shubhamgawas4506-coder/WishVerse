import type { Metadata } from "next";
import { CreationLibrary } from "@/components/creation-library";

export const metadata:Metadata={title:"My Creations | WishVerse",description:"Continue, preview and share the interactive experiences saved on this device."};
export default function MyCreationsPage(){return <CreationLibrary/>}
