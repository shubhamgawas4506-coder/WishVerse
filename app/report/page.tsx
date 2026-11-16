import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata:Metadata={title:"Report an experience",description:"Safety guidance for reporting an abusive or unlawful WishVerse gift."};
export default function ReportPage(){return <InfoPage kicker="SAFETY FIRST" title="Report a shared experience." intro="WishVerse does not host browser-first gift payloads on a server, so this preview cannot remotely remove or revoke them. These steps help you respond safely and preserve what a future moderation system needs.">
  <section><h2>Immediate danger</h2><p>If you or someone else may be in immediate danger, contact local emergency services. Do not rely on this website for urgent help.</p></section>
  <section><h2>Stop and preserve</h2><p>Close the gift, block the sender where appropriate and save only the gift identifier shown in the URL path. Avoid redistributing the full link because it may contain private text and media.</p></section>
  <section><h2>Browser-first limitation</h2><p>Because the current gift payload lives in its URL fragment, WishVerse never receives it and cannot inspect or delete it. A production deployment should enable server-backed reports, revocation, audit logs and a clear response process before accepting public user content.</p></section>
</InfoPage>}
