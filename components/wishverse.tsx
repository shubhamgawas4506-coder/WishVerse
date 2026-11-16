"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  BookHeart,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Flower2,
  Gift,
  Heart,
  Image as ImageIcon,
  Mail,
  MapPin,
  Menu,
  Music2,
  Newspaper,
  Paperclip,
  Play,
  QrCode,
  RotateCcw,
  Scissors,
  Send,
  Sparkles,
  Star,
  Type,
  Volume2,
  WandSparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PaperNote, Polaroid, RetroWindow, ScrapbookCard, Sticker, Tape } from "@/components/scrapbook-ui";
import { AboutMeSection } from "@/components/about-me-section";
import { ContactForm } from "@/components/contact-form";

const experiences = [
  { id: "letters", title: "Open When Letters", copy: "A bundle of notes for every kind of day.", icon: Mail, tone: "pink" },
  { id: "scrapbook", title: "Memory Scrapbook", copy: "Photos, doodles and your favorite tiny stories.", icon: BookHeart, tone: "sage" },
  { id: "camera", title: "Camera Roll", copy: "A swipeable roll of moments worth keeping.", icon: Camera, tone: "blue" },
  { id: "flowers", title: "Flower Bouquet", copy: "A bouquet that blooms into a secret message.", icon: Flower2, tone: "yellow" },
  { id: "newspaper", title: "Digital Newspaper", copy: "Make them the headline of your favorite day.", icon: Newspaper, tone: "cream" },
  { id: "book", title: "Memory Book", copy: "Turn the pages of a story only you share.", icon: BookHeart, tone: "lavender" },
  { id: "coffee", title: "Coffee Date", copy: "Warm notes, cafe sounds and shared rituals.", icon: Coffee, tone: "brown" },
  { id: "place", title: "Favorite Place", copy: "Pin memories to the places they happened.", icon: MapPin, tone: "green" },
  { id: "typewriter", title: "Typewriter Letter", copy: "Watch every heartfelt word arrive key by key.", icon: Type, tone: "red" },
  { id: "gift", title: "Surprise Gift Box", copy: "A playful stack of reveals and little surprises.", icon: Gift, tone: "peach" },
];

const templates = [
  { name: "Birthday Headlines", category: "Birthday", style: "news", size: "tall", experience: "newspaper" },
  { name: "Our Sunday Roll", category: "Friendship", style: "photos", size: "wide", experience: "camera" },
  { name: "Open on a Hard Day", category: "Love", style: "letter", size: "medium", experience: "letters" },
  { name: "A Year of Us", category: "Anniversary", style: "journal", size: "tall", experience: "book" },
  { name: "You Did It!", category: "Congratulations", style: "party", size: "medium", experience: "birthday" },
  { name: "The Things I Miss", category: "Apology", style: "note", size: "wide", experience: "typewriter" },
  { name: "One More Coffee", category: "Farewell", style: "coffee", size: "medium", experience: "coffee" },
  { name: "A Pocket of Thanks", category: "Thank You", style: "flowers", size: "tall", experience: "flowers" },
];

const personalTouches = [
  { title: "Add their song", note: "Let the first chord bring the whole memory back.", icon: Music2, color: "pink" },
  { title: "Add their photos", note: "Turn the moments on your camera roll into something tactile.", icon: ImageIcon, color: "blue" },
  { title: "Hide a surprise", note: "Tuck a secret behind a flower, photo or envelope.", icon: Gift, color: "yellow" },
  { title: "Plan the next date", note: "Wrap a future coffee, outing or promise in a keepsake.", icon: Star, color: "sage" },
  { title: "Make a QR keepsake", note: "Print it inside a card or attach it to a real gift.", icon: QrCode, color: "lavender" },
  { title: "Share anywhere", note: "One beautiful link for WhatsApp, email or text.", icon: Send, color: "peach" },
];

const ease = [0.22, 1, 0.36, 1] as const;

function Reveal({ children, className = "", delay = 0, y = 28 }: { children: React.ReactNode; className?: string; delay?: number; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

function Brand() {
  return (
    <Link className="brand" href="/" aria-label="WishVerse home">
      <span className="brand-flower">✿</span>
      <span>Wish<span>Verse</span></span>
      <small>made with feeling</small>
    </Link>
  );
}

function DoodleLine({ className = "" }: { className?: string }) {
  return (
    <svg className={`doodle-line ${className}`} viewBox="0 0 200 40" aria-hidden="true">
      <path d="M3 22c25-18 43 13 68-2s42 13 64-2 36 4 61-10" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="1 7" />
    </svg>
  );
}

export function WishVerse() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePreview, setActivePreview] = useState(0);
  const [filter, setFilter] = useState("All");
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroArtY = useTransform(scrollYProgress, [0, 1], [0, 70]);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      document.documentElement.style.setProperty("--mouse-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${event.clientY}px`);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filteredTemplates = filter === "All" ? templates : templates.filter((item) => item.category === filter);

  return (
    <main id="top" className="scrapbook-site">
      <div className="mouse-star" aria-hidden="true">✦</div>
      <nav className={`nav-wrap ${scrolled ? "nav-scrolled" : ""}`} aria-label="Main navigation">
        <Brand />
        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <a href="#experiences" onClick={() => setMenuOpen(false)}>Explore</a>
          <a href="#templates" onClick={() => setMenuOpen(false)}>Templates</a>
          <a href="#preview" onClick={() => setMenuOpen(false)}>Live preview</a>
          <a href="#about-me" onClick={() => setMenuOpen(false)}>About Me</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact Me</a>
          <Link href="/my-creations" onClick={() => setMenuOpen(false)}>My creations</Link>
        </div>
        <div className="nav-actions">
          <Link className="sign-in" href="/my-creations">My creations</Link>
          <Link className="nav-cta" href="/templates">Start creating <ArrowRight /></Link>
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      <section className="hero" ref={heroRef}>
        <div className="hero-grid" />
        <Sticker className="hero-sticker star-one">★</Sticker>
        <Sticker className="hero-sticker star-two">✦</Sticker>
        <Sticker className="hero-sticker button-one">●</Sticker>
        <Sticker className="hero-sticker bow-one">୨୧</Sticker>
        <PaperNote className="hero-mini-note">
          for the people<br />
          <b>you keep close ♡</b>
        </PaperNote>
        <div className="hero-copy">
          <motion.div
            className="eyebrow"
            initial={{ opacity: 0, y: 14, filter: "blur(4px)", rotate: -3 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", rotate: -2 }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
          >
            <Sparkles /> Your memories, made touchable
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.75, delay: 0.22, ease }}
          >
            Turn your memories into<br />
            <em>something they can touch.</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.65, delay: 0.38, ease }}
          >
            Create interactive greetings filled with letters, photos, flowers, music and little surprises—then send it all with one beautiful link.
          </motion.p>
          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease }}
          >
            <Link className="primary-button" href="/templates">
              <WandSparkles /> Create a greeting <ArrowRight />
            </Link>
            <Link className="paper-button" href="/templates">
              <Paperclip /> Explore templates
            </Link>
          </motion.div>
          <motion.div
            className="hero-note"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.65 }}
          >
            <Check /> No design skills needed <i /> Free to start
          </motion.div>
        </div>
        <motion.div
          className="hero-art"
          style={{ y: heroArtY }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25, ease }}
        >
          <div className="hero-art-frame">
            <Tape className="tape-top" />
            <Image
              src="/images/scrapbook-hero.png"
              alt="An original pastel scrapbook desk with a retro pink computer, camera, flowers, notes and polaroids"
              fill
              priority
              sizes="(max-width: 850px) 100vw, 58vw"
            />
          </div>
          <Polaroid caption="tiny moments, big feelings" className="hero-polaroid">
            <div className="polaroid-sky">
              <Heart fill="currentColor" />
            </div>
          </Polaroid>
          <Sticker className="camera-flash">
            <Camera /> snap!
          </Sticker>
        </motion.div>
        <div className="hero-scroll">scroll to open the scrapbook <span>↓</span></div>
      </section>

      <motion.section
        className="marquee-strip"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div>
          {["OPEN WHEN LETTERS", "PHOTO MEMORIES", "FLOWER MESSAGES", "VOICE NOTES", "ONE BEAUTIFUL LINK", "OPEN WHEN LETTERS", "PHOTO MEMORIES"].map((text, i) => (
            <span key={i}>✿ {text}</span>
          ))}
        </div>
      </motion.section>

      <section className="experiences section" id="experiences">
        <Reveal className="section-heading">
          <div className="section-label"><Scissors /> PICK A PAGE</div>
          <h2>Choose the way your<br /><em>story wants to be told.</em></h2>
          <p>Every format has its own little rituals, sounds and surprises.</p>
        </Reveal>
        <Sticker className="exp-button-sticker">✿</Sticker>
        <DoodleLine className="experience-doodle" />
        <div className="experience-grid">
          {experiences.map(({ id, title, copy, icon: Icon, tone }, index) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 32, filter: "blur(3px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: (index % 4) * 0.08, ease }}
            >
              <ScrapbookCard className={`experience-card ${tone} card-${index}`}>
                <Tape />
                <div className={`experience-art art-${id}`}>
                  <Icon />
                  <span>{id === "letters" ? "open me" : id === "camera" ? "click!" : id === "newspaper" ? "TODAY" : "♡"}</span>
                  <i />
                </div>
                <div className="experience-copy">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                  <Link href={`/create/${id}`} aria-label={`Create ${title}`}>Create <ArrowRight /></Link>
                </div>
              </ScrapbookCard>
            </motion.div>
          ))}
        </div>
        <Reveal className="section-link">
          <Link href="/create/custom">Start with a blank scrapbook <ArrowRight /></Link>
        </Reveal>
      </section>

      <section className="how-it-works section" id="how">
        <div className="how-board">
          <Sticker className="how-star">★</Sticker>
          <Sticker className="how-bow">୨୧</Sticker>
          <Reveal className="section-heading">
            <div className="section-label"><Paperclip /> EASY AS 1, 2, 3, 4</div>
            <h2>Made by you.<br /><em>Opened by them.</em></h2>
          </Reveal>
          <div className="steps-row">
            {[
              ["01", "Choose a style", "Pick a letter, scrapbook, camera roll or build from blank."],
              ["02", "Add the memories", "Drop in words, compressed photos and all the little things."],
              ["03", "Make it theirs", "Choose colors, optional audio, reveals and secret messages."],
              ["04", "Share one link", "They tap it and step into the experience you made."],
            ].map(([number, title, copy], i) => (
              <Reveal key={number} className={`step-note step-note-${i}`} delay={i * 0.09}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
                {i < 3 && <DoodleLine />}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="interactive-preview section" id="preview">
        <Reveal className="preview-heading">
          <div className="section-label"><Play /> TRY IT YOURSELF</div>
          <h2>Not just seen.<br /><em>Opened, flipped & discovered.</em></h2>
          <p>Tap through a tiny WishVerse before you make your own.</p>
        </Reveal>
        <div className="retro-desk">
          <div className="desk-lamp"><i /><b /><span /></div>
          <div className="coffee-prop"><Coffee /><i /><i /></div>
          <div className="plant-prop"><Flower2 /><span /></div>
          <Sticker className="desk-star">★</Sticker>
          <div className="retro-monitor">
            <div className="monitor-camera" />
            <RetroWindow title="a little something for you ♡" className="monitor-window">
              <div className={`preview-scene preview-${activePreview}`}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePreview}
                    initial={{ opacity: 0, scale: 0.92, rotate: -1 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.35 }}
                  >
                    {activePreview === 0 && (
                      <button className="preview-envelope" onClick={() => setActivePreview(1)}>
                        <Mail />
                        <span>for you</span>
                        <small>tap to open</small>
                      </button>
                    )}
                    {activePreview === 1 && (
                      <button className="preview-page" onClick={() => setActivePreview(2)}>
                        <Tape />
                        <h3>Three things I love about you</h3>
                        <p>01 · the laugh<br />02 · the kindness<br />03 · every ordinary adventure</p>
                        <small>turn the page →</small>
                      </button>
                    )}
                    {activePreview === 2 && (
                      <button className="preview-camera" onClick={() => setActivePreview(3)}>
                        <Camera />
                        <i />
                        <span>click to remember</span>
                      </button>
                    )}
                    {activePreview === 3 && (
                      <button className="preview-typed" onClick={() => setActivePreview(0)}>
                        <Type />
                        <p>you make the little things feel like everything.<i /></p>
                        <small>replay ↻</small>
                      </button>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </RetroWindow>
            <div className="monitor-base"><i /></div>
          </div>
          <div className="preview-controls">
            {["Open", "Read", "Snap", "Reveal"].map((label, i) => (
              <button
                key={label}
                className={activePreview === i ? "active" : ""}
                onClick={() => setActivePreview(i)}
              >
                <span>0{i + 1}</span>{label}
              </button>
            ))}
          </div>
          <div className="retro-keyboard">
            {Array.from({ length: 24 }).map((_, i) => <i key={i} />)}
          </div>
        </div>
      </section>

      <section className="templates-section section" id="templates">
        <div className="templates-top">
          <Reveal>
            <div className="section-label"><ImageIcon /> THE PINBOARD</div>
            <h2>A template for every<br /><em>kind of feeling.</em></h2>
          </Reveal>
          <PaperNote className="template-note">
            made to remix,<br />
            <b>never just copy ♡</b>
          </PaperNote>
        </div>
        <div className="template-filters">
          {["All", "Birthday", "Friendship", "Love", "Anniversary", "Thank You"].map((item) => (
            <button
              key={item}
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <motion.div layout className="masonry-board">
          {filteredTemplates.map((template, i) => (
            <motion.article
              layout
              key={template.name}
              className={`template-pin ${template.style} ${template.size}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.07, ease }}
              whileHover={{ y: -8, rotate: i % 2 ? -1 : 1 }}
            >
              <span className="push-pin" />
              <div className="template-visual">
                <TemplateVisual styleName={template.style} />
              </div>
              <div className="template-info">
                <span>{template.category}</span>
                <h3>{template.name}</h3>
                <Link href={`/create/${template.experience}`}>Use this template <ArrowRight /></Link>
              </div>
            </motion.article>
          ))}
        </motion.div>
        <Reveal className="section-link">
          <Link href="/templates">Browse all 21 experiences <ArrowRight /></Link>
        </Reveal>
      </section>

      <section className="editor-section section">
        <Reveal className="editor-copy">
          <div className="section-label"><WandSparkles /> YOUR CREATIVE CORNER</div>
          <h2>Make it look like<br /><em>only you could.</em></h2>
          <p>Layer words, memories, photos and surprises. Every editor adapts to the ritual you choose.</p>
          <ul>
            <li><Check /> Experience-specific controls</li>
            <li><Check /> Real local draft persistence</li>
            <li><Check /> Preview the receiver&apos;s journey live</li>
          </ul>
          <Link className="primary-button" href="/templates">Choose your creator <ArrowRight /></Link>
        </Reveal>
        <Reveal className="editor-mockup" delay={0.15}>
          <Sticker className="editor-bow">୨୧</Sticker>
          <RetroWindow title="untitled-wishverse.page">
            <div className="mock-editor">
              <aside>
                <button><Type /> Text</button>
                <button><ImageIcon /> Photos</button>
                <button><Music2 /> Audio</button>
                <button><Star /> Stickers</button>
              </aside>
              <div className="mock-canvas">
                <span className="mock-tape" />
                <div className="mock-photo"><Heart fill="currentColor" /></div>
                <h3>Dear favorite human,</h3>
                <p>here is a little page<br />full of us...</p>
                <Sticker>✦</Sticker>
              </div>
              <aside className="mock-settings">
                <span>paper</span>
                <i /><i /><i />
                <span>layers</span>
                <b>photo 01</b>
                <b>tiny note</b>
                <b>sticker</b>
              </aside>
            </div>
          </RetroWindow>
        </Reveal>
      </section>

      <section className="personal-section section">
        <Reveal className="section-heading">
          <div className="section-label"><Heart /> THE PERSONAL PART</div>
          <h2>The tiny touches are<br /><em>the whole point.</em></h2>
        </Reveal>
        <div className="touches-board">
          {personalTouches.map(({ title, note, icon: Icon, color }, i) => (
            <Reveal className={`touch-note ${color} touch-${i}`} key={title} delay={i * 0.06}>
              <span><Icon /></span>
              <h3>{title}</h3>
              <p>{note}</p>
              <Tape />
            </Reveal>
          ))}
          <DoodleLine />
          <Sticker className="touch-bow">୨୧</Sticker>
          <Sticker className="touch-star">★</Sticker>
        </div>
      </section>

      <section className="final-cta section">
        <Sticker className="final-star one">★</Sticker>
        <Sticker className="final-star two">✦</Sticker>
        <Sticker className="final-bow">୨୧</Sticker>
        <Polaroid caption="one more lovely memory" className="final-photo">
          <div className="final-photo-art"><Flower2 /></div>
        </Polaroid>
        <div className="final-envelope"><Mail /><span>open with care</span></div>
        <Reveal>
          <div className="section-label"><Sparkles /> A NOTE BEFORE YOU GO</div>
          <h2>Some messages deserve<br /><em>more than a text.</em></h2>
          <p>Make a place they can open whenever they need to feel remembered.</p>
          <Link className="primary-button" href="/templates">Create something unforgettable <ArrowRight /></Link>
          <small>Free to start · Share with one beautiful link</small>
        </Reveal>
      </section>

      {/* ABOUT ME SECTION (Created by Shubham Gawas with love) */}
      <AboutMeSection />

      {/* CONTACT ME SECTION (Direct message to shubhamgawas4506@gmail.com) */}
      <section className="contact-home-section section" id="contact">
        <Reveal className="section-heading">
          <div className="section-label">
            <Mail /> GET IN TOUCH
          </div>
          <h2>
            Send a note to<br />
            <em>Shubham Gawas.</em>
          </h2>
          <p>
            Questions, ideas, sweet feedback, or just saying hello—every note goes directly to{" "}
            <b>shubhamgawas4506@gmail.com</b>.
          </p>
        </Reveal>
        <Reveal delay={0.12}>
          <ContactForm />
        </Reveal>
      </section>

      <motion.footer
        className="site-footer"
        id="footer"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7, ease }}
      >
        <div className="footer-top">
          <div className="footer-brand-col">
            <Brand />
            <p>Interactive greetings for<br />the people you keep close.</p>
            <div className="footer-creator-chip">
              <span>Created by <strong>Shubham Gawas</strong> with love ♡</span>
            </div>
          </div>
          <div>
            <span>EXPLORE</span>
            <Link href="/templates">Experiences</Link>
            <a href="#templates">Templates</a>
            <a href="#preview">Try a demo</a>
            <a href="#about-me">About Me</a>
          </div>
          <div>
            <span>CREATE</span>
            <Link href="/create/custom">Blank canvas</Link>
            <Link href="/my-creations">My creations</Link>
            <Link href="/templates">All templates</Link>
            <Link href="/create/camera">Photo booth</Link>
          </div>
          <div>
            <span>CONTACT</span>
            <a href="#contact">Send a message</a>
            <Link href="/contact">Support page</Link>
            <a href="mailto:shubhamgawas4506@gmail.com" className="footer-email-link">
              Email Shubham
            </a>
            <Link href="/report">Safety report</Link>
          </div>
          <PaperNote>
            made somewhere<br />
            between a memory<br />
            and a love letter ♡
          </PaperNote>
        </div>
        <div className="footer-bottom">
          <span>© 2026 WishVerse</span>
          <span className="footer-bottom-links">
            <Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link> · <Link href="/about">About</Link> · <a href="#contact">Contact</a>
          </span>
          <a href="#about-me" className="footer-created-by">
            Created by Shubham Gawas with love ♡
          </a>
          <span className="footer-version-badge" title="Latest build verified">
            v2.2 · Mobile &amp; Audio Live ✦
          </span>
          <a href="#top" className="footer-back-to-top">
            Top ↑
          </a>
        </div>
      </motion.footer>
    </main>
  );
}

function TemplateVisual({ styleName }: { styleName: string }) {
  if (styleName === "news") return <div className="visual-news"><b>The Daily Wish</b><h4>LOCAL HUMAN IS VERY LOVED</h4><p>Special edition · today</p><i /><i /></div>;
  if (styleName === "photos") return <div className="visual-photos"><span /><span /><span /><Camera /></div>;
  if (styleName === "letter") return <div className="visual-letter"><Mail /><p>open when<br />you need me</p><Sticker>♡</Sticker></div>;
  if (styleName === "journal") return <div className="visual-journal"><Tape /><h4>our little year</h4><span /><span /><p>the days I&apos;d keep</p></div>;
  if (styleName === "party") return <div className="visual-party"><Gift /><span>★</span><span>✦</span><b>YOU DID IT!</b></div>;
  if (styleName === "coffee") return <div className="visual-coffee"><Coffee /><i /><i /><p>one more cup,<br />one more story</p></div>;
  if (styleName === "flowers") return <div className="visual-flowers"><Flower2 /><Flower2 /><Flower2 /><small>thank you</small></div>;
  return <div className="visual-note"><Paperclip /><p>I&apos;m sorry.<br /><b>You matter more.</b></p><Heart /></div>;
}
