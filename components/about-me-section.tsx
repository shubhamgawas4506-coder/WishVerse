"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Heart, Mail, Sparkles, Star, WandSparkles } from "lucide-react";
import { Polaroid, Sticker, Tape } from "@/components/scrapbook-ui";

export function AboutMeSection() {
  return (
    <section className="about-me-section section" id="about-me">
      <div className="section-label">
        <Sparkles /> MEET THE CREATOR
      </div>
      <h2>
        Created by <em>Shubham Gawas</em>
        <br />
        <span className="about-me-heart-sub">with love ♡</span>
      </h2>

      <div className="about-me-board">
        {/* Left: Creator Polaroid Keepsake */}
        <div className="about-me-polaroid-wrap">
          <Tape className="about-me-tape" />
          <Polaroid caption="Shubham Gawas · Creator of WishVerse" className="about-me-polaroid">
            <div className="about-me-avatar">
              <div className="about-me-avatar-inner">
                <span className="creator-initials">SG</span>
                <span className="creator-flower">✿</span>
              </div>
            </div>
          </Polaroid>
          <Sticker className="about-star">★</Sticker>
          <Sticker className="about-bow">୨୧</Sticker>
        </div>

        {/* Right: Thoughtful Creator Story */}
        <div className="about-me-card">
          <div className="about-badge-row">
            <span className="creator-role-badge">Creator & Developer</span>
            <span className="creator-location-badge">Handcrafted with care</span>
          </div>

          <h3>
            &ldquo;Some memories deserve a place they can live forever.&rdquo;
          </h3>

          <p className="about-me-p">
            Hi, I’m <strong>Shubham Gawas</strong>! I designed and built WishVerse because ordinary text messages and flat e-cards felt too rushed, forgettable, and distant.
          </p>

          <p className="about-me-p">
            I wanted to create a cozy digital sanctuary where words arrive with rhythm: opening an envelope, blooming a bouquet, turning the pages of a memory book, and hearing a song that sounds like someone you love.
          </p>

          <p className="about-me-p">
            From the pink audio trimmer and custom soundtracks to tactile paper textures and private receiver links, every single interaction was built to bring warmth to the people you hold close.
          </p>

          <div className="about-me-actions">
            <a href="#contact" className="primary-button">
              <Mail /> Send me a message <ArrowRight />
            </a>
            <a
              href="mailto:shubhamgawas4506@gmail.com"
              className="paper-button about-email-btn"
            >
              <Heart fill="currentColor" /> shubhamgawas4506@gmail.com
            </a>
          </div>

          <div className="about-me-signoff">
            <span>Made with a full heart by</span>
            <strong>Shubham Gawas ♡</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
