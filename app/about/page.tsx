import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart, Mail, Sparkles } from "lucide-react";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = {
  title: "About — Created by Shubham Gawas",
  description: "Learn about WishVerse and its creator, Shubham Gawas.",
};

export default function AboutPage() {
  return (
    <InfoPage
      kicker="HANDCRAFTED WITH LOVE"
      title="A greeting should feel like a place."
      intro="WishVerse was created by Shubham Gawas to turn letters, photographs, flowers, soundtracks and small promises into tactile, intimate digital worlds made for one person in the universe."
    >
      <section className="about-creator-spotlight">
        <div className="creator-spotlight-box">
          <div className="creator-badge">
            <Sparkles /> CREATOR & DEVELOPER
          </div>
          <h2>Created by Shubham Gawas with love ♡</h2>
          <p>
            Hi! I’m <strong>Shubham Gawas</strong>, the creator and lead engineer behind WishVerse.
          </p>
          <p>
            I built WishVerse because ordinary digital greetings felt too cold and disposable. A quick text or a static e-card doesn’t capture the butterflies of giving someone an envelope, dedicating their favorite song, or flipping through a photo book of moments you never want to forget.
          </p>
          <p>
            Every single detail—the pastel scrapbook styling, draggable audio trimming, responsive touch interactions, and private gift links—was built from scratch with heartfelt care and love.
          </p>
          <div className="creator-contact-cta">
            <Link href="/contact" className="creator-contact-btn">
              <Mail /> Send Shubham a message <ArrowRight />
            </Link>
            <a
              href="mailto:shubhamgawas4506@gmail.com"
              className="creator-email-link"
            >
              <Heart fill="currentColor" /> shubhamgawas4506@gmail.com
            </a>
          </div>
        </div>
      </section>

      <section>
        <h2>Why WishVerse exists</h2>
        <p>
          Most greeting tools stop at a flat, impersonal image. WishVerse is designed around tangible rituals: opening sealed letters, blowing out birthday candles, unrolling photo strips, pulling a note from a compliment jar, and listening to an intimate soundtrack together.
        </p>
      </section>

      <section>
        <h2>Designed to be remixed</h2>
        <p>
          Templates give you a strong starting point without deciding your story for you. The original scrapbook system combines warm paper textures, accessible interactions, honest controls and receiver-first pacing.
        </p>
      </section>

      <section>
        <h2>Get in touch</h2>
        <p>
          Got feedback, ideas, or a special celebration in mind? I’d love to hear from you. Reach out through the{" "}
          <Link href="/contact">Contact Page</Link> or send a message directly to{" "}
          <a href="mailto:shubhamgawas4506@gmail.com">shubhamgawas4506@gmail.com</a>.
        </p>
      </section>
    </InfoPage>
  );
}
