"use client";

import React, { useState } from "react";
import { Check, Mail, Send, Sparkles, AlertCircle, Heart } from "lucide-react";
import { Tape } from "@/components/scrapbook-ui";

interface ContactFormProps {
  className?: string;
  compact?: boolean;
}

export function ContactForm({ className = "", compact = false }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [mailtoUrl, setMailtoUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!message.trim()) {
      setErrorMsg("Please write your message.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Could not send message.");
      }

      setSuccess(true);
      if (data.mailtoUrl) {
        setMailtoUrl(data.mailtoUrl);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send message. Please try emailing directly.";
      setErrorMsg(msg);
      // Fallback mailto URL so user can always send directly
      const subject = encodeURIComponent(`Message for Shubham from ${name}`);
      const body = encodeURIComponent(`Hi Shubham,\n\n${message}\n\n---\nFrom: ${name}\nEmail: ${email}`);
      setMailtoUrl(`mailto:shubhamgawas4506@gmail.com?subject=${subject}&body=${body}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setMessage("");
    setSuccess(false);
    setErrorMsg("");
    setMailtoUrl("");
  };

  return (
    <div className={`contact-card-wrapper ${className}`}>
      <div className="contact-paper-card">
        <Tape className="contact-tape" />

        {success ? (
          <div className="contact-success-state">
            <div className="contact-success-badge">
              <Check />
            </div>
            <h3>Thank you, {name}!</h3>
            <p className="contact-success-msg">
              Your message was received with love and sent to{" "}
              <strong>shubhamgawas4506@gmail.com</strong>. Shubham will read it and get back to you soon ♡
            </p>

            <div className="contact-success-actions">
              {mailtoUrl && (
                <a
                  href={mailtoUrl}
                  className="contact-mailto-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Mail /> Open in Mail App / Send a Copy
                </a>
              )}
              <button
                type="button"
                className="contact-reset-btn"
                onClick={handleReset}
              >
                Send another note
              </button>
            </div>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form-header">
              <span className="contact-subtitle">
                <Heart fill="currentColor" /> Direct note to Shubham Gawas
              </span>
              <p className="contact-desc">
                Have a thought, question, or just want to share some love? Send a message below and it goes straight to{" "}
                <a href="mailto:shubhamgawas4506@gmail.com" className="contact-email-inline">
                  shubhamgawas4506@gmail.com
                </a>.
              </p>
            </div>

            {errorMsg && (
              <div className="contact-error-banner" role="alert">
                <AlertCircle />
                <span>{errorMsg}</span>
                {mailtoUrl && (
                  <a href={mailtoUrl} className="contact-fallback-link">
                    Click here to send directly via email
                  </a>
                )}
              </div>
            )}

            <div className="contact-field-grid">
              <label className="contact-label">
                <span>Your Name</span>
                <input
                  type="text"
                  placeholder="e.g. Maya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </label>

              <label className="contact-label">
                <span>Your Email</span>
                <input
                  type="email"
                  placeholder="e.g. maya@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </label>
            </div>

            <label className="contact-label">
              <span>Your Message</span>
              <textarea
                rows={compact ? 4 : 5}
                placeholder="Write your note, idea, feedback or memory for Shubham..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </label>

            <div className="contact-form-footer">
              <div className="contact-privacy-note">
                <Sparkles /> Sent directly to <b>shubhamgawas4506@gmail.com</b>
              </div>
              <button
                type="submit"
                className="contact-submit-btn primary-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span>Sending with love…</span>
                ) : (
                  <>
                    <Send /> Send Message <Heart fill="currentColor" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
