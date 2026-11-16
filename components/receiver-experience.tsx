"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CakeSlice,
  CalendarHeart,
  Camera,
  Candy,
  Check,
  Coffee,
  Copy,
  Disc3,
  Film,
  Flower2,
  Gift,
  GlassWater,
  Heart,
  MailOpen,
  MapPin,
  Moon,
  Music2,
  Pause,
  Play,
  RotateCcw,
  Share2,
  Sparkles,
  Newspaper,
  Puzzle,
  Ticket,
  Video,
  Volume2,
  VolumeX,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ExperienceIcon } from "@/components/experience-icon";
import { decodeGreeting, defaultGreeting, experienceMeta, GreetingData } from "@/lib/greeting";
import { fetchCreationFromServer, getCreationByPublicId, getCreationByRCode } from "@/lib/creation-store";
import { formatAudioTime } from "@/lib/audio";
import { PinkAudioPlayer } from "@/components/pink-audio-player";

type Phase = "arrival" | "message" | "memories" | "final";

export function ReceiverExperience() {
  const [greeting, setGreeting] = useState<GreetingData | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [phase, setPhase] = useState<Phase>("arrival");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    async function loadData() {
      const params = new URLSearchParams(window.location.search);
      const rCodeParam = params.get("r") || params.get("code");
      const queryEncoded = params.get("g");
      const hashEncoded = window.location.hash.startsWith("#d=") ? window.location.hash.slice(3) : "";
      const encoded = queryEncoded || hashEncoded;
      if (encoded) {
        const decoded = decodeGreeting(encoded);
        if (decoded) {
          if (!isCancelled) setGreeting(decoded);
        } else {
          if (!isCancelled) setInvalid(true);
        }
      } else {
        const pathParts = window.location.pathname.split("/").filter(Boolean);
        const publicId = pathParts[0] === "gift" && pathParts[1] ? pathParts[1] : null;
        const stored = (publicId ? (getCreationByPublicId(publicId) || getCreationByRCode(publicId)) : null) || (rCodeParam ? getCreationByRCode(rCodeParam) : null);
        if (stored) {
          if (!isCancelled) setGreeting(stored.greeting);
        } else if (publicId || rCodeParam) {
          const serverCreation = await fetchCreationFromServer(publicId || rCodeParam || "");
          if (isCancelled) return;
          if (serverCreation?.greeting) {
            setGreeting(serverCreation.greeting);
          } else if (window.location.pathname.startsWith("/gift/")) {
            setInvalid(true);
          } else {
            setGreeting(defaultGreeting);
          }
        } else if (window.location.pathname.startsWith("/gift/")) {
          if (!isCancelled) setInvalid(true);
        } else {
          if (!isCancelled) setGreeting(defaultGreeting);
        }
      }
      const previewPhase = params.get("preview");
      if (previewPhase === "arrival" || previewPhase === "message" || previewPhase === "memories" || previewPhase === "final") {
        if (!isCancelled) setPhase(previewPhase);
      }
    }
    loadData();
    return () => {
      isCancelled = true;
    };
  }, []);

  const copy = async () => {
    await navigator.clipboard.writeText(receiverShareUrl());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  if (invalid) return <main className="invalid-world"><Sparkles /><h1>This little world got lost.</h1><p>The link may be incomplete. Ask its creator to share it again.</p><Link href="/">Visit WishVerse</Link></main>;
  if (!greeting) return <main className="world-loading"><Sparkles /><span>Gathering stardust…</span></main>;
  const audioUrl = safeReceiverUrl(greeting.details?.audioUrl);
  const audioName = greeting.details?.audioName || "Soundtrack";

  return (
    <main className={`receiver-world receiver-${greeting.theme} phase-${phase}`}>
      <div className="receiver-stars">{Array.from({ length: 38 }).map((_, i) => <i key={i} style={{ "--n": i, "--star-x": `${(i * 47) % 97}%`, "--star-y": `${(i * 73) % 88}%`, "--star-size": `${5 + (i % 3) * 2}px`, "--star-duration": `${2.5 + (i % 5) * .5}s` } as React.CSSProperties} />)}</div>
      <div className="receiver-moon" />
      <div className="world-haze h1" /><div className="world-haze h2" />
      <header className="receiver-header">
        <Link href="/" className="receiver-brand"><Sparkles /> WishVerse</Link>
        {audioUrl && (
          <PinkAudioPlayer
            url={audioUrl}
            name={audioName}
            duration={greeting.details?.audioDuration}
            compact
            className="receiver-header-player"
          />
        )}
      </header>

      <AnimatePresence mode="wait" initial={false}>
        {phase === "arrival" && (
          <Arrival
            greeting={greeting}
            audioUrl={audioUrl}
            audioName={audioName}
            onOpen={() => setPhase("message")}
          />
        )}
        {phase === "message" && <MessageReveal greeting={greeting} onNext={() => setPhase("memories")} />}
        {phase === "memories" && <MemoryReveal greeting={greeting} onNext={() => setPhase("final")} />}
        {phase === "final" && (
          <FinalReveal
            greeting={greeting}
            audioUrl={audioUrl}
            audioName={audioName}
            onReplay={() => setPhase("arrival")}
            onCopy={copy}
            copied={copied}
          />
        )}
      </AnimatePresence>

      <div className="receiver-progress"><span className={phase !== "arrival" ? "done" : "active"} /><span className={phase === "message" ? "active" : phase === "memories" || phase === "final" ? "done" : ""} /><span className={phase === "memories" ? "active" : phase === "final" ? "done" : ""} /><span className={phase === "final" ? "active" : ""} /></div>
    </main>
  );
}

function Frame({ children, name }: { children: React.ReactNode; name: string }) {
  return <motion.section className={`receiver-frame receiver-frame-${name}`} key={name} initial={{ opacity: 0, scale: .97, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 1.03, filter: "blur(8px)" }} transition={{ duration: .75, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.section>;
}

function Arrival({
  greeting,
  audioUrl,
  audioName,
  onOpen,
}: {
  greeting: GreetingData;
  audioUrl?: string;
  audioName?: string;
  onOpen: () => void;
}) {
  return (
    <Frame name="arrival">
      <div className="arrival-copy">
        <div className="arrival-kicker">
          <Sparkles /> {experienceMeta[greeting.experience].shortName.toUpperCase()} FOUND ITS WAY TO YOU
        </div>
        <h1>
          Something was made<br />
          for <em>{greeting.recipient}.</em>
        </h1>
        <p>{experienceMeta[greeting.experience].kicker}.</p>
      </div>

      <button
        className={`arrival-experience arrival-${greeting.experience}`}
        onClick={onOpen}
        aria-label={`Open your ${experienceMeta[greeting.experience].name}`}
      >
        <span>
          <ExperienceIcon experience={greeting.experience} />
          <i>✦</i>
        </span>
        <small>
          <Sparkles /> Tap to open
        </small>
      </button>

      {audioUrl && (
        <div className="arrival-soundtrack-box">
          <div className="arrival-soundtrack-label">
            <Music2 />
            <span>Soundtrack for {greeting.recipient}</span>
          </div>
          <PinkAudioPlayer
            url={audioUrl}
            name={audioName}
            duration={greeting.details?.audioDuration}
          />
        </div>
      )}

      <div className="arrival-from">
        sent with care by <span>{greeting.sender}</span>
      </div>
    </Frame>
  );
}

function MessageReveal({ greeting, onNext }: { greeting: GreetingData; onNext: () => void }) {
  const [typed, setTyped] = useState("");
  useEffect(() => {
    if (greeting.format !== "typewriter") return;
    setTyped("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(greeting.message.slice(0, index));
      if (index >= greeting.message.length) window.clearInterval(timer);
    }, 24);
    return () => window.clearInterval(timer);
  }, [greeting.format, greeting.message]);

  return <Frame name="message"><div className="receiver-stage-kicker"><span>01</span> {experienceMeta[greeting.experience].shortName.toUpperCase()} FOR YOU</div><div className={`receiver-scene receiver-scene-${greeting.experience}`}><ExperienceMessage greeting={greeting} typed={typed} /></div><button className="receiver-next" onClick={onNext}>There&apos;s more <ArrowRight /></button></Frame>;
}

function ExperienceMessage({ greeting, typed }: { greeting: GreetingData; typed: string }) {
  const photos = greeting.media || [];
  if (greeting.experience === "film") return <ReceiverFilm greeting={greeting} />;
  if (greeting.experience === "birthday") return <ReceiverBirthday greeting={greeting} />;
  if (greeting.experience === "chocolate") return <ReceiverChocolate greeting={greeting} />;
  if (greeting.experience === "playlist") return <ReceiverPlaylist greeting={greeting} />;
  if (greeting.experience === "video") return <ReceiverVideo greeting={greeting} />;
  if (greeting.experience === "jar") return <ReceiverJar greeting={greeting} />;
  if (greeting.experience === "coupons") return <ReceiverCoupons greeting={greeting} />;
  if (greeting.experience === "promise") return <ReceiverPromise greeting={greeting} />;
  if (greeting.experience === "puzzle") return <ReceiverPuzzle greeting={greeting} />;
  if (greeting.experience === "timeline") return <ReceiverTimeline greeting={greeting} />;
  if (greeting.experience === "custom") return <ReceiverCustom greeting={greeting} />;
  if (greeting.experience === "letters") return <ReceiverOpenWhen greeting={greeting} />;
  if (greeting.experience === "gift") return <ReceiverGift greeting={greeting} />;
  if (greeting.experience === "coffee") return <ReceiverCoffee greeting={greeting} />;
  if (greeting.experience === "book") return <ReceiverBook greeting={greeting} />;
  if (greeting.experience === "typewriter") return <ReceiverLetter greeting={greeting} />;
  if (greeting.experience === "camera") return <div className={`recv-photobooth filter-${(greeting.details?.filter || "warm").replaceAll(" ", "-")}`}><header><Camera /><span>WISHVERSE PHOTO BOOTH</span><i>REC</i></header><div className="recv-booth-grid">{[0, 1, 2, 3].map((i) => <motion.figure key={i} initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * .12 }}>{photos[i] ? <img src={photos[i]} alt={`Memory ${i + 1}`} /> : <Camera />}<figcaption>{greeting.memories[i] || "one to remember"}</figcaption></motion.figure>)}</div><footer>for {greeting.recipient} · from {greeting.sender}</footer></div>;
  if (greeting.experience === "flowers") {
    const flowers = (greeting.details?.flowers || "tulip,daisy,lavender").split(",").filter(isReceiverFlower).slice(0, 5);
    return <div className="recv-bouquet"><div>{flowers.map((flower, i) => <motion.span className={`recv-flower real-recv-flower flower-${flower}`} key={`${flower}-${i}`} initial={{ scale: 0, y: 80, rotate: -15 }} animate={{ scale: 1, y: 0, rotate: (i - 2) * 8 }} transition={{ type: "spring", delay: i * .13 }}><img src={`/images/experiences/flower-${flower}.webp`} alt={`${flower} bloom`} /></motion.span>)}<b /></div><section><small>A BOUQUET FOR</small><h2>{greeting.recipient}</h2><p>{greeting.message}</p><em>{greeting.signoff}</em></section></div>;
  }
  if (greeting.experience === "newspaper") return <div className="recv-newspaper"><header><h2>{greeting.details?.publication || "The Daily Wish"}</h2><span>{greeting.details?.date || "Special edition"} · PRICE: ONE HUG</span></header><h1>{greeting.title}</h1><div><figure>{photos[0] ? <img src={photos[0]} alt="Today’s featured person" /> : <Newspaper />}<figcaption>Today&apos;s most important person</figcaption></figure><p>{greeting.message}</p></div><footer>{greeting.memories.join("  •  ")}</footer></div>;
  if (greeting.experience === "place") return <div className="recv-map"><span className="recv-map-tape" /><h2>{greeting.details?.mapTitle || greeting.title}</h2><div><svg viewBox="0 0 600 280"><path d="M20 215C115 100 170 270 265 155S430 40 575 105" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="9 12" /></svg>{greeting.memories.slice(0, 4).map((place, i) => <motion.span key={i} style={{ "--map-i": i } as React.CSSProperties} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: i * .16 }}><MapPin fill="currentColor" /><small>{place}</small></motion.span>)}<figure>{photos[0] ? <img src={photos[0]} alt="A favorite place" /> : <Camera />}</figure></div><p>{greeting.message}</p></div>;
  if (greeting.experience === "scrapbook") return <div className="recv-scrapbook"><i /><h2>{greeting.title}</h2><div>{[0, 1, 2].map((i) => <motion.figure key={i} initial={{ y: 20, rotate: 0, opacity: 0 }} animate={{ y: 0, rotate: i === 1 ? 4 : -3, opacity: 1 }} transition={{ delay: i * .14 }}>{photos[i] ? <img src={photos[i]} alt={`Scrapbook memory ${i + 1}`} /> : <Heart fill="currentColor" />}<figcaption>{greeting.memories[i] || "a little thing to keep"}</figcaption></motion.figure>)}</div><p>{greeting.message}</p><small>made by {greeting.sender} ♡</small></div>;
  if (greeting.format === "receipt") return <div className="exp-receipt"><div><Sparkles /> WISHVERSE MEMORY CO.</div><span>ORDER FOR: {greeting.recipient.toUpperCase()}</span><h2>{greeting.title}</h2>{greeting.memories.map((memory, i) => <motion.p key={memory} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .3 + i * .25 }}><b>{String(i + 1).padStart(2, "0")}</b>{memory}<i>♡</i></motion.p>)}<section><span>TOTAL</span><strong>ENDLESS</strong></section><small>{greeting.signoff}</small></div>;
  if (greeting.format === "envelope") return <motion.button className="exp-letter" initial={{ rotate: -2 }} animate={{ rotate: 0 }}><div className="letter-fold"><MailOpen /></div><span>Dear {greeting.recipient},</span><h2>{greeting.title}</h2><p>{greeting.message}</p><small>{greeting.signoff},<br />{greeting.sender}</small></motion.button>;
  if (greeting.format === "postcard") return <div className="exp-postcard"><div className="exp-postcard-scene"><Moon /><span>Greetings from our memories</span></div><div><span>POST CARD</span><p>{greeting.message}</p><strong>With love,<br />{greeting.sender}</strong><i><Sparkles /></i></div></div>;
  if (greeting.format === "chat") return <div className="exp-chat"><div className="exp-chat-head"><span>{greeting.recipient[0]}</span><div><strong>{greeting.recipient}</strong><small>online in your universe</small></div></div><motion.p className="chat-in" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>Hey, I needed to tell you something…</motion.p><motion.p className="chat-in" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .7 }}>{greeting.message}</motion.p><motion.p className="chat-out" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }}>I&apos;m keeping this forever ♡</motion.p></div>;
  if (greeting.format === "memory") return <div className="exp-memory-note"><i className="note-tape" /><span>for {greeting.recipient} · with love</span><h2>{greeting.title}</h2><p>{greeting.message}</p><small>— {greeting.signoff}</small><div className="note-doodle">♡</div></div>;
  return <div className="exp-typewriter"><div className="typewriter-paper"><span>FOR {greeting.recipient.toUpperCase()}</span><h2>{greeting.title}</h2><p>{typed}<i /></p><small>— {greeting.signoff}</small></div><div className="typewriter-machine"><div>{Array.from({ length: 30 }).map((_, i) => <i key={i} />)}</div></div></div>;
}

function ReceiverFilm({ greeting }: { greeting: GreetingData }) {
  const [playing, setPlaying] = useState(false); const [scene, setScene] = useState(0); const count = Math.max(greeting.memories.length, 1);
  useEffect(() => { if (!playing) return; const timer = window.setInterval(() => setScene((current) => (current + 1) % count), 2400); return () => window.clearInterval(timer) }, [count, playing]);
  return <div className={`recv-film ${playing ? "playing" : ""}`}><header><Film /><span>WISHVERSE MEMORY FILM</span><i>{playing ? "● PLAYING" : "READY"}</i></header><div className="recv-film-screen"><AnimatePresence mode="wait"><motion.figure key={scene} initial={{ opacity: 0, scale: 1.07 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>{greeting.media?.[scene] ? <img src={greeting.media[scene]} alt={`Memory film scene ${scene + 1}`} /> : <Film />}<figcaption><small>SCENE {scene + 1} OF {count}</small>{greeting.memories[scene] || "A moment worth replaying"}</figcaption></motion.figure></AnimatePresence></div><footer><button onClick={() => setPlaying(!playing)}>{playing ? <Pause /> : <Play />}{playing ? "Pause" : "Play the film"}</button><div>{Array.from({ length: count }).map((_, i) => <button aria-label={`Go to scene ${i + 1}`} className={scene === i ? "active" : ""} onClick={() => setScene(i)} key={i} />)}</div></footer></div>
}

function ReceiverBirthday({ greeting }: { greeting: GreetingData }) {
  const [wished, setWished] = useState(false); const candles = Math.min(9, Math.max(1, Number(greeting.details?.candles || 3)));
  return <div className={`recv-birthday ${wished ? "wished" : ""}`}><div className="recv-balloons">{Array.from({ length: 8 }).map((_, i) => <i key={i} style={{ "--b": i, "--balloon-x": `${2 + i * 12}%`, "--balloon-y": `${3 + (i % 3) * 8}%` } as React.CSSProperties} />)}</div><small>{wished ? "YOUR WISH IS ON ITS WAY" : "CLOSE YOUR EYES, " + greeting.recipient.toUpperCase()}</small><h2>{wished ? `Happy Birthday, ${greeting.recipient}!` : "Make a wish"}</h2><button className={`recv-cake cake-${greeting.details?.cake?.replaceAll(" ", "-")}`} onClick={() => setWished(!wished)}><span>{Array.from({ length: candles }).map((_, i) => <i key={i} />)}</span><b>{greeting.details?.cakeName || greeting.recipient}</b><em>{wished ? "relight candles" : "tap to blow"}</em></button>{wished && <><div className="recv-confetti">{Array.from({ length: 32 }).map((_, i) => <i key={i} style={{ "--c": i, "--confetti-x": `${(i * 37) % 100}%`, "--confetti-y": `${(i * 53) % 85}%` } as React.CSSProperties} />)}</div><p>{greeting.message}</p></>}</div>
}

function ReceiverChocolate({ greeting }: { greeting: GreetingData }) {
  const [opened, setOpened] = useState<number[]>([]); const total = Math.max(6, greeting.memories.length); const open = (i: number) => setOpened((current) => current.includes(i) ? current : [...current, i]);
  return <div className="recv-chocolate"><header><Candy /><div><small>A SWEET LITTLE BOX FOR</small><h2>{greeting.recipient}</h2></div><span>{opened.length}/{total} opened</span></header><div>{Array.from({ length: total }).slice(0, 12).map((_, i) => <button className={opened.includes(i) ? "opened" : ""} onClick={() => open(i)} key={i}><i /><span>{opened.includes(i) ? (greeting.memories[i] || "You make life sweeter") : "pick me"}</span></button>)}</div><p>{opened.length === total ? greeting.message : "Each chocolate is keeping a tiny secret."}</p></div>
}

function ReceiverPlaylist({ greeting }: { greeting: GreetingData }) {
  const [spinning, setSpinning] = useState(false); const url = safeReceiverUrl(greeting.details?.songUrl); const directAudio = url && /\.(mp3|wav|ogg|m4a)(\?.*)?$/i.test(url);
  return <div className={`recv-playlist ${spinning ? "spinning" : ""}`}><div className="recv-player"><div className="recv-vinyl"><i /><b /></div><span /><button onClick={() => setSpinning(!spinning)}><Disc3 />{spinning ? "Stop record" : "Spin record"}</button></div><article><small>THIS SONG ALWAYS REMINDS ME OF YOU</small><h2>{greeting.details?.song || greeting.title}</h2><span>{greeting.details?.artist}</span><p>{greeting.details?.reason || greeting.message}</p>{directAudio ? <audio controls preload="none" src={url} /> : url ? <a href={url} target="_blank" rel="noreferrer"><Play /> Open the song</a> : <em>{greeting.signoff}</em>}</article></div>
}

function ReceiverVideo({ greeting }: { greeting: GreetingData }) {
  const [watched, setWatched] = useState(false); const url = safeReceiverUrl(greeting.details?.videoUrl); const playable = url && /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
  return <div className="recv-video"><div className="recv-video-screen">{playable ? <video controls preload="metadata" poster={greeting.media?.[0]} src={url} onEnded={() => setWatched(true)} /> : greeting.media?.[0] ? <img src={greeting.media[0]} alt="Video message cover" /> : <Video />}<span>PERSONAL VIDEO · FOR {greeting.recipient.toUpperCase()}</span>{url && !playable && <a href={url} target="_blank" rel="noreferrer" onClick={() => setWatched(true)}><Play /> Watch hosted video</a>}</div><article><small>{watched ? "ONE LAST NOTE" : "BEFORE YOU PRESS PLAY"}</small><h2>{watched ? greeting.title : greeting.details?.intro}</h2><p>{watched ? greeting.message : "Take your time. This was recorded especially for you."}</p>{!url && <em>The sender’s video link is unavailable.</em>}</article></div>
}

function ReceiverJar({ greeting }: { greeting: GreetingData }) {
  const [note, setNote] = useState(-1); const next = () => setNote((current) => (current + 1) % Math.max(greeting.memories.length, 1));
  return <div className="recv-jar"><button onClick={next}><span /><GlassWater />{greeting.memories.map((_, i) => <i key={i} style={{ "--j": i, "--jar-x": `${14 + (i % 3) * 28}%`, "--jar-y": `${10 + (i % 4) * 18}%` } as React.CSSProperties} />)}<small>pull a note</small></button><AnimatePresence mode="wait">{note >= 0 && <motion.article key={note} initial={{ opacity: 0, y: 60, rotate: -7 }} animate={{ opacity: 1, y: 0, rotate: 2 }} exit={{ opacity: 0, y: -25 }}><span>LITTLE TRUTH {note + 1}</span><p>{greeting.memories[note]}</p><small>keep this one ♡</small></motion.article>}</AnimatePresence></div>
}

function ReceiverCoupons({ greeting }: { greeting: GreetingData }) {
  const [active, setActive] = useState(0); const [redeemed, setRedeemed] = useState<number[]>([]); const redeem = () => { if (window.confirm(`Mark “${greeting.memories[active]}” as redeemed?`)) setRedeemed((current) => current.includes(active) ? current : [...current, active]) };
  const coupons = greeting.memories.slice(0, 5);
  return <div className="recv-coupons"><header><Ticket /><div><small>A POCKET OF FUTURE PLANS</small><h2>{greeting.title}</h2></div></header><div>{coupons.map((coupon, i) => <button className={`${active === i ? "active" : ""} ${redeemed.includes(i) ? "redeemed" : ""}`} onClick={() => setActive(i)} key={i} style={{ "--ticket-top": `${i * 38}px`, "--mobile-ticket-top": `${180 + (i < active ? i : i - 1) * 42}px` } as React.CSSProperties}><span>WISHVERSE COUPON</span><h3>{coupon}</h3><small>{redeemed.includes(i) ? "REDEEMED WITH LOVE" : "TAP TO SELECT"}</small></button>)}</div><button className="redeem-button" onClick={redeem} disabled={redeemed.includes(active)}>{redeemed.includes(active) ? <Check /> : <Ticket />}{redeemed.includes(active) ? "Already redeemed" : "Redeem selected coupon"}</button></div>
}

function ReceiverPromise({ greeting }: { greeting: GreetingData }) {
  const [accepted, setAccepted] = useState(false);
  return <div className={`recv-promise ${accepted ? "accepted" : ""}`}><aside><CalendarHeart /><span>SAVE<br />THE<br />DATE</span></aside><article><small>ADMIT TWO · A FUTURE PLAN</small><h2>{accepted ? "It’s a date!" : greeting.details?.activity || greeting.title}</h2><div><span>WHEN<b>{receiverDate(greeting.details?.date)} {greeting.details?.time}</b></span><span>WHERE<b>{greeting.details?.place || "Somewhere we love"}</b></span></div><p>{accepted ? greeting.message : "There is a small adventure waiting, if you’d like to join."}</p><button onClick={() => setAccepted(true)} disabled={accepted}>{accepted ? <Check /> : <Heart />}{accepted ? "Saved with a smile" : "Accept the date"}</button></article></div>
}

function ReceiverPuzzle({ greeting }: { greeting: GreetingData }) {
  const [flipped, setFlipped] = useState<number[]>([]); const clues = greeting.memories.slice(0, 3); const flip = (i: number) => setFlipped((current) => current.includes(i) ? current : [...current, i]);
  return <div className="recv-puzzle"><small>THREE TINY CLUES ARE HIDING SOMETHING</small><div>{clues.map((clue, i) => <button className={flipped.includes(i) ? "flipped" : ""} onClick={() => flip(i)} key={i}><span><Puzzle /></span><i>{clue}</i></button>)}</div><AnimatePresence>{flipped.length >= clues.length && <motion.article initial={{ scale: .75, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><Heart fill="currentColor" /><h2>{greeting.title}</h2><p>{greeting.message}</p></motion.article>}</AnimatePresence></div>
}

function ReceiverTimeline({ greeting }: { greeting: GreetingData }) {
  const [active, setActive] = useState(0); return <div className="recv-timeline"><header><small>FOLLOW THE LITTLE TRAIL</small><h2>{greeting.title}</h2></header><nav aria-label="Memory milestones">{greeting.memories.map((memory, i) => <button aria-label={`Open milestone ${i + 1}: ${memory}`} className={active === i ? "active" : ""} onClick={() => setActive(i)} key={i}><i /><span>{memory.split("—")[0]}</span></button>)}</nav><AnimatePresence mode="wait"><motion.article key={active} initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -25 }}>{greeting.media?.[active] ? <img src={greeting.media[active]} alt={`Milestone ${active + 1}`} /> : <div><MapPin /><Heart /></div>}<section><small>MILESTONE {active + 1} OF {greeting.memories.length}</small><h3>{greeting.memories[active]?.split("—").slice(1).join("—") || greeting.memories[active]}</h3><p>{greeting.message}</p></section></motion.article></AnimatePresence></div>
}

function ReceiverCustom({ greeting }: { greeting: GreetingData }) {
  const [secret, setSecret] = useState(false); return <div className={`recv-custom custom-${greeting.details?.canvas?.replaceAll(" ", "-")}`}><i /><small>MADE FROM SCRATCH FOR {greeting.recipient.toUpperCase()}</small><div>{greeting.memories.map((block, i) => { const [kind, ...parts] = block.includes("::") ? block.split("::") : ["text", block]; const text = parts.join("::"); if (kind === "heading") return <h2 key={i}>{text}</h2>; if (kind === "quote") return <blockquote key={i}>“{text}”</blockquote>; if (kind === "secret") return <button key={i} onClick={() => setSecret(!secret)}><Gift />{secret ? text : "Tap for the secret"}</button>; return <p key={i}>{text}</p> })}{greeting.media?.[0] && <figure><img src={greeting.media[0]} alt="A custom WishVerse memory" /><figcaption>one thing worth keeping</figcaption></figure>}</div><em>— {greeting.signoff}</em></div>
}

function ReceiverOpenWhen({ greeting }: { greeting: GreetingData }) {
  const [active, setActive] = useState(-1); return <div className="recv-open-when"><div>{greeting.memories.map((title, i) => <button className={active === i ? "active" : ""} onClick={() => setActive(i)} key={i} style={{ "--letter": i } as React.CSSProperties}><MailOpen /><span>{title}</span><small>{active === i ? "OPENED" : "SEALED"}</small></button>)}</div><AnimatePresence mode="wait"><motion.article key={active} initial={{ opacity: 0, y: 20, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: 1 }}>{active < 0 ? <><MailOpen /><h2>Choose an envelope</h2><p>There is one here for every kind of day.</p></> : <><small>DEAR {greeting.recipient.toUpperCase()}</small><h2>{greeting.memories[active]}</h2><p>{greeting.details?.[`letter${active}`] || greeting.message}</p><em>— {greeting.signoff}</em></>}</motion.article></AnimatePresence></div>
}

function ReceiverGift({ greeting }: { greeting: GreetingData }) {
  const [layer, setLayer] = useState(0); const open = layer > 0; const next = () => setLayer((current) => current >= greeting.memories.length ? 0 : current + 1);
  return <div className="recv-unbox"><button className={open ? "open" : ""} onClick={next}><span /><i><b /></i><small>{open ? "unwrap the next layer" : "tap / shake to open"}</small></button><AnimatePresence mode="wait">{open && <motion.article key={layer} initial={{ opacity: 0, y: 35, scale: .8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -25 }}><small>SURPRISE {layer} OF {greeting.memories.length}</small><h2>{greeting.memories[layer - 1]}</h2><p>{layer === greeting.memories.length ? greeting.message : "There is another little thing underneath."}</p><Gift /></motion.article>}</AnimatePresence></div>
}

function ReceiverCoffee({ greeting }: { greeting: GreetingData }) {
  const [accepted, setAccepted] = useState(false); return <div className={`recv-coffee ${accepted ? "accepted" : ""}`}><div className="recv-cafe-awning">{greeting.details?.cafe || "Our Little Corner"}<small>{greeting.details?.vibe || "TABLE FOR TWO"}</small></div><div className="recv-coffee-table"><div className="recv-cup"><Coffee /><i /><i /><b>{greeting.details?.drink}</b></div><article><span>{accepted ? "IT’S A DATE" : "INVITATION FOR " + greeting.recipient.toUpperCase()}</span><h2>{accepted ? "Coffee, you & me." : greeting.title}</h2><p>{accepted ? greeting.message : `${receiverDate(greeting.details?.date)} · ${greeting.details?.time || "a time we choose"} · ${greeting.details?.cafe}`}</p><button onClick={() => setAccepted(true)} disabled={accepted}>{accepted ? <Check /> : <Coffee />}{accepted ? "Accepted" : "Accept the date"}</button><small>{greeting.signoff}</small></article></div></div>
}

function ReceiverBook({ greeting }: { greeting: GreetingData }) {
  const [page, setPage] = useState(0); const count = Math.max(greeting.memories.length, 1); return <div className="recv-book interactive"><aside><BookOpen /><small>{greeting.details?.dedication}</small></aside><section><button aria-label="Previous chapter" onClick={() => setPage((page - 1 + count) % count)}><ArrowRight /></button><span>CHAPTER {page + 1} OF {count}</span><h2>{greeting.memories[page] || "Our story"}</h2>{greeting.media?.[page] ? <img src={greeting.media[page]} alt={`Chapter ${page + 1}`} /> : <Heart />}<p>{greeting.message}</p><small>— {greeting.signoff}</small><button aria-label="Next chapter" onClick={() => setPage((page + 1) % count)}><ArrowRight /></button></section></div>
}

function ReceiverLetter({ greeting }: { greeting: GreetingData }) {
  const [opened, setOpened] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<number | null>(null);

  const speedMap: Record<string, number> = { slow: 65, gentle: 32, quick: 16 };
  const speed = speedMap[greeting.details?.speed || "gentle"] || 32;

  const clearActiveTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearActiveTimer();
  }, []);

  const runTypingLoop = () => {
    clearActiveTimer();
    setDisplayedText("");
    setIsTyping(true);
    let idx = 0;
    timerRef.current = window.setInterval(() => {
      idx += 1;
      setDisplayedText(greeting.message.slice(0, idx));
      if (idx >= greeting.message.length) {
        clearActiveTimer();
        setIsTyping(false);
      }
    }, speed);
  };

  const startTyping = () => {
    setOpened(true);
    window.setTimeout(() => {
      runTypingLoop();
    }, 450);
  };

  const replay = () => {
    runTypingLoop();
  };

  const showAll = () => {
    clearActiveTimer();
    setDisplayedText(greeting.message);
    setIsTyping(false);
  };

  const paperClass = `paper-${(greeting.details?.paper || "handwritten cream").replaceAll(" ", "-")}`;
  const inkClass = `ink-${(greeting.details?.ink || "chocolate").replaceAll(" ", "-")}`;

  return (
    <div className={`recv-letter-reveal ${opened ? "opened" : ""}`}>
      <button className="recv-envelope" onClick={startTyping} aria-label="Open the envelope" disabled={opened}>
        <div className="envelope-stamp"><MailOpen /></div>
        <span>You&apos;ve received a letter.</span>
        <small>tap to open</small>
      </button>
      <div className={`recv-letter-paper ${paperClass} ${inkClass}`}>
        <div className="recv-letter-header">
          <span>{greeting.details?.date ? receiverDate(greeting.details.date) : `FOR ${greeting.recipient.toUpperCase()}`}</span>
          {opened && (
            <div className="recv-letter-actions">
              {isTyping ? (
                <button type="button" onClick={showAll} title="Skip typing animation">Skip typing</button>
              ) : (
                <button type="button" onClick={replay} title="Watch typing animation again"><RotateCcw /> Replay</button>
              )}
            </div>
          )}
        </div>
        <h2>{greeting.title}</h2>
        <p>
          {opened ? displayedText : greeting.message}
          <i className="type-cursor" />
        </p>
        <small>— {greeting.signoff}<br />{greeting.sender}</small>
        {greeting.memories && greeting.memories.filter(Boolean).length > 0 && (
          <div className="recv-margin-notes">
            {greeting.memories.filter(Boolean).map((note, i) => (
              <div key={i} className={`recv-margin-note note-${i % 3}`}>
                <span className="recv-pin" />
                <p>{note}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function safeReceiverUrl(value?: string) {
  if (!value) return "";
  if (value.startsWith("data:audio/")) return value;
  if (value.startsWith("/")) return value;
  try {
    const url = new URL(value, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    return (url.protocol === "https:" || url.protocol === "http:" || url.protocol === "data:") ? url.toString() : "";
  } catch {
    return "";
  }
}
function isReceiverFlower(value: string): value is "rose" | "tulip" | "sunflower" | "lily" | "orchid" | "daisy" | "peony" | "lavender" { return ["rose", "tulip", "sunflower", "lily", "orchid", "daisy", "peony", "lavender"].includes(value) }
function receiverDate(value?: string) { if (!value) return "A date we choose"; const date = new Date(`${value}T00:00:00`); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(date) }

function MemoryReveal({ greeting, onNext }: { greeting: GreetingData; onNext: () => void }) {
  const [active, setActive] = useState(0);
  const memories = greeting.memories.length ? greeting.memories : ["Every ordinary moment became special"];
  const nextMemory = () => active < memories.length - 1 ? setActive(active + 1) : onNext();
  return <Frame name="memories"><div className="receiver-stage-kicker"><span>02</span> THE LITTLE THINGS</div><div className="receiver-scene"><div className="memory-orbit"><div className="orbit-line" /><AnimatePresence mode="wait"><motion.button key={active} className={`memory-polaroid memory-${active % 3}`} onClick={nextMemory} initial={{ opacity: 0, scale: .82, rotate: -7 }} animate={{ opacity: 1, scale: 1, rotate: active % 2 ? 4 : -3 }} exit={{ opacity: 0, scale: 1.1, rotate: 8 }} transition={{ type: "spring", stiffness: 190, damping: 18 }}><div>{greeting.media?.[active] ? <img src={greeting.media[active]} alt={`Memory ${active + 1}`} /> : <Heart fill="currentColor" />}</div><span>{String(active + 1).padStart(2, "0")} · A LITTLE THING</span><p>{memories[active]}</p><small>tap for the next one</small></motion.button></AnimatePresence>{memories.map((_, i) => <i key={i} className={i <= active ? "seen" : ""} />)}</div></div><p className="memory-count">{active + 1} of {memories.length} memories</p></Frame>;
}

function FinalReveal({
  greeting,
  onReplay,
  onCopy,
  copied,
  audioUrl,
  audioName,
}: {
  greeting: GreetingData;
  onReplay: () => void;
  onCopy: () => void;
  copied: boolean;
  audioUrl?: string;
  audioName?: string;
}) {
  return (
    <Frame name="final">
      <div className="confetti-field">
        {Array.from({ length: 24 }).map((_, i) => (
          <i
            key={i}
            style={
              {
                "--c": i,
                "--confetti-x": `${(i * 43) % 96}%`,
                "--confetti-duration": `${5 + (i % 4) * 0.8}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <motion.div
        className="final-heart"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", delay: 0.2 }}
      >
        <Heart fill="currentColor" />
      </motion.div>
      <span className="final-for">ONE LAST THING, {greeting.recipient.toUpperCase()}</span>
      <h1>
        You make this world<br />
        <em>more beautiful.</em>
      </h1>
      <p>{greeting.signoff}.</p>

      {audioUrl && (
        <div className="arrival-soundtrack-box" style={{ margin: "14px auto 18px", maxWidth: "340px" }}>
          <PinkAudioPlayer
            url={audioUrl}
            name={audioName}
            duration={greeting.details?.audioDuration}
            compact
          />
        </div>
      )}

      <div className="final-sender">
        Made with a full heart by <strong>{greeting.sender}</strong>
      </div>
      <div className="receiver-final-actions">
        <button onClick={onReplay}>
          <RotateCcw /> Replay
        </button>
        <button onClick={onCopy}>
          {copied ? <Check /> : <Copy />}
          {copied ? "Copied" : "Keep this link"}
        </button>
        {typeof navigator !== "undefined" && "share" in navigator && (
          <button
            onClick={() =>
              navigator.share({
                title: `A WishVerse for ${greeting.recipient}`,
                url: receiverShareUrl(),
              })
            }
          >
            <Share2 /> Share
          </button>
        )}
      </div>
      <Link href="/create" className="make-yours">
        <Sparkles /> Make a WishVerse for someone
      </Link>
    </Frame>
  );
}

function receiverShareUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("preview");
  return url.toString();
}
