import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata:Metadata={title:"Privacy",description:"How the browser-first WishVerse experience handles drafts, gift links and media."};
export default function PrivacyPage(){return <InfoPage kicker="YOUR MEMORIES, YOUR CONTROL" title="Privacy, in plain language." intro="This version of WishVerse is browser-first. Your drafts stay on the device where you make them, and the private content of a shared gift travels inside its link.">
  <section><h2>What stays on your device</h2><p>Drafts, favorites and creation status are saved in your browser’s local storage. WishVerse does not currently run user accounts, a database, analytics or advertising trackers. Clearing site data, using another browser or changing devices can remove access to those drafts.</p></section>
  <section><h2>What a gift link contains</h2><p>The text, settings and compressed images in a gift are encoded after the <code>#</code> in the URL. Browsers do not send that fragment to the server during a normal page request, but anyone who receives the complete link can open and copy the gift. Treat the link like a private letter.</p></section>
  <section><h2>Photos and media</h2><p>Uploaded photos are validated, resized in your browser and placed into the share payload. Optional song, audio and video URLs are loaded from the provider you choose and are subject to that provider’s privacy terms. Do not add sensitive, unlawful or non-consensual media.</p></section>
  <section><h2>Sharing services</h2><p>WhatsApp, email, Web Share and external media links open third-party services only when you choose them. WishVerse does not receive their account details. Review the destination before sending.</p></section>
  <section><h2>Your choices</h2><p>You can delete individual drafts in My Creations or clear this site’s data in your browser settings. A shared browser-only link cannot be remotely revoked; the production architecture plan includes server-backed revocation, expiry and access controls.</p></section>
</InfoPage>}
