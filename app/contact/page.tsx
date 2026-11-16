import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Heart, Mail, Sparkles } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact Shubham Gawas — WishVerse",
  description: "Send a message, feedback, or inquiry directly to Shubham Gawas (shubhamgawas4506@gmail.com).",
};

export default function ContactPage() {
  return (
    <main className="info-shell contact-page-shell">
      <nav className="info-nav">
        <Link href="/">
          <Sparkles /> WishVerse
        </Link>
        <div className="contact-nav-right">
          <Link href="/about">About Shubham</Link>
          <Link href="/templates">Browse experiences</Link>
        </div>
      </nav>

      <article className="info-paper contact-paper-container">
        <Link className="info-back" href="/">
          <ArrowLeft /> Back home
        </Link>

        <small>WE’RE HERE WITH LOVE</small>
        <h1>Send a message to Shubham</h1>
        <p className="info-intro">
          Whether you have a question, feedback, an idea for a new experience, or just want to share some kind words, fill out the form below. Your message will be sent straight to <strong>shubhamgawas4506@gmail.com</strong>.
        </p>

        {/* Embedded Contact Form */}
        <div className="contact-page-form-wrap">
          <ContactForm />
        </div>

        <div className="contact-quick-options">
          <section>
            <h2>Direct Email</h2>
            <p>
              Prefer emailing directly? You can always reach me at:
              <br />
              <a href="mailto:shubhamgawas4506@gmail.com" className="contact-highlight-email">
                <Mail /> shubhamgawas4506@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2>Creation help</h2>
            <p>
              Reopen drafts from <Link href="/my-creations">My Creations</Link>. If a shared gift link looks incomplete, you can copy the full link or the unique R-Code anytime from Finish &amp; share.
            </p>
          </section>

          <section>
            <h2>Safety issue</h2>
            <p>
              For harassment, impersonation, privacy concerns or abuse, visit our{" "}
              <Link href="/report">safety reporting page</Link>.
            </p>
          </section>
        </div>

        <footer>
          <span>Handcrafted by Shubham Gawas with love ♡</span>
          <Link href="/about">About the creator</Link>
        </footer>
      </article>
    </main>
  );
}
