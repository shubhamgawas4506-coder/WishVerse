"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BookHeart,
  CakeSlice,
  CalendarHeart,
  Camera,
  Candy,
  Check,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Copy,
  Disc3,
  Eye,
  Film,
  Flower2,
  GlassWater,
  Gift,
  Heart,
  ImagePlus,
  Link2,
  Mail,
  MapPin,
  Music2,
  Newspaper,
  Pause,
  Pencil,
  Play,
  Plus,
  Puzzle,
  QrCode,
  RotateCcw,
  Send,
  Share2,
  Sparkles,
  Star,
  Ticket,
  Trash2,
  Type,
  Upload,
  Video,
  X,
} from "lucide-react";
import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { ExperienceIcon } from "@/components/experience-icon";
import { createOpaqueId, getCreation, getUniqueRCode, saveCreation } from "@/lib/creation-store";
import { defaultGreeting, encodeGreeting, ExperienceKind, experienceMeta, GreetingData } from "@/lib/greeting";
import { AudioStudioControl } from "@/components/audio-studio-control";
import { PinkAudioPlayer } from "@/components/pink-audio-player";

const starterMemories: Record<ExperienceKind, string[]> = {
  letters: ["Open when you miss me", "Open when you need courage", "Open when today feels heavy"],
  scrapbook: ["The day we couldn’t stop laughing", "Our accidental favorite tradition", "A tiny moment I still think about"],
  camera: ["the candid one", "the chaotic one", "the one I would frame forever"],
  flowers: ["Pink tulip — for the joy you bring", "Daisy — for every ordinary adventure", "Lavender — for calm, always"],
  newspaper: ["Breaking: you are deeply appreciated", "Local joy levels reach an all-time high", "More good days expected ahead"],
  book: ["Chapter one: how it started", "Chapter two: the little things", "Next chapter: everything still ahead"],
  coffee: ["Your usual order", "Our corner table", "The conversation that lasted for hours"],
  place: ["Where we first met", "Our favorite quiet corner", "The next place we’ll find together"],
  typewriter: ["The first thing I noticed", "What I hope you never forget", "A promise for the days ahead"],
  gift: ["A compliment you should keep", "A memory to replay", "A wish for your next chapter"],
  film: ["2019 — the beginning", "2022 — the adventure", "Today — still my favourite"],
  birthday: ["A wish for your next chapter", "One thing everyone loves about you", "A memory worth celebrating"],
  chocolate: ["You make ordinary days sweeter", "Remember our completely chaotic adventure?", "Redeem this for one enormous hug"],
  playlist: ["The lyric that sounds like us", "The first time this song found me", "Why I chose it for you"],
  video: ["Before you press play", "The part I hope makes you smile", "One last thing after the video"],
  jar: ["You make people feel seen", "Your laugh fixes more than you know", "You are allowed to be proud of yourself"],
  coupons: ["One coffee date", "One long drive with your playlist", "One no-questions-asked hug"],
  promise: ["The plan", "What to bring", "Why I can’t wait"],
  puzzle: ["A tiny clue", "Something only we understand", "The last little piece"],
  timeline: ["2019 — where it started", "2022 — a favourite chapter", "Today — still choosing this story"],
  custom: ["heading::A little world for you", "quote::The ordinary moments are the ones I keep", "secret::Tap gently: you are deeply loved"],
};

const starters: Record<ExperienceKind, Pick<GreetingData, "title" | "message" | "signoff">> = {
  letters: { title: "For every version of today", message: "Whatever kind of day finds you, there is a little note here to remind you that you never have to carry it alone.", signoff: "Open whenever you need me" },
  scrapbook: { title: "The little things I’d keep", message: "This page is made of ordinary moments that became important simply because you were there.", signoff: "More pages coming soon" },
  camera: { title: "Proof we had the best time", message: "No perfect poses—just the faces, light and laughter I would choose to keep every single time.", signoff: "Say cheese, favorite human" },
  flowers: { title: "A bouquet that never fades", message: "Every flower is carrying a small reason why knowing you makes life softer, brighter and more beautiful.", signoff: "Picked especially for you" },
  newspaper: { title: "LOCAL HUMAN MAKES LIFE BETTER", message: "In a completely unsurprising development, the world has been confirmed to be warmer, funnier and considerably more hopeful whenever you are around.", signoff: "The WishVerse editorial desk" },
  book: { title: "A story I love returning to", message: "Some stories are made from grand adventures. Ours is also made from small jokes, familiar places and all the ways we kept showing up.", signoff: "To be continued, always" },
  coffee: { title: "One more coffee with you", message: "If I could choose a perfect afternoon, it would be a warm cup, the table by the window and nowhere else we needed to be.", signoff: "Your forever coffee date" },
  place: { title: "The places that became ours", message: "A place is only a place until a memory settles into it. Then somehow every road back feels a little like coming home.", signoff: "Meet me there again" },
  typewriter: { title: "A letter worth slowing down for", message: "I wanted every word to arrive slowly enough for you to feel it: you matter, you are remembered, and I am endlessly grateful for you.", signoff: "Typed with a full heart" },
  gift: { title: "A box full of little reasons", message: "This is not one enormous surprise. It is a collection of small truths, good memories and wishes I hope you keep.", signoff: "Wrapped with ridiculous amounts of care" },
  film: { title: "The moments I keep replaying", message: "I saved a few pieces of time that still feel warm whenever I return to them.", signoff: "Roll credits? Never" },
  birthday: { title: "A whole celebration for you", message: "May this year return every bit of joy, kindness and magic you keep giving away.", signoff: "Now make the biggest wish" },
  chocolate: { title: "Something sweet, just because", message: "Every piece is hiding a little reason you make life sweeter.", signoff: "Save the last one for me" },
  playlist: { title: "This song sounds like you", message: "Some songs become places. This one always takes me somewhere that feels a little like us.", signoff: "Play it when you miss this feeling" },
  video: { title: "I wanted you to hear this from me", message: "Press play when you’re ready. There is one last note waiting after the video.", signoff: "Recorded with a very full heart" },
  jar: { title: "A jar for the days you forget", message: "Pull out one small truth at a time and keep it for exactly the day you need it.", signoff: "There are always more reasons" },
  coupons: { title: "A pocket of future plans", message: "These are real little promises, redeemable whenever we both say yes.", signoff: "Terms: bring yourself" },
  promise: { title: "Save this date for us", message: "There is a small adventure waiting in the future, and I would really like you there.", signoff: "See you there" },
  puzzle: { title: "I hid something for you", message: "You found every little piece. The secret is simple: you matter more than you know.", signoff: "Mystery solved ♡" },
  timeline: { title: "How we got all the way here", message: "Take your time and wander through the dates that quietly became part of our story.", signoff: "More milestones ahead" },
  custom: { title: "A tiny world with your name on it", message: "Nothing here came from a template. I put these pieces together because they reminded me of you.", signoff: "Made from scratch" },
};

export function ExperienceMaker({ experience }: { experience: ExperienceKind }) {
  const meta = experienceMeta[experience];
  const [greeting, setGreeting] = useState<GreetingData>({
    ...defaultGreeting,
    ...starters[experience],
    experience,
    format: meta.format,
    theme: meta.theme,
    memories: starterMemories[experience],
    details: defaultDetails(experience),
    media: [],
  });
  const [tab, setTab] = useState<"content" | "magic">("content");
  const [mobileMode, setMobileMode] = useState<"edit" | "preview">("edit");
  const [publishOpen, setPublishOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(true);
  const [baseUrl, setBaseUrl] = useState("");
  const [creationId, setCreationId] = useState("");
  const [publicId, setPublicId] = useState("");
  const [rCode, setRCode] = useState("");
  const [ready, setReady] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
    const requestedId = new URLSearchParams(window.location.search).get("draft");
    const requested = requestedId ? getCreation(requestedId) : null;
    if (requested && requested.greeting.experience === experience) {
      setGreeting(requested.greeting);
      setCreationId(requested.id);
      setPublicId(requested.publicId);
      setRCode(requested.rCode || getUniqueRCode());
    } else {
      setCreationId(createOpaqueId("draft"));
      setPublicId(createOpaqueId("gift"));
      setRCode(getUniqueRCode());
    }
    setReady(true);
  }, [experience]);

  useEffect(() => {
    if (!ready || !creationId || !publicId || !rCode) return;
    setSaved(false);
    const timer = window.setTimeout(() => {
      saveCreation({ id: creationId, publicId, rCode, greeting, name: greeting.title });
      setSaved(true);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [creationId, greeting, publicId, rCode, ready]);

  const update = <K extends keyof GreetingData>(key: K, value: GreetingData[K]) =>
    setGreeting((current) => ({ ...current, [key]: value }));

  const setDetail = (key: string, value: string) =>
    setGreeting((current) => ({
      ...current,
      details: { ...current.details, [key]: value },
    }));

  const setAudioDetails = (audioData: Record<string, string>) =>
    setGreeting((current) => ({
      ...current,
      details: { ...current.details, ...audioData },
    }));

  const setMemory = (index: number, value: string) =>
    update("memories", greeting.memories.map((item, i) => (i === index ? value : item)));
  const addMemory = () => update("memories", [...greeting.memories, "A new little moment"]);
  const shareUrl = useMemo(() => baseUrl && publicId ? `${baseUrl}/gift/${publicId}?r=${rCode}#d=${encodeGreeting(greeting)}` : "", [baseUrl, greeting, publicId, rCode]);
  const previewUrl = useMemo(() => shareUrl.replace("#d=", "?preview=message#d="), [shareUrl]);

  const handlePhotos = async (event: ChangeEvent<HTMLInputElement>) => {
    setUploadError("");
    const maxPhotos = ["film", "timeline", "custom"].includes(experience) ? 12 : 4;
    const candidates = Array.from(event.target.files || []);
    const invalid = candidates.find((file) => !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type) || file.size > 8 * 1024 * 1024);
    if (invalid) { setUploadError("Use JPG, PNG, WebP or GIF images up to 8 MB each."); event.target.value = ""; return; }
    const files = candidates.slice(0, Math.max(0, maxPhotos - (greeting.media?.length || 0)));
    if (!files.length) return;
    try { const compressed = await Promise.all(files.map(compressPhoto)); update("media", [...(greeting.media || []), ...compressed]); }
    catch { setUploadError("One of those images could not be processed. Try another file."); }
    event.target.value = "";
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return <main className={`themed-maker maker-${experience}`}>
    <header className="maker-header">
      <div><Link href="/#experiences" className="maker-back"><ArrowLeft /></Link><Link href="/" className="maker-brand"><span>✿</span> Wish<span>Verse</span></Link><i /><div className="maker-title"><strong>{meta.name}</strong><small>{saved ? <><Check /> saved</> : "saving…"}</small></div></div>
      <div><a href={previewUrl || "#"} target="_blank" rel="noreferrer"><Eye /> Receiver preview</a><button onClick={() => { saveCreation({ id: creationId, publicId, rCode, greeting, name: greeting.title, status: "published" }); setPublishOpen(true); }}><Send /> Finish & share</button></div>
    </header>

    <div className="maker-mobile-toggle-bar">
      <button
        type="button"
        className={mobileMode === "edit" ? "active" : ""}
        onClick={() => setMobileMode("edit")}
      >
        <Pencil /> 01 · Edit Story
      </button>
      <button
        type="button"
        className={mobileMode === "preview" ? "active" : ""}
        onClick={() => setMobileMode("preview")}
      >
        <Eye /> 02 · Live Preview
      </button>
    </div>

    <div className={`maker-layout mobile-view-${mobileMode}`}>
      <aside className="maker-sidebar">
        <div className="maker-intro"><span><ExperienceIcon experience={experience} /></span><small>MAKE A</small><h1>{meta.name}</h1><p>{meta.description}</p></div>
        <div className="maker-tabs"><button className={tab === "content" ? "active" : ""} onClick={() => setTab("content")}>01 · Story</button><button className={tab === "magic" ? "active" : ""} onClick={() => setTab("magic")}>02 · Details</button></div>
        {tab === "content" ? (
          <CommonFields greeting={greeting} update={update} />
        ) : (
          <UniqueControls
            experience={experience}
            greeting={greeting}
            setDetail={setDetail}
            setAudioDetails={setAudioDetails}
            setMemory={setMemory}
            addMemory={addMemory}
            handlePhotos={handlePhotos}
            update={update}
            uploadError={uploadError}
          />
        )}
      </aside>

      <section className="maker-stage">
        <div className="maker-stage-top"><span><i /> LIVE EXPERIENCE</span><small>{meta.kicker}</small></div>
        <div className="maker-decorations"><i>★</i><i>୨୧</i><i>✿</i></div>
        <UniqueCanvas experience={experience} greeting={greeting} setDetail={setDetail} />
        {greeting.details?.audioUrl && (
          <div className="maker-stage-audio-wrap" style={{ margin: "12px auto 6px", maxWidth: "420px", width: "100%", padding: "0 14px" }}>
            <PinkAudioPlayer
              url={greeting.details.audioUrl}
              name={greeting.details.audioName || "Soundtrack"}
              duration={greeting.details.audioDuration}
              compact
            />
          </div>
        )}
        <div className="maker-stage-bottom"><span><Music2 /> sound starts only when invited</span><span>{(greeting.media || []).length}/{["film", "timeline", "custom"].includes(experience) ? 12 : 4} photos</span></div>
      </section>
    </div>

    <AnimatePresence>
      {publishOpen && (
        <MakerPublish
          greeting={greeting}
          url={shareUrl}
          rCode={rCode}
          publicId={publicId}
          copied={copied}
          onCopy={copyLink}
          onClose={() => setPublishOpen(false)}
        />
      )}
    </AnimatePresence>
  </main>;
}

function CommonFields({ greeting, update }: { greeting: GreetingData; update: <K extends keyof GreetingData>(key: K, value: GreetingData[K]) => void }) {
  return <div className="maker-form">
    <div className="maker-field-row"><label><span>For</span><input value={greeting.recipient} onChange={(e) => update("recipient", e.target.value)} /></label><label><span>From</span><input value={greeting.sender} onChange={(e) => update("sender", e.target.value)} /></label></div>
    <label><span>Title</span><input value={greeting.title} onChange={(e) => update("title", e.target.value)} /></label>
    <label><span>Main message</span><textarea rows={7} value={greeting.message} onChange={(e) => update("message", e.target.value)} /><small>{greeting.message.length} characters</small></label>
    <label><span>Sign-off</span><input value={greeting.signoff} onChange={(e) => update("signoff", e.target.value)} /></label>
    <div className="maker-tip"><Sparkles /><p>Switch to <b>Details</b> to add the parts that make this experience unique.</p></div>
  </div>;
}

type UniqueControlProps = {
  experience: ExperienceKind;
  greeting: GreetingData;
  setDetail: (key: string, value: string) => void;
  setAudioDetails: (audioData: Record<string, string>) => void;
  setMemory: (index: number, value: string) => void;
  addMemory: () => void;
  handlePhotos: (event: ChangeEvent<HTMLInputElement>) => void;
  update: <K extends keyof GreetingData>(key: K, value: GreetingData[K]) => void;
  uploadError: string;
};

function UniqueControls({
  experience,
  greeting,
  setDetail,
  setAudioDetails,
  setMemory,
  addMemory,
  handlePhotos,
  update,
  uploadError,
}: UniqueControlProps) {
  const photoExperiences: ExperienceKind[] = ["scrapbook", "camera", "newspaper", "book", "place", "film", "birthday", "playlist", "video", "promise", "timeline", "custom", "flowers", "coffee"];
  const audioExperiences: ExperienceKind[] = ["letters", "scrapbook", "flowers", "book", "coffee", "place", "typewriter", "gift", "film", "birthday", "timeline", "custom"];
  const maxPhotos = ["film", "timeline", "custom"].includes(experience) ? 12 : 4;
  return <div className="unique-controls">
    {photoExperiences.includes(experience) && <div className="photo-uploader"><div><ImagePlus /><span>Add your photos</span><small>Validated & compressed · up to {maxPhotos}</small></div><label><Upload /> Upload<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={handlePhotos} /></label>{uploadError && <p className="upload-error" role="alert">{uploadError}</p>}{(greeting.media || []).length > 0 && <div className="uploaded-thumbs">{greeting.media?.map((photo, i) => <button key={i} onClick={() => update("media", greeting.media?.filter((_, index) => index !== i))} aria-label={`Remove uploaded memory ${i + 1}`}><img src={photo} alt={`Uploaded memory ${i + 1}`} /><X /></button>)}</div>}</div>}

    {experience === "letters" && <><ControlHeading title="Your sealed letters" action={addMemory} />{greeting.memories.map((item, i) => <MemoryInput key={i} index={i} value={item} setMemory={setMemory} placeholder="Open when…" />)}<TextDetail label="Selected letter body" value={greeting.details?.[`letter${Number(greeting.details?.active || 0)}`] || greeting.message} onChange={(value) => setDetail(`letter${Number(greeting.details?.active || 0)}`, value)} /><SelectField label="Envelope color" value={greeting.details?.paper || "blush"} options={["blush", "sage", "blue", "cream"]} onChange={(value) => setDetail("paper", value)} /></>}
    {experience === "scrapbook" && <><ControlHeading title="Page captions" action={addMemory} />{greeting.memories.map((item, i) => <MemoryInput key={i} index={i} value={item} setMemory={setMemory} placeholder="Caption this memory" />)}<SelectField label="Paper style" value={greeting.details?.paper || "grid"} options={["grid", "lined", "kraft", "floral"]} onChange={(value) => setDetail("paper", value)} /></>}
    {experience === "camera" && <><ControlHeading title="Photo-strip captions" action={addMemory} />{greeting.memories.map((item, i) => <MemoryInput key={i} index={i} value={item} setMemory={setMemory} placeholder="Photo caption" />)}<SelectField label="Booth filter" value={greeting.details?.filter || "warm"} options={["warm", "soft pink", "vintage", "monochrome"]} onChange={(value) => setDetail("filter", value)} /></>}
    {experience === "flowers" && <FlowerControls greeting={greeting} setDetail={setDetail} setMemory={setMemory} />}
    {experience === "newspaper" && <><TextDetail label="Newspaper name" value={greeting.details?.publication || "The Daily Wish"} onChange={(value) => setDetail("publication", value)} /><TextDetail label="Edition date" value={greeting.details?.date || "A very important day"} onChange={(value) => setDetail("date", value)} /><ControlHeading title="Side headlines" action={addMemory} />{greeting.memories.map((item, i) => <MemoryInput key={i} index={i} value={item} setMemory={setMemory} placeholder="Side headline" />)}</>}
    {experience === "book" && <><ControlHeading title="Chapters" action={addMemory} />{greeting.memories.map((item, i) => <MemoryInput key={i} index={i} value={item} setMemory={setMemory} placeholder="Chapter title" />)}<TextDetail label="Book dedication" value={greeting.details?.dedication || "For the story we keep writing"} onChange={(value) => setDetail("dedication", value)} /></>}
    {experience === "coffee" && <><SelectField label="Their drink" value={greeting.details?.drink || "cappuccino"} options={["cappuccino", "latte", "espresso", "americano", "mocha", "flat white", "cold coffee", "iced latte", "hot chocolate", "matcha"]} onChange={(value) => setDetail("drink", value)} /><SelectField label="Date vibe" value={greeting.details?.vibe || "cozy rainy café"} options={["cozy rainy café", "sunset coffee", "morning date", "late-night coffee", "bookstore café", "minimal café", "outdoor coffee"]} onChange={(value) => setDetail("vibe", value)} /><TextDetail label="Date" type="date" value={greeting.details?.date || ""} onChange={(value) => setDetail("date", value)} /><TextDetail label="Time" type="time" value={greeting.details?.time || ""} onChange={(value) => setDetail("time", value)} /><TextDetail label="Place / café" value={greeting.details?.cafe || "Our Little Corner"} onChange={(value) => setDetail("cafe", value)} /><ControlHeading title="Table memories" action={addMemory} />{greeting.memories.map((item, i) => <MemoryInput key={i} index={i} value={item} setMemory={setMemory} placeholder="A café memory" />)}</>}
    {experience === "place" && <><div className="provider-note"><MapPin /><div><strong>Illustrated map mode</strong><small>Add a real place name now. A provider-backed map can be enabled with the deployment key.</small></div></div><TextDetail label="Place name" value={greeting.details?.placeName || "Our favourite corner"} onChange={(value) => setDetail("placeName", value)} /><TextDetail label="Memory date" type="date" value={greeting.details?.date || ""} onChange={(value) => setDetail("date", value)} /><ControlHeading title="Memory pins" action={addMemory} />{greeting.memories.map((item, i) => <MemoryInput key={i} index={i} value={item} setMemory={setMemory} placeholder="A meaningful place" />)}<TextDetail label="Map title" value={greeting.details?.mapTitle || "Our tiny corner of the world"} onChange={(value) => setDetail("mapTitle", value)} /></>}
    {experience === "typewriter" && <><SelectField label="Paper theme" value={greeting.details?.paper || "handwritten cream"} options={["handwritten cream", "vintage letter", "minimal modern", "notebook", "romantic", "friendship"]} onChange={(value) => setDetail("paper", value)} /><TextDetail label="Letter date" type="date" value={greeting.details?.date || ""} onChange={(value) => setDetail("date", value)} /><SelectField label="Ink color" value={greeting.details?.ink || "chocolate"} options={["chocolate", "soft red", "midnight blue", "forest green"]} onChange={(value) => setDetail("ink", value)} /><SelectField label="Typing speed" value={greeting.details?.speed || "gentle"} options={["slow", "gentle", "quick"]} onChange={(value) => setDetail("speed", value)} /><ControlHeading title="Margin notes" action={addMemory} />{greeting.memories.map((item, i) => <MemoryInput key={i} index={i} value={item} setMemory={setMemory} placeholder="A margin note" />)}</>}
    {experience === "gift" && <><ControlHeading title="Surprise layers" action={addMemory} />{greeting.memories.map((item, i) => <MemoryInput key={i} index={i} value={item} setMemory={setMemory} placeholder="A surprise inside" />)}<SelectField label="Wrapping paper" value={greeting.details?.paper || "tiny hearts"} options={["tiny hearts", "birthday stars", "sage gingham", "pink ribbons"]} onChange={(value) => setDetail("paper", value)} /></>}
    {experience === "film" && <><SelectField label="Film transition" value={greeting.details?.transition || "soft dissolve"} options={["soft dissolve", "film cut", "slow zoom", "slide through time"]} onChange={(value) => setDetail("transition", value)} /><ControlHeading title="Scenes in order" action={addMemory} />{greeting.memories.map((item, i) => <MemoryInput key={i} index={i} value={item} setMemory={setMemory} placeholder="2024 — what happened" />)}<div className="maker-tip"><Film /><p>Add 5–12 compressed photos here. Production video/audio publishing becomes available when media storage is configured.</p></div></>}
    {experience === "birthday" && <><SelectField label="Cake flavour" value={greeting.details?.cake || "strawberry"} options={["chocolate", "vanilla", "strawberry", "red velvet", "butterscotch", "black forest", "minimal aesthetic", "heart cake", "bento cake"]} onChange={(value) => setDetail("cake", value)} /><TextDetail label="Name on cake" value={greeting.details?.cakeName || greeting.recipient} onChange={(value) => setDetail("cakeName", value)} /><TextDetail label="Candle number" type="number" value={greeting.details?.candles || "3"} onChange={(value) => setDetail("candles", String(Math.max(1, Math.min(9, Number(value) || 1))))} /><SelectField label="Balloon style" value={greeting.details?.balloons || "heart balloons"} options={["pastel balloons", "number balloons", "letter balloons", "heart balloons", "confetti balloons"]} onChange={(value) => setDetail("balloons", value)} /><ControlHeading title="Birthday wishes" action={addMemory} />{greeting.memories.map((item, i) => <MemoryInput key={i} index={i} value={item} setMemory={setMemory} placeholder="A wish or memory" />)}</>}
    {experience === "chocolate" && <><SelectField label="Chocolate box" value={greeting.details?.box || "velvet heart"} options={["velvet heart", "classic assortment", "pastel truffle box", "midnight pralines"]} onChange={(value) => setDetail("box", value)} /><ControlHeading title="Notes under each chocolate" action={addMemory} />{greeting.memories.map((item, i) => <MemoryInput key={i} index={i} value={item} setMemory={setMemory} placeholder="A compliment, memory or joke" />)}</>}
    {experience === "playlist" && <><TextDetail label="Song title" value={greeting.details?.song || "Our song"} onChange={(value) => setDetail("song", value)} /><TextDetail label="Artist" value={greeting.details?.artist || "The one you always play"} onChange={(value) => setDetail("artist", value)} /><TextDetail label="Legally embeddable song link" type="url" value={greeting.details?.songUrl || ""} onChange={(value) => setDetail("songUrl", value)} /><TextDetail label="Why this song?" value={greeting.details?.reason || greeting.memories[0]} onChange={(value) => setDetail("reason", value)} /><div className="maker-tip"><Music2 /><p>WishVerse links to supported music services; it does not copy or host copyrighted songs.</p></div></>}
    {experience === "video" && <><TextDetail label="Video URL" type="url" value={greeting.details?.videoUrl || ""} onChange={(value) => setDetail("videoUrl", value)} /><TextDetail label="Short intro" value={greeting.details?.intro || "Someone recorded something for you."} onChange={(value) => setDetail("intro", value)} /><div className="maker-tip"><Video /><p>Use a direct HTTPS video URL for now. Sender video uploads require the configured media-storage adapter so they remain real and shareable.</p></div></>}
    {experience === "jar" && <><SelectField label="Jar style" value={greeting.details?.jar || "pressed flower glass"} options={["pressed flower glass", "amber apothecary", "pink ribbon jar", "midnight stars"]} onChange={(value) => setDetail("jar", value)} /><ControlHeading title="Notes in the jar" action={addMemory} />{greeting.memories.map((item, i) => <MemoryInput key={i} index={i} value={item} setMemory={setMemory} placeholder="A compliment or encouragement" />)}</>}
    {experience === "coupons" && <><SelectField label="Ticket style" value={greeting.details?.ticket || "cinema pink"} options={["cinema pink", "vintage cream", "sage day pass", "midnight gold"]} onChange={(value) => setDetail("ticket", value)} /><ControlHeading title="Redeemable coupons" action={addMemory} />{greeting.memories.map((item, i) => <MemoryInput key={i} index={i} value={item} setMemory={setMemory} placeholder="One coffee date" />)}<div className="maker-tip"><Ticket /><p>Receiver redemption always asks for confirmation and is stored only on their device in guest mode.</p></div></>}
    {experience === "promise" && <><TextDetail label="Activity" value={greeting.details?.activity || "Coffee after exams"} onChange={(value) => setDetail("activity", value)} /><TextDetail label="Date" type="date" value={greeting.details?.date || ""} onChange={(value) => setDetail("date", value)} /><TextDetail label="Time" type="time" value={greeting.details?.time || ""} onChange={(value) => setDetail("time", value)} /><TextDetail label="Place" value={greeting.details?.place || "Somewhere we love"} onChange={(value) => setDetail("place", value)} /><ControlHeading title="Pass details" action={addMemory} />{greeting.memories.map((item, i) => <MemoryInput key={i} index={i} value={item} setMemory={setMemory} placeholder="What to expect" />)}</>}
    {experience === "puzzle" && <><SelectField label="Puzzle style" value={greeting.details?.puzzle || "flip cards"} options={["flip cards", "tap the stars", "find the hearts"]} onChange={(value) => setDetail("puzzle", value)} /><ControlHeading title="Friendly clues" action={addMemory} />{greeting.memories.map((item, i) => <MemoryInput key={i} index={i} value={item} setMemory={setMemory} placeholder="A clue they will understand" />)}<div className="maker-tip"><Puzzle /><p>Three quick reveals keep this playful without making the message frustrating to reach.</p></div></>}
    {experience === "timeline" && <><SelectField label="Timeline direction" value={greeting.details?.direction || "horizontal trail"} options={["horizontal trail", "vertical journal", "postcard route"]} onChange={(value) => setDetail("direction", value)} /><ControlHeading title="Dated milestones" action={addMemory} />{greeting.memories.map((item, i) => <MemoryInput key={i} index={i} value={item} setMemory={setMemory} placeholder="2024 — the moment" />)}</>}
    {experience === "custom" && <><SelectField label="Canvas paper" value={greeting.details?.canvas || "soft grid"} options={["soft grid", "cream paper", "night sky", "sage journal"]} onChange={(value) => setDetail("canvas", value)} /><ControlHeading title="Reorderable blocks" action={addMemory} />{greeting.memories.map((item, i) => <MemoryInput key={i} index={i} value={item} setMemory={setMemory} placeholder="heading::Your text" />)}<div className="maker-tip"><Star /><p>Prefix a block with heading::, quote::, text:: or secret:: to change how it appears.</p></div></>}
    <AudioStudioControl
      greeting={greeting}
      setDetail={setDetail}
      setAudioDetails={setAudioDetails}
    />
  </div>;
}

function ControlHeading({ title, action }: { title: string; action: () => void }) { return <div className="control-heading"><div><strong>{title}</strong><small>Tap the preview to try it</small></div><button onClick={action}><Plus /> Add</button></div>; }
function MemoryInput({ index, value, setMemory, placeholder }: { index: number; value: string; setMemory: (i: number, value: string) => void; placeholder: string }) { return <label className="memory-input"><span>{String(index + 1).padStart(2, "0")}</span><input value={value} placeholder={placeholder} onChange={(e) => setMemory(index, e.target.value)} /></label>; }
function TextDetail({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) { return <label className="detail-field"><span>{label}</span><input type={type} value={value} onChange={(e) => onChange(e.target.value)} /></label>; }
function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { return <label className="detail-field"><span>{label}</span><select value={value} onChange={(e) => onChange(e.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }

function FlowerControls({ greeting, setDetail, setMemory }: { greeting: GreetingData; setDetail: (key: string, value: string) => void; setMemory: (i: number, value: string) => void }) {
  const flowerNames = ["rose", "tulip", "sunflower", "lily", "orchid", "daisy", "peony", "lavender"];
  const chosen = (greeting.details?.flowers || "tulip,daisy,lavender").split(",").filter(Boolean);
  const toggle = (name: string) => setDetail("flowers", chosen.includes(name) ? chosen.filter((item) => item !== name).join(",") : [...chosen, name].slice(-5).join(","));
  return <><div className="flower-picker"><strong>Build the bouquet</strong><div>{flowerNames.map((name) => <button className={chosen.includes(name) ? "chosen" : ""} key={name} onClick={() => toggle(name)}><i className={`atlas-flower atlas-${name}`} /><span>{name}</span></button>)}</div></div><SelectField label="Arrangement" value={greeting.details?.arrangement || "garden gathered"} options={["garden gathered", "romantic round", "wild meadow", "single-variety statement"]} onChange={(value) => setDetail("arrangement", value)} /><SelectField label="Wrapping paper" value={greeting.details?.wrap || "warm kraft"} options={["warm kraft", "blush tissue", "sage linen", "cream newspaper"]} onChange={(value) => setDetail("wrap", value)} /><SelectField label="Ribbon" value={greeting.details?.ribbon || "rose velvet"} options={["rose velvet", "ivory silk", "sage gingham", "lavender twine"]} onChange={(value) => setDetail("ribbon", value)} /><SelectField label="Background" value={greeting.details?.background || "botanical cream"} options={["botanical cream", "soft sunset", "greenhouse", "midnight garden"]} onChange={(value) => setDetail("background", value)} /><div className="control-heading"><div><strong>Flower meanings</strong><small>Give each bloom a reason</small></div></div>{greeting.memories.map((item, i) => <MemoryInput key={i} index={i} value={item} setMemory={setMemory} placeholder="Why this flower?" />)}</>;
}

function UniqueCanvas({ experience, greeting, setDetail }: { experience: ExperienceKind; greeting: GreetingData; setDetail: (key: string, value: string) => void }) {
  if (experience === "letters") return <LettersCanvas greeting={greeting} setDetail={setDetail} />;
  if (experience === "scrapbook") return <ScrapbookCanvas greeting={greeting} />;
  if (experience === "camera") return <CameraCanvas greeting={greeting} setDetail={setDetail} />;
  if (experience === "flowers") return <FlowersCanvas greeting={greeting} />;
  if (experience === "newspaper") return <NewspaperCanvas greeting={greeting} />;
  if (experience === "book") return <BookCanvas greeting={greeting} setDetail={setDetail} />;
  if (experience === "coffee") return <CoffeeCanvas greeting={greeting} />;
  if (experience === "place") return <PlaceCanvas greeting={greeting} setDetail={setDetail} />;
  if (experience === "gift") return <GiftCanvas greeting={greeting} setDetail={setDetail} />;
  if (experience === "film") return <FilmCanvas greeting={greeting} setDetail={setDetail} />;
  if (experience === "birthday") return <BirthdayCanvas greeting={greeting} setDetail={setDetail} />;
  if (experience === "chocolate") return <ChocolateCanvas greeting={greeting} setDetail={setDetail} />;
  if (experience === "playlist") return <PlaylistCanvas greeting={greeting} setDetail={setDetail} />;
  if (experience === "video") return <VideoCanvas greeting={greeting} />;
  if (experience === "jar") return <JarCanvas greeting={greeting} setDetail={setDetail} />;
  if (experience === "coupons") return <CouponsCanvas greeting={greeting} setDetail={setDetail} />;
  if (experience === "promise") return <PromiseCanvas greeting={greeting} />;
  if (experience === "puzzle") return <PuzzleCanvas greeting={greeting} setDetail={setDetail} />;
  if (experience === "timeline") return <TimelineCanvas greeting={greeting} setDetail={setDetail} />;
  if (experience === "custom") return <CustomCanvas greeting={greeting} setDetail={setDetail} />;
  return <TypewriterCanvas greeting={greeting} setDetail={setDetail} />;
}

function LettersCanvas({ greeting, setDetail }: { greeting: GreetingData; setDetail: (key: string, value: string) => void }) {
  const active = Number(greeting.details?.active || 0) % Math.max(greeting.memories.length, 1);
  return <div className="maker-canvas letters-canvas"><div className="letter-stack">{greeting.memories.map((item, i) => <motion.button key={i} className={active === i ? "active" : ""} style={{ "--letter-i": i } as React.CSSProperties} onClick={() => setDetail("active", String(i))}><Mail /><span>{item}</span><small>{active === i ? "opened ♡" : "sealed"}</small></motion.button>)}</div><div className="open-letter"><span>Dear {greeting.recipient},</span><p>{greeting.message}</p><small>— {greeting.signoff}</small></div></div>;
}
function ScrapbookCanvas({ greeting }: { greeting: GreetingData }) { return <div className={`maker-canvas scrapbook-canvas paper-${greeting.details?.paper}`}><span className="canvas-tape" /><h2>{greeting.title}</h2><div className="scrap-photos">{[0, 1, 2].map((i) => <figure key={i}>{greeting.media?.[i] ? <img src={greeting.media[i]} alt="Uploaded scrapbook memory" /> : <Heart fill="currentColor" />}<figcaption>{greeting.memories[i] || "a little memory"}</figcaption></figure>)}</div><p>{greeting.message.slice(0, 130)}</p><i>✿</i><i>★</i></div>; }
function CameraCanvas({ greeting, setDetail }: { greeting: GreetingData; setDetail: (key: string, value: string) => void }) {
  const flash = greeting.details?.flash === "yes";
  const snap = () => { setDetail("flash", "yes"); window.setTimeout(() => setDetail("flash", "no"), 350); };
  return <div className={`maker-canvas camera-canvas filter-${(greeting.details?.filter || "warm").replaceAll(" ", "-")} ${flash ? "flash" : ""}`}><div className="booth-screen"><span>WISHVERSE PHOTO BOOTH</span><div className="booth-grid">{[0, 1, 2, 3].map((i) => <div key={i}>{greeting.media?.[i] ? <img src={greeting.media[i]} alt="Uploaded photo booth frame" /> : <Camera />}</div>)}</div><small>for {greeting.recipient}</small></div><button onClick={snap}><Camera /> SNAP</button><div className="photo-strip">{[0, 1, 2].map((i) => <i key={i}>{greeting.media?.[i] && <img src={greeting.media[i]} alt="Photo strip frame" />}</i>)}</div></div>;
}
function FlowersCanvas({ greeting }: { greeting: GreetingData }) {
  const flowers = (greeting.details?.flowers || "tulip,daisy,lavender").split(",").filter(Boolean);
  return <div className={`maker-canvas flowers-canvas bouquet-bg-${greeting.details?.background?.replaceAll(" ", "-")}`}><div className={`bouquet arrangement-${greeting.details?.arrangement?.replaceAll(" ", "-")}`}>{flowers.map((flower, i) => <motion.div key={`${flower}-${i}`} className={`digital-flower photo-flower flower-${flower}`} initial={{ scale: 0, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", delay: i * .08 }}><i className={`atlas-flower atlas-${flower}`} /></motion.div>)}<div className={`bouquet-wrap wrap-${greeting.details?.wrap?.replaceAll(" ", "-")}`}><i className={`ribbon-${greeting.details?.ribbon?.replaceAll(" ", "-")}`} /></div></div><div className="bouquet-card"><small>A BOUQUET FOR</small><h2>{greeting.recipient}</h2><p>{greeting.message.slice(0, 105)}…</p><span>{greeting.signoff}</span></div></div>;
}
function NewspaperCanvas({ greeting }: { greeting: GreetingData }) { return <div className="maker-canvas newspaper-canvas"><header><h2>{greeting.details?.publication || "The Daily Wish"}</h2><span>{greeting.details?.date}</span><span>SPECIAL EDITION · PRICE: ONE HUG</span></header><h1>{greeting.title}</h1><div className="newspaper-columns"><div className="news-photo">{greeting.media?.[0] ? <img src={greeting.media[0]} alt="Newspaper feature" /> : <Newspaper />}</div><p>{greeting.message}</p></div><div className="news-ticker">{greeting.memories.join("  •  ")}</div></div>; }
function BookCanvas({ greeting, setDetail }: { greeting: GreetingData; setDetail: (key: string, value: string) => void }) {
  const page = Number(greeting.details?.page || 0) % Math.max(greeting.memories.length, 1);
  return <div className="maker-canvas book-canvas"><div className="book-cover"><BookHeart /><span>{greeting.details?.dedication}</span></div><div className="open-book"><button onClick={() => setDetail("page", String((page - 1 + greeting.memories.length) % greeting.memories.length))}><ChevronLeft /></button><div><small>CHAPTER {page + 1}</small><h2>{greeting.memories[page]}</h2>{greeting.media?.[page] ? <img src={greeting.media[page]} alt="Memory book page" /> : <Heart />}<p>{greeting.message.slice(0, 120)}</p><i>{page + 1}</i></div><button onClick={() => setDetail("page", String((page + 1) % greeting.memories.length))}><ChevronRight /></button></div></div>;
}
function CoffeeCanvas({ greeting }: { greeting: GreetingData }) { return <div className={`maker-canvas coffee-canvas vibe-${greeting.details?.vibe?.replaceAll(" ", "-")}`}><div className="cafe-sign">{greeting.details?.cafe || "Our Little Corner"}<small>{greeting.details?.date ? `${formatDate(greeting.details.date)} · ${greeting.details.time || "time to choose"}` : "open for one more story"}</small></div><div className="coffee-table"><div className="maker-cup"><Coffee /><i /><i /><b>{greeting.details?.drink}</b></div><div className="receipt-note"><span>TABLE FOR TWO</span><h2>{greeting.title}</h2>{greeting.memories.slice(0, 3).map((item, i) => <p key={i}>0{i + 1} {item}</p>)}<small>{greeting.signoff}</small></div></div></div>; }
function PlaceCanvas({ greeting, setDetail }: { greeting: GreetingData; setDetail: (key: string, value: string) => void }) {
  const active = Number(greeting.details?.pin || 0) % Math.max(greeting.memories.length, 1);
  return <div className="maker-canvas place-canvas"><h2>{greeting.details?.mapTitle}</h2><div className="paper-map"><small className="map-fallback-label">ILLUSTRATED MAP · {greeting.details?.placeName}</small><svg viewBox="0 0 500 280" aria-hidden="true"><path d="M20 210C105 120 135 270 225 160S360 40 475 95" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="8 12" /></svg>{greeting.memories.slice(0, 4).map((place, i) => <button key={i} className={active === i ? "active" : ""} onClick={() => setDetail("pin", String(i))} style={{ "--pin-i": i } as React.CSSProperties}><MapPin fill="currentColor" /><span>{place}</span></button>)}<div className="map-photo">{greeting.media?.[active] ? <img src={greeting.media[active]} alt="Favorite place" /> : <Camera />}</div></div><p>{greeting.details?.date && <b>{formatDate(greeting.details.date)} · </b>}{greeting.message.slice(0, 120)}…</p></div>;
}
function TypewriterCanvas({ greeting, setDetail }: { greeting: GreetingData; setDetail: (key: string, value: string) => void }) {
  const playing = greeting.details?.playing === "yes";
  const [displayedText, setDisplayedText] = useState(greeting.message);
  const [activeKey, setActiveKey] = useState<number | null>(null);

  const speedMap: Record<string, number> = { slow: 65, gentle: 32, quick: 16 };
  const speed = speedMap[greeting.details?.speed || "gentle"] || 32;

  useEffect(() => {
    if (!playing) {
      setDisplayedText(greeting.message);
      setActiveKey(null);
      return;
    }
    setDisplayedText("");
    let idx = 0;
    const interval = window.setInterval(() => {
      idx += 1;
      setDisplayedText(greeting.message.slice(0, idx));
      setActiveKey(idx % 28);
      if (idx >= greeting.message.length) {
        window.clearInterval(interval);
        setActiveKey(null);
      }
    }, speed);
    return () => {
      window.clearInterval(interval);
      setActiveKey(null);
    };
  }, [playing, greeting.message, speed]);

  const paperClass = `paper-${(greeting.details?.paper || "handwritten cream").replaceAll(" ", "-")}`;
  const inkClass = `ink-${(greeting.details?.ink || "chocolate").replaceAll(" ", "-")}`;

  return (
    <div className={`maker-canvas typewriter-maker-canvas ${inkClass} ${paperClass} ${playing ? "playing" : ""}`}>
      <div className={`typed-paper ${paperClass} ${inkClass}`}>
        <div className="typed-paper-header">
          <span>FOR {greeting.recipient.toUpperCase()}</span>
          {greeting.details?.date && <small className="typed-date">{formatDate(greeting.details.date)}</small>}
        </div>
        <h2>{greeting.title}</h2>
        <p>
          {displayedText}
          <i className="type-cursor" />
        </p>
        <small>— {greeting.signoff}<br />{greeting.sender}</small>
        {greeting.memories && greeting.memories.filter(Boolean).length > 0 && (
          <div className="typed-margin-notes">
            {greeting.memories.filter(Boolean).map((note, i) => (
              <div key={i} className={`margin-note note-${i % 3}`}>
                <span className="margin-pin" />
                <p>{note}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="typewriter-hardware">
        <button onClick={() => setDetail("playing", playing ? "no" : "yes")}>
          {playing ? <RotateCcw /> : <Play />}
          {playing ? "Replay typing" : "Type it"}
        </button>
        <div>
          {Array.from({ length: 28 }).map((_, i) => (
            <i key={i} className={activeKey === i ? "active-key" : ""} />
          ))}
        </div>
      </div>
    </div>
  );
}
function GiftCanvas({ greeting, setDetail }: { greeting: GreetingData; setDetail: (key: string, value: string) => void }) {
  const layer = Number(greeting.details?.layer || 0);
  const open = layer > 0;
  const next = () => setDetail("layer", String(layer >= greeting.memories.length ? 0 : layer + 1));
  return <div className="maker-canvas gift-canvas"><button className={`big-gift ${open ? "open" : ""}`} onClick={next}><span className="big-bow" /><span className="big-box"><i /></span></button><AnimatePresence mode="wait">{open && <motion.div key={layer} className="gift-surprise" initial={{ opacity: 0, y: 20, scale: .8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -15 }}><small>SURPRISE {layer} OF {greeting.memories.length}</small><h2>{greeting.memories[layer - 1] || greeting.title}</h2><p>{layer === greeting.memories.length ? greeting.message : "Tap the box for another little thing."}</p><Heart fill="currentColor" /></motion.div>}</AnimatePresence><small>{open ? "tap again to keep unwrapping" : "tap the gift to begin"}</small></div>;
}

function FilmCanvas({ greeting, setDetail }: { greeting: GreetingData; setDetail: (key: string, value: string) => void }) {
  const scene = Number(greeting.details?.scene || 0) % Math.max(greeting.memories.length, 1); const playing = greeting.details?.playing === "yes";
  useEffect(() => { if (!playing) return; const timer = window.setInterval(() => setDetail("scene", String((scene + 1) % Math.max(greeting.memories.length, 1))), 2200); return () => window.clearInterval(timer) }, [greeting.memories.length, playing, scene, setDetail]);
  return <div className={`maker-canvas film-canvas transition-${greeting.details?.transition?.replaceAll(" ", "-")}`}><div className="film-top"><span>WISHVERSE PICTURES</span><i>● REC</i></div><div className="film-frame"><AnimatePresence mode="wait"><motion.figure key={scene} initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>{greeting.media?.[scene] ? <img src={greeting.media[scene]} alt={`Film scene ${scene + 1}`} /> : <Film />}<figcaption>{greeting.memories[scene] || "A scene worth keeping"}</figcaption></motion.figure></AnimatePresence></div><div className="film-controls"><button onClick={() => setDetail("playing", playing ? "no" : "yes")}>{playing ? <RotateCcw /> : <Play />}{playing ? "Pause film" : "Play memory film"}</button><span>{scene + 1} / {Math.max(greeting.memories.length, 1)}</span></div></div>
}

function BirthdayCanvas({ greeting, setDetail }: { greeting: GreetingData; setDetail: (key: string, value: string) => void }) {
  const blown = greeting.details?.blown === "yes"; const candleCount = Math.min(9, Math.max(1, Number(greeting.details?.candles || 3)));
  return <div className={`maker-canvas birthday-canvas ${blown ? "wish-made" : ""}`}><div className="birthday-balloons">{Array.from({ length: 7 }).map((_, i) => <i key={i} style={{ "--balloon-i": i } as React.CSSProperties} />)}</div><div className="birthday-title"><small>{blown ? "YOUR WISH IS ON ITS WAY" : "A BIRTHDAY FOR"}</small><h2>{greeting.recipient}</h2></div><button className={`birthday-cake cake-${greeting.details?.cake?.replaceAll(" ", "-")}`} onClick={() => setDetail("blown", blown ? "no" : "yes")} aria-label={blown ? "Relight candles" : "Blow out candles"}><span>{Array.from({ length: candleCount }).map((_, i) => <i key={i} />)}</span><b>{greeting.details?.cakeName || greeting.recipient}</b><small>{blown ? "tap to relight" : "tap to make a wish"}</small></button>{blown && <div className="birthday-confetti">{Array.from({ length: 28 }).map((_, i) => <i key={i} style={{ "--confetti-i": i } as React.CSSProperties} />)}</div>}<p>{blown ? greeting.message : "Close your eyes. Think of something wonderful."}</p></div>
}

function ChocolateCanvas({ greeting, setDetail }: { greeting: GreetingData; setDetail: (key: string, value: string) => void }) {
  const selected = Number(greeting.details?.chocolate || -1);
  return <div className={`maker-canvas chocolate-canvas box-${greeting.details?.box?.replaceAll(" ", "-")}`}><header><Candy /><div><small>A BOX OF LITTLE THINGS FOR</small><h2>{greeting.recipient}</h2></div></header><div className="chocolate-grid">{Array.from({ length: Math.max(6, greeting.memories.length) }).slice(0, 12).map((_, i) => <button className={selected === i ? "selected" : ""} key={i} onClick={() => setDetail("chocolate", String(i))} aria-label={`Open chocolate ${i + 1}`}><i /><span>{selected === i ? (greeting.memories[i] || "You make life sweeter") : "?"}</span></button>)}</div><small>pick a chocolate to reveal what it’s hiding</small></div>
}

function PlaylistCanvas({ greeting, setDetail }: { greeting: GreetingData; setDetail: (key: string, value: string) => void }) {
  const playing = greeting.details?.playing === "yes"; const songUrl = safeUrl(greeting.details?.songUrl);
  return <div className={`maker-canvas playlist-canvas ${playing ? "record-playing" : ""}`}><div className="record-player"><div className="vinyl"><i /><b /></div><span className="record-arm" /><button onClick={() => setDetail("playing", playing ? "no" : "yes")}><Play fill="currentColor" />{playing ? "Pause" : "Spin the record"}</button></div><article><small>A SONG FOR {greeting.recipient.toUpperCase()}</small><h2>{greeting.details?.song || "Our song"}</h2><span>{greeting.details?.artist}</span><p>{greeting.details?.reason || greeting.message}</p>{songUrl ? <a href={songUrl} target="_blank" rel="noreferrer">Open song link <ArrowLeft /></a> : <em>Add a supported song link in Details</em>}</article></div>
}

function VideoCanvas({ greeting }: { greeting: GreetingData }) {
  const videoUrl = safeUrl(greeting.details?.videoUrl); const playable = videoUrl && /\.(mp4|webm|ogg)(\?.*)?$/i.test(videoUrl);
  return <div className="maker-canvas video-canvas"><div className="video-screen">{playable ? <video controls preload="metadata" poster={greeting.media?.[0]} src={videoUrl} /> : greeting.media?.[0] ? <img src={greeting.media[0]} alt="Video cover" /> : <Video />}<span>WISHVERSE VIDEO MESSAGE</span></div><article><small>BEFORE YOU PRESS PLAY</small><h2>{greeting.details?.intro || "Someone recorded something for you."}</h2><p>{greeting.message}</p>{videoUrl && !playable && <a href={videoUrl} target="_blank" rel="noreferrer"><Play /> Open hosted video</a>}</article></div>
}

function JarCanvas({ greeting, setDetail }: { greeting: GreetingData; setDetail: (key: string, value: string) => void }) {
  const note = Number(greeting.details?.note || -1); const next = () => setDetail("note", String((note + 1) % Math.max(greeting.memories.length, 1)));
  return <div className={`maker-canvas jar-canvas jar-${greeting.details?.jar?.replaceAll(" ", "-")}`}><button className="compliment-jar" onClick={next}><span className="jar-lid" /><GlassWater />{greeting.memories.map((_, i) => <i key={i} style={{ "--note-i": i } as React.CSSProperties} />)}<small>pull a note</small></button><AnimatePresence mode="wait">{note >= 0 && <motion.article key={note} initial={{ opacity: 0, y: 45, rotate: -8 }} animate={{ opacity: 1, y: 0, rotate: 2 }} exit={{ opacity: 0, y: -20 }}><span>NOTE {String(note + 1).padStart(2, "0")}</span><p>{greeting.memories[note] || "You make this world kinder."}</p><small>from {greeting.sender}</small></motion.article>}</AnimatePresence></div>
}

function CouponsCanvas({ greeting, setDetail }: { greeting: GreetingData; setDetail: (key: string, value: string) => void }) {
  const active = Number(greeting.details?.coupon || 0) % Math.max(greeting.memories.length, 1);
  return <div className={`maker-canvas coupons-canvas ticket-${greeting.details?.ticket?.replaceAll(" ", "-")}`}><div className="coupon-stack">{greeting.memories.map((coupon, i) => <button key={i} className={active === i ? "active" : ""} onClick={() => setDetail("coupon", String(i))} style={{ "--coupon-i": i } as React.CSSProperties}><Ticket /><span>WISHVERSE COUPON</span><h2>{coupon}</h2><small>Valid when we both say yes · No expiry on kindness</small><i>WV-{String(i + 1).padStart(3, "0")}</i></button>)}</div><p>tap a ticket to bring it to the front</p></div>
}

function PromiseCanvas({ greeting }: { greeting: GreetingData }) { return <div className="maker-canvas promise-canvas"><div className="event-pass"><aside><CalendarHeart /><span>SAVE<br />THE<br />DATE</span></aside><article><small>ADMIT TWO · ONE LOVELY PLAN</small><h2>{greeting.details?.activity || greeting.title}</h2><div><span>WHEN<b>{formatDate(greeting.details?.date)} {greeting.details?.time}</b></span><span>WHERE<b>{greeting.details?.place || "Somewhere we love"}</b></span></div><p>{greeting.message}</p><footer>FOR {greeting.recipient.toUpperCase()} · FROM {greeting.sender.toUpperCase()}</footer></article></div></div> }

function PuzzleCanvas({ greeting, setDetail }: { greeting: GreetingData; setDetail: (key: string, value: string) => void }) {
  const flipped = (greeting.details?.flipped || "").split(",").filter(Boolean); const flip = (i: number) => setDetail("flipped", flipped.includes(String(i)) ? flipped.filter((item) => item !== String(i)).join(",") : [...flipped, String(i)].join(","));
  return <div className="maker-canvas puzzle-canvas"><small>FLIP THE THREE LITTLE CLUES</small><div>{greeting.memories.slice(0, 3).map((clue, i) => <button className={flipped.includes(String(i)) ? "flipped" : ""} onClick={() => flip(i)} key={i}><span><Puzzle /></span><i>{clue}</i></button>)}</div><AnimatePresence>{flipped.length >= 3 && <motion.article initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }}><Heart fill="currentColor" /><h2>{greeting.title}</h2><p>{greeting.message}</p></motion.article>}</AnimatePresence></div>
}

function TimelineCanvas({ greeting, setDetail }: { greeting: GreetingData; setDetail: (key: string, value: string) => void }) {
  const active = Number(greeting.details?.milestone || 0) % Math.max(greeting.memories.length, 1);
  return <div className={`maker-canvas timeline-canvas direction-${greeting.details?.direction?.replaceAll(" ", "-")}`}><header><small>OUR MEMORY TIMELINE</small><h2>{greeting.title}</h2></header><div className="timeline-track">{greeting.memories.map((memory, i) => <button key={i} className={active === i ? "active" : ""} onClick={() => setDetail("milestone", String(i))}><i /><span>{memory.split("—")[0]}</span></button>)}</div><article>{greeting.media?.[active] ? <img src={greeting.media[active]} alt={`Timeline milestone ${active + 1}`} /> : <MilestonePlaceholder />}<div><small>MILESTONE {active + 1}</small><h3>{greeting.memories[active]?.split("—").slice(1).join("—") || greeting.memories[active]}</h3><p>{greeting.message.slice(0, 120)}</p></div></article></div>
}

function MilestonePlaceholder() { return <div className="milestone-placeholder"><MapPin /><Heart /></div> }

function CustomCanvas({ greeting, setDetail }: { greeting: GreetingData; setDetail: (key: string, value: string) => void }) {
  const secretOpen = greeting.details?.secretOpen === "yes";
  return <div className={`maker-canvas custom-canvas canvas-${greeting.details?.canvas?.replaceAll(" ", "-")}`}><span className="canvas-tape" /><small>AN ORIGINAL WISHVERSE FOR {greeting.recipient.toUpperCase()}</small><div className="custom-blocks">{greeting.memories.map((block, i) => { const [kind, ...rest] = block.includes("::") ? block.split("::") : ["text", block]; const content = rest.join("::"); if (kind === "heading") return <h2 key={i}>{content}</h2>; if (kind === "quote") return <blockquote key={i}>“{content}”</blockquote>; if (kind === "secret") return <button key={i} className="secret-block" onClick={() => setDetail("secretOpen", secretOpen ? "no" : "yes")}><Gift />{secretOpen ? content : "Tap to reveal a secret"}</button>; return <p key={i}>{content}</p> })}{greeting.media?.[0] && <figure><img src={greeting.media[0]} alt="Custom experience memory" /><figcaption>one little thing worth keeping</figcaption></figure>}</div><em>— {greeting.signoff}</em></div>
}

function formatDate(value?: string) {
  if (!value) return "A date we choose";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(date);
}

function safeUrl(value?: string) {
  if (!value) return "";
  if (value.startsWith("data:audio/")) return value;
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:" || url.protocol === "data:") ? url.toString() : "";
  } catch {
    return "";
  }
}



function MakerPublish({
  greeting,
  url,
  rCode,
  publicId,
  copied,
  onCopy,
  onClose,
}: {
  greeting: GreetingData;
  url: string;
  rCode: string;
  publicId: string;
  copied: boolean;
  onCopy: () => void;
  onClose: () => void;
}) {
  const [codeCopied, setCodeCopied] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "shared">("idle");
  const [qrCode, setQrCode] = useState("");
  const [qrError, setQrError] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [lanUrl, setLanUrl] = useState("");
  const [lanCopied, setLanCopied] = useState(false);

  useEffect(() => {
    let active = true;
    if (!publicId && !url) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    // Fetch LAN IP if on localhost
    const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

    async function initQR() {
      let targetUrl = `${origin}/gift/${publicId}?r=${rCode}`;

      if (isLocal) {
        try {
          const res = await fetch("/api/network-ip");
          if (res.ok) {
            const data = await res.json();
            if (data?.lanIp && data.lanIp !== "127.0.0.1") {
              const port = window.location.port ? `:${window.location.port}` : "";
              const phoneUrl = `http://${data.lanIp}${port}/gift/${publicId}?r=${rCode}`;
              if (active) setLanUrl(phoneUrl);
              targetUrl = phoneUrl; // Use phone-reachable URL for QR code!
            }
          }
        } catch {}
      }

      try {
        const { toDataURL } = await import("qrcode");
        const data = await toDataURL(targetUrl, {
          width: 520,
          margin: 2,
          color: { dark: "#523c34", light: "#fffcf7" },
          errorCorrectionLevel: "M",
        });
        if (active) setQrCode(data);
      } catch (err) {
        console.error("QR Code generation error:", err);
        if (active) setQrError(true);
      }
    }

    initQR();

    return () => {
      active = false;
    };
  }, [publicId, rCode, url]);

  const copyRCode = async () => {
    try {
      await navigator.clipboard.writeText(rCode);
      setCodeCopied(true);
      window.setTimeout(() => setCodeCopied(false), 1600);
    } catch {
      // Fallback
    }
  };

  const handleShare = async () => {
    const shareTitle = `A WishVerse for ${greeting.recipient}`;
    const shareText = `I made an interactive ${experienceMeta[greeting.experience].name} for you, ${greeting.recipient} ♡ (R-Code: ${rCode})`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: url,
        });
        setShareStatus("shared");
        window.setTimeout(() => setShareStatus("idle"), 2400);
        return;
      } catch (err: unknown) {
        if (err && typeof err === "object" && "name" in err && err.name === "AbortError") return;
      }
    }

    const encoded = encodeURIComponent(`${shareText}\n\nOpen your gift: ${url}`);
    window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener,noreferrer");
    setShareStatus("shared");
    window.setTimeout(() => setShareStatus("idle"), 2400);
  };

  return (
    <motion.div
      className="maker-publish-overlay"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        className="maker-publish simplified"
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-title"
        initial={{ scale: 0.94, y: 18 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        <button
          className="maker-publish-close"
          onClick={onClose}
          aria-label="Close sharing dialog"
        >
          <X />
        </button>

        <span className="publish-icon">
          <ExperienceIcon experience={greeting.experience} />
        </span>
        <small className="publish-badge">
          YOUR {experienceMeta[greeting.experience].shortName.toUpperCase()} IS READY
        </small>
        <h2 id="publish-title">
          Send it to<br />
          <em>{greeting.recipient}.</em>
        </h2>

        {/* 3 Essential Options */}
        <div className="simplified-sharing-options">
          {/* OPTION 1: R CODE & QR */}
          <div className="share-option-card r-code-card">
            <div className="share-option-top">
              <div className="option-badge">01 · R CODE</div>
              <small>Unique creation code</small>
            </div>
            <div className="r-code-display">
              <span className="r-code-text">{rCode}</span>
              <button
                type="button"
                className={`copy-code-btn ${codeCopied ? "copied" : ""}`}
                onClick={copyRCode}
              >
                {codeCopied ? <Check /> : <Copy />}
                {codeCopied ? "Copied" : "Copy Code"}
              </button>
            </div>
            <div className="r-code-qr-toggle">
              <button
                type="button"
                className="qr-view-toggle"
                onClick={() => setQrOpen(!qrOpen)}
              >
                <QrCode />
                <span>{qrOpen ? "Hide QR Code" : "View QR Code Keepsake"}</span>
              </button>
              {qrOpen && (
                <div className="r-qr-expanded">
                  {qrCode ? (
                    <>
                      <img
                        src={qrCode}
                        alt={`QR Code for ${greeting.recipient} (R-Code: ${rCode})`}
                      />
                      <a
                        href={qrCode}
                        download={`wishverse-${rCode}.png`}
                        className="qr-download-link"
                      >
                        <QrCode /> Download QR Image
                      </a>
                    </>
                  ) : qrError ? (
                    <span className="qr-error-msg">Could not generate QR visual. Use R-Code above.</span>
                  ) : (
                    <span>Generating QR Code…</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* OPTION 2: SHARE */}
          <div className="share-option-card share-card">
            <div className="share-option-top">
              <div className="option-badge">02 · SHARE</div>
              <small>Send via apps or messaging</small>
            </div>
            <button
              type="button"
              className={`main-share-action-btn ${shareStatus === "shared" ? "shared" : ""}`}
              onClick={handleShare}
            >
              {shareStatus === "shared" ? <Check /> : <Share2 />}
              <span>{shareStatus === "shared" ? "Shared!" : "Share Creation"}</span>
            </button>
          </div>

          {/* OPTION 3: COPY LINK */}
          <div className="share-option-card copy-link-card">
            <div className="share-option-top">
              <div className="option-badge">03 · COPY LINK</div>
              <small>Direct public experience link</small>
            </div>
            <div className="copy-link-box">
              <input
                type="text"
                readOnly
                value={url}
                className="share-url-input"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                type="button"
                className={`main-copy-link-btn ${copied ? "copied" : ""}`}
                onClick={onCopy}
              >
                {copied ? <Check /> : <Copy />}
                <span>{copied ? "Link Copied!" : "Copy Link"}</span>
              </button>
            </div>
            {lanUrl && (
              <div style={{ marginTop: "10px", padding: "8px 12px", background: "#fdf2f4", borderRadius: "10px", border: "1px dashed #f4c2d0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                <span style={{ fontSize: "11px", color: "#8c6e76", fontWeight: 600 }}>📱 Same Wi-Fi phone link</span>
                <button
                  type="button"
                  style={{ background: "#d96b8a", color: "#fff", border: "none", borderRadius: "6px", padding: "4px 8px", fontSize: "10px", fontWeight: 700, cursor: "pointer" }}
                  onClick={async () => {
                    await navigator.clipboard.writeText(lanUrl);
                    setLanCopied(true);
                    setTimeout(() => setLanCopied(false), 1600);
                  }}
                >
                  {lanCopied ? "✓ Copied" : "Copy Phone URL"}
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function defaultDetails(experience: ExperienceKind): Record<string, string> {
  const defaults: Record<ExperienceKind, Record<string, string>> = {
    letters: { active: "0", paper: "blush" }, scrapbook: { paper: "grid" }, camera: { filter: "warm", flash: "no" }, flowers: { flowers: "tulip,daisy,lavender" },
    newspaper: { publication: "The Daily Wish", date: "A very important day" }, book: { page: "0", dedication: "For the story we keep writing" },
    coffee: { drink: "cappuccino", cafe: "Our Little Corner" }, place: { pin: "0", mapTitle: "Our tiny corner of the world" },
    typewriter: { ink: "chocolate", speed: "gentle", playing: "no" }, gift: { layer: "0", paper: "tiny hearts" },
    film: { scene: "0", playing: "no", transition: "soft dissolve" }, birthday: { cake: "strawberry", cakeName: "Maya", candles: "3", balloons: "heart balloons", blown: "no" },
    chocolate: { box: "velvet heart", chocolate: "-1" }, playlist: { song: "Our song", artist: "", songUrl: "", reason: "", playing: "no" },
    video: { videoUrl: "", intro: "Someone recorded something for you." }, jar: { jar: "pressed flower glass", note: "-1" }, coupons: { ticket: "cinema pink", coupon: "0" },
    promise: { activity: "Coffee after exams", date: "", time: "", place: "Somewhere we love" }, puzzle: { puzzle: "flip cards", flipped: "" },
    timeline: { direction: "horizontal trail", milestone: "0" }, custom: { canvas: "soft grid", secretOpen: "no" },
  };
  return defaults[experience];
}

function compressPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const image = new window.Image();
      image.onerror = () => reject(new Error("That image could not be read."));
      image.onload = () => {
        const max = 560;
        const scale = Math.min(1, max / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", .68));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
