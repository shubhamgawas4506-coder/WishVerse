"use client";

import { motion } from "framer-motion";

export function Tape({ className = "" }: { className?: string }) {
  return <span className={`decorative-tape ${className}`} aria-hidden="true" />;
}

export function Sticker({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.span
      className={`scrap-sticker ${className}`}
      whileHover={{ y: -6, rotate: -4, scale: 1.12 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.span>
  );
}

export function PaperNote({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={`paper-note ${className}`}
      whileHover={{ y: -4, rotate: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Tape />
      {children}
    </motion.div>
  );
}

export function Polaroid({ children, caption, className = "" }: { children: React.ReactNode; caption: string; className?: string }) {
  return (
    <motion.figure
      className={`scrap-polaroid ${className}`}
      whileHover={{ rotate: 0, y: -10, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 280, damping: 19 }}
    >
      <div>{children}</div>
      <figcaption>{caption}</figcaption>
    </motion.figure>
  );
}

export function ScrapbookCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.article
      className={`scrapbook-card ${className}`}
      whileHover={{ y: -8, rotate: 0 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {children}
    </motion.article>
  );
}

export function RetroWindow({ children, title, className = "" }: { children: React.ReactNode; title: string; className?: string }) {
  return (
    <div className={`retro-window ${className}`}>
      <div className="retro-window-bar">
        <span><i /><i /><i /></span>
        <b>{title}</b>
        <em>♡</em>
      </div>
      <div className="retro-window-body">{children}</div>
    </div>
  );
}
