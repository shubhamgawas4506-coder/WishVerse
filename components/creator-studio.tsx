"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  Gift,
  Heart,
  Link2,
  Mail,
  MessageCircle,
  Moon,
  Music2,
  Plus,
  ReceiptText,
  RotateCcw,
  Send,
  Sparkles,
  Stamp,
  Trash2,
  Type,
  WandSparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  defaultGreeting,
  encodeGreeting,
  formatMeta,
  GreetingData,
  GreetingFormat,
  GreetingTheme,
  themeMeta,
} from "@/lib/greeting";
import { AudioStudioControl } from "@/components/audio-studio-control";
import { PinkAudioPlayer } from "@/components/pink-audio-player";

type Panel = "story" | "format" | "style";

const formatIcons: Record<GreetingFormat, React.ReactNode> = {
  typewriter: <Type />,
  receipt: <ReceiptText />,
  envelope: <Mail />,
  postcard: <Stamp />,
  chat: <MessageCircle />,
  memory: <Heart />,
};

export function CreatorStudio() {
  const [greeting, setGreeting] = useState<GreetingData>(defaultGreeting);
  const [panel, setPanel] = useState<Panel>("story");
  const [publishOpen, setPublishOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(true);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
    const params = new URLSearchParams(window.location.search);
    const recipient = params.get("recipient");
    const occasion = params.get("occasion");
    const requestedFormat = params.get("format");
    const formatAliases: Record<string, GreetingFormat> = {
      letters: "envelope",
      scrapbook: "memory",
      camera: "memory",
      flowers: "memory",
      newspaper: "receipt",
      book: "memory",
      coffee: "memory",
      place: "postcard",
      typewriter: "typewriter",
      gift: "memory",
    };
    const stored = window.localStorage.getItem("wishverse-draft");
    if (stored) {
      try { setGreeting({ ...defaultGreeting, ...JSON.parse(stored) }); } catch { /* use default */ }
    }
    if (recipient || occasion) {
      setGreeting((current) => ({ ...current, recipient: recipient || current.recipient, occasion: occasion || current.occasion }));
    }
    if (requestedFormat && formatAliases[requestedFormat]) {
      setGreeting((current) => ({ ...current, format: formatAliases[requestedFormat] }));
      setPanel("format");
    }
  }, []);

  useEffect(() => {
    setSaved(false);
    const timer = window.setTimeout(() => {
      window.localStorage.setItem("wishverse-draft", JSON.stringify(greeting));
      setSaved(true);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [greeting]);

  const update = <K extends keyof GreetingData>(key: K, value: GreetingData[K]) => {
    setGreeting((current) => ({ ...current, [key]: value }));
  };

  const setDetail = (key: string, value: string) => {
    setGreeting((current) => ({
      ...current,
      details: { ...current.details, [key]: value },
    }));
  };

  const setAudioDetails = (audioData: Record<string, string>) => {
    setGreeting((current) => ({
      ...current,
      music: Boolean(audioData.audioUrl || current.details?.audioUrl),
      details: { ...current.details, ...audioData },
    }));
  };

  const shareUrl = useMemo(() => {
    if (!baseUrl) return "";
    return `${baseUrl}/experience?g=${encodeGreeting(greeting)}`;
  }, [baseUrl, greeting]);
  const previewUrl = useMemo(() => shareUrl ? `${shareUrl}&preview=message` : "", [shareUrl]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const addMemory = () => update("memories", [...greeting.memories, "A new little memory"]);
  const updateMemory = (index: number, value: string) => update("memories", greeting.memories.map((item, i) => i === index ? value : item));
  const moveMemory = (index: number, direction: number) => {
    const target = index + direction;
    if (target < 0 || target >= greeting.memories.length) return;
    const next = [...greeting.memories];
    [next[index], next[target]] = [next[target], next[index]];
    update("memories", next);
  };

  return (
    <main className="studio-page">
      <header className="studio-header">
        <div className="studio-header-left">
          <Link href="/" className="studio-back" aria-label="Back home"><ArrowLeft /></Link>
          <Link href="/" className="studio-brand"><span><Sparkles /></span>Wish<span>Verse</span></Link>
          <i />
          <div className="draft-name"><strong>{greeting.title || "Untitled WishVerse"}</strong><span>{saved ? <><Check /> Saved</> : "Saving…"}</span></div>
        </div>
        <div className="studio-header-actions">
          <a className="preview-link" href={previewUrl || "#"} target="_blank" rel="noreferrer"><Eye /> Preview</a>
          <button className="publish-button" onClick={() => setPublishOpen(true)}><Send /> Publish & share</button>
        </div>
      </header>

      <div className="studio-layout">
        <aside className="studio-rail" aria-label="Builder sections">
          <button className={panel === "story" ? "active" : ""} onClick={() => setPanel("story")}><WandSparkles /><span>Your story</span></button>
          <button className={panel === "format" ? "active" : ""} onClick={() => setPanel("format")}><Type /><span>Format</span></button>
          <button className={panel === "style" ? "active" : ""} onClick={() => setPanel("style")}><Moon /><span>Atmosphere</span></button>
        </aside>

        <section className="studio-panel">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={panel} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: .25 }}>
              {panel === "story" && (
                <>
                  <div className="panel-heading"><span>01 · YOUR STORY</span><h1>Make it sound<br /><em>like you.</em></h1><p>Write from the heart. The world will shape itself around your words.</p></div>
                  <div className="field-row"><label><span>For</span><input value={greeting.recipient} onChange={(event) => update("recipient", event.target.value)} /></label><label><span>From</span><input value={greeting.sender} onChange={(event) => update("sender", event.target.value)} /></label></div>
                  <label className="studio-field"><span>Title</span><input value={greeting.title} onChange={(event) => update("title", event.target.value)} /></label>
                  <label className="studio-field"><span>Your message</span><textarea rows={7} value={greeting.message} onChange={(event) => update("message", event.target.value)} /><small>{greeting.message.length} characters</small></label>
                  <div className="memory-editor"><div className="memory-editor-title"><div><span>LITTLE THINGS</span><p>These become interactive details in the experience.</p></div><button onClick={addMemory}><Plus /> Add</button></div>
                    {greeting.memories.map((memory, index) => <div className="memory-row" key={index}><span>{String(index + 1).padStart(2, "0")}</span><input value={memory} onChange={(event) => updateMemory(index, event.target.value)} /><div><button onClick={() => moveMemory(index, -1)} aria-label="Move up"><ChevronUp /></button><button onClick={() => moveMemory(index, 1)} aria-label="Move down"><ChevronDown /></button><button onClick={() => update("memories", greeting.memories.filter((_, i) => i !== index))} aria-label="Delete"><Trash2 /></button></div></div>)}
                  </div>
                  <label className="studio-field"><span>Sign-off</span><input value={greeting.signoff} onChange={(event) => update("signoff", event.target.value)} /></label>
                  <button className="panel-next" onClick={() => setPanel("format")}>Choose how it appears <ArrowRight /></button>
                </>
              )}

              {panel === "format" && (
                <>
                  <div className="panel-heading"><span>02 · THE REVEAL</span><h1>Choose how they<br /><em>discover it.</em></h1><p>The same words can feel completely different in every format.</p></div>
                  <div className="format-grid">{(Object.keys(formatMeta) as GreetingFormat[]).map((format) => <button key={format} onClick={() => update("format", format)} className={greeting.format === format ? "selected" : ""}><span>{formatIcons[format]}</span><div><strong>{formatMeta[format].name}</strong><small>{formatMeta[format].description}</small></div><i>{greeting.format === format && <Check />}</i></button>)}</div>
                  <div className="format-tip"><Sparkles /><div><strong>Each format is alive.</strong><p>Keys type, receipts print, envelopes unfold, and conversations arrive one message at a time.</p></div></div>
                  <button className="panel-next" onClick={() => setPanel("style")}>Choose the atmosphere <ArrowRight /></button>
                </>
              )}

              {panel === "style" && (
                <>
                  <div className="panel-heading"><span>03 · THE ATMOSPHERE</span><h1>Give the feeling<br /><em>a place to live.</em></h1><p>One palette ties every detail into a world that feels intentional.</p></div>
                  <div className="atmosphere-grid">{(Object.keys(themeMeta) as GreetingTheme[]).map((theme) => <button key={theme} onClick={() => update("theme", theme)} className={`${theme} ${greeting.theme === theme ? "selected" : ""}`}><span><Moon /></span><div><strong>{themeMeta[theme].name}</strong><small>{themeMeta[theme].mood}</small></div><i>{greeting.theme === theme && <Check />}</i></button>)}</div>
                  <AudioStudioControl
                    greeting={greeting}
                    setDetail={setDetail}
                    setAudioDetails={setAudioDetails}
                  />
                  <button className="panel-next publish-next" onClick={() => setPublishOpen(true)}><Gift /> Finish this world</button>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </section>

        <section className={`studio-canvas theme-${greeting.theme}`}>
          <div className="canvas-toolbar"><span><i /> LIVE PREVIEW</span><div><button aria-label="Restart preview"><RotateCcw /></button><span>Receiver view</span></div></div>
          <div className="studio-stars" />
          <div className="canvas-moon" />
          <LiveCard greeting={greeting} />
          <div className="canvas-audio">
            {greeting.details?.audioUrl ? (
              <PinkAudioPlayer
                url={greeting.details.audioUrl}
                name={greeting.details.audioName || "Soundtrack"}
                duration={greeting.details.audioDuration}
                compact
              />
            ) : (
              <>
                <Music2 />
                <div>
                  <strong>no audio attached</strong>
                  <small>{themeMeta[greeting.theme].name}</small>
                </div>
                <span>—</span>
              </>
            )}
          </div>
          <p className="canvas-note"><Sparkles /> This is how the heart of your message will appear.</p>
        </section>
      </div>

      <AnimatePresence>{publishOpen && <PublishDialog greeting={greeting} shareUrl={shareUrl} copied={copied} onCopy={copyLink} onClose={() => setPublishOpen(false)} />}</AnimatePresence>
    </main>
  );
}

function LiveCard({ greeting }: { greeting: GreetingData }) {
  if (greeting.format === "receipt") return <div className="live-card receipt-card"><div className="receipt-logo"><Sparkles /> WISHVERSE</div><p>MEMORY RECEIPT · {greeting.occasion.toUpperCase()}</p><h3>For {greeting.recipient}</h3>{greeting.memories.map((item, i) => <div className="receipt-line" key={i}><span>{item}</span><i>{i + 1}</i></div>)}<div className="receipt-total"><span>TOTAL LOVE</span><b>∞</b></div><small>{greeting.signoff}</small><div className="barcode">|||| || ||| | |||| | |</div></div>;
  if (greeting.format === "envelope") return <div className="live-envelope"><div className="envelope-stamp"><Sparkles /></div><span>DELIVER TO</span><h3>{greeting.recipient}</h3><p>Somewhere very special<br />in this little universe</p><small>from {greeting.sender}</small><i /></div>;
  if (greeting.format === "postcard") return <div className="live-card postcard-card"><div className="postcard-image"><Moon /><span>Wish you were here</span></div><div className="postcard-copy"><p>{greeting.message.slice(0, 115)}{greeting.message.length > 115 ? "…" : ""}</p><strong>For {greeting.recipient}</strong><div className="postcard-stamp"><Sparkles /></div></div></div>;
  if (greeting.format === "chat") return <div className="chat-card"><div className="chat-head"><span>{greeting.recipient.slice(0, 1)}</span><div><strong>{greeting.recipient}</strong><small>somewhere in the WishVerse</small></div></div><div className="bubble incoming">hey, something arrived for you ✦</div><div className="bubble outgoing">what is it?</div><div className="bubble incoming">a reminder that you are deeply loved.</div><small className="typing">•••</small></div>;
  if (greeting.format === "memory") return <div className="live-card memory-note-card"><span>✦ for {greeting.recipient} ✦</span><h3>{greeting.title}</h3><p>{greeting.message.slice(0, 180)}{greeting.message.length > 180 ? "…" : ""}</p><small>{greeting.signoff} ♡</small><i className="tape" /></div>;
  return <div className="live-card typewriter-card"><div className="paper-pin" /><span>A NOTE FOR {greeting.recipient.toUpperCase()}</span><h3>{greeting.title}</h3><p>{greeting.message.slice(0, 185)}{greeting.message.length > 185 ? "…" : ""}<i className="type-cursor" /></p><small>— {greeting.signoff}</small><div className="typewriter-keys">{Array.from({ length: 22 }).map((_, i) => <i key={i} />)}</div></div>;
}

function PublishDialog({ greeting, shareUrl, copied, onCopy, onClose }: { greeting: GreetingData; shareUrl: string; copied: boolean; onCopy: () => void; onClose: () => void }) {
  return <motion.div className="publish-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div className="publish-dialog" initial={{ opacity: 0, scale: .94, y: 22 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .95 }} transition={{ type: "spring", stiffness: 280, damping: 25 }}><button className="publish-close" onClick={onClose}><X /></button><span className="publish-spark"><Sparkles /></span><div className="publish-kicker">YOUR WORLD IS READY</div><h2>Send a little universe<br />to <em>{greeting.recipient}.</em></h2><p>This link contains the experience you made. Anyone you share it with can open it—no account needed.</p><div className="share-link"><Link2 /><span>{shareUrl.replace(/^https?:\/\//, "").slice(0, 46)}…</span><button onClick={onCopy}>{copied ? <><Check /> Copied</> : <><Copy /> Copy link</>}</button></div><div className="publish-actions"><a href={shareUrl} target="_blank" rel="noreferrer"><Eye /> Open receiver view</a>{typeof navigator !== "undefined" && "share" in navigator && <button onClick={() => navigator.share({ title: `A WishVerse for ${greeting.recipient}`, url: shareUrl })}><Send /> Share</button>}</div><div className="privacy-note"><Check /> Private by default <i /> <Check /> No sign-in needed <i /> <Check /> Works on any device</div></motion.div></motion.div>;
}
