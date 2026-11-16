import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata:Metadata={title:"Terms",description:"The ground rules for creating and sharing WishVerse experiences."};
export default function TermsPage(){return <InfoPage kicker="A FEW GENTLE GROUND RULES" title="Make something kind." intro="By using WishVerse, you agree to create and share experiences responsibly and only with content you have the right to use.">
  <section><h2>Your content</h2><p>You keep ownership of the words and media you add. You are responsible for permission, accuracy and consent, especially when a greeting includes another person’s image, voice, personal details or location.</p></section>
  <section><h2>Acceptable use</h2><p>Do not use WishVerse to harass, threaten, impersonate, expose private information, distribute malware, exploit minors, violate intellectual-property rights or break applicable law. Do not disguise dangerous links as gifts.</p></section>
  <section><h2>Browser-first availability</h2><p>This preview is provided as-is. Drafts can be lost if browser storage is cleared, and link-embedded gifts cannot be revoked after sharing. Keep a copy of important writing and test the receiver link before sending it.</p></section>
  <section><h2>External services</h2><p>Media hosts, maps, messaging services and other links are independent services with their own terms. WishVerse does not guarantee their availability or the content they deliver.</p></section>
  <section><h2>Reporting</h2><p>If a shared experience is abusive or unlawful, do not interact with it further. Preserve the public gift identifier, then use the reporting page to document the issue.</p><p><a href="/report">Open the safety report page</a></p></section>
</InfoPage>}
