"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Heart, Search, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ExperienceIcon } from "@/components/experience-icon";
import { experienceCategories, experienceDefinitions, ExperienceDefinition } from "@/lib/experiences";
import { getFavouriteExperiences, toggleFavouriteExperience } from "@/lib/creation-store";

export function TemplateBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof experienceCategories)[number]>("All");
  const [favourites, setFavourites] = useState<string[]>([]);
  const [preview, setPreview] = useState<ExperienceDefinition | null>(null);

  useEffect(() => setFavourites(getFavouriteExperiences()), []);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return experienceDefinitions.filter((experience) => {
      const categoryMatch = category === "All" || experience.categories.includes(category);
      const searchMatch = !needle || `${experience.name} ${experience.description} ${experience.categories.join(" ")} ${experience.capability}`.toLowerCase().includes(needle);
      return categoryMatch && searchMatch;
    });
  }, [category, query]);

  const favourite = (id: string) => setFavourites(toggleFavouriteExperience(id));

  return <main className="template-library">
    <header className="library-nav"><Link href="/" className="library-back"><ArrowLeft /> Home</Link><Link href="/" className="library-brand"><span>✿</span> Wish<span>Verse</span></Link><Link href="/my-creations">My creations <ArrowRight /></Link></header>
    <section className="library-hero">
      <div><span className="library-kicker"><Sparkles /> PICK A LITTLE WORLD</span><h1>Make something<br/><em>they’ll want to keep.</em></h1><p>Every choice below has its own editor, interaction and receiver reveal. Start with the ritual that fits the feeling.</p></div>
      <div className="library-note"><i/>made to remix,<br/><strong>never just copy ♡</strong></div>
    </section>
    <section className="library-tools" aria-label="Template filters">
      <label><Search/><span className="sr-only">Search experiences</span><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Search flowers, birthday, memories…"/></label>
      <div>{experienceCategories.map((item)=><button key={item} className={category===item?"active":""} onClick={()=>setCategory(item)}>{item}</button>)}</div>
    </section>
    <section className="library-results"><div className="library-results-heading"><span>{String(results.length).padStart(2,"0")} EXPERIENCES</span><p>Preview the ritual before choosing it.</p></div>
      {results.length ? <div className="experience-masonry">{results.map((experience,index)=><motion.article layout key={experience.id} className={`discovery-card ${experience.size} discovery-${experience.art}`} initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:Math.min(index*.025,.2)}}>
        <span className="discovery-pin"/><button className="favourite-button" onClick={()=>favourite(experience.id)} aria-label={`${favourites.includes(experience.id)?"Remove":"Add"} ${experience.name} ${favourites.includes(experience.id)?"from":"to"} favourites`} aria-pressed={favourites.includes(experience.id)}><Heart fill={favourites.includes(experience.id)?"currentColor":"none"}/></button>
        <button className="discovery-preview" onClick={()=>setPreview(experience)} aria-label={`Preview ${experience.name}`}><ExperiencePreviewArt experience={experience}/><span>Tap to preview</span></button>
        <div className="discovery-copy"><small>{experience.eyebrow}</small><h2>{experience.name}</h2><p>{experience.description}</p><div><span>{experience.capability}</span><Link href={`/create/${experience.id}`}>Create <ArrowRight/></Link></div></div>
      </motion.article>)}</div> : <div className="library-empty"><Search/><h2>No little worlds found.</h2><p>Try a broader feeling or clear your search.</p><button onClick={()=>{setQuery("");setCategory("All")}}>Clear filters</button></div>}
    </section>
    <AnimatePresence>{preview&&<ExperiencePreviewDialog experience={preview} onClose={()=>setPreview(null)}/>}</AnimatePresence>
  </main>;
}

function ExperiencePreviewDialog({experience,onClose}:{experience:ExperienceDefinition;onClose:()=>void}){
  const closeRef=useRef<HTMLButtonElement>(null);
  useEffect(()=>{closeRef.current?.focus();const close=(event:KeyboardEvent)=>event.key==="Escape"&&onClose();window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close)},[onClose]);
  return <motion.div className="preview-dialog-backdrop" role="presentation" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={(event)=>event.currentTarget===event.target&&onClose()}><motion.section role="dialog" aria-modal="true" aria-labelledby="preview-title" className={`experience-dialog dialog-${experience.art}`} initial={{scale:.94,y:18}} animate={{scale:1,y:0}} exit={{scale:.97,opacity:0}}><button ref={closeRef} className="dialog-close" onClick={onClose} aria-label="Close preview"><X/></button><div className="dialog-stage"><span>RECEIVER PREVIEW</span><ExperiencePreviewArt experience={experience} large/></div><div className="dialog-copy"><small>{experience.eyebrow}</small><h2 id="preview-title">{experience.name}</h2><p>{experience.description}</p><div><Check/> Unique editor <Check/> Personal content <Check/> Interactive reveal</div><Link href={`/create/${experience.id}`}>Use this experience <ArrowRight/></Link></div></motion.section></motion.div>
}

function ExperiencePreviewArt({experience,large=false}:{experience:ExperienceDefinition;large?:boolean}){
  return <div className={`experience-preview-art art-${experience.art} ${large?"large":""}`}>
    <span className="art-spark">✦</span><ExperienceIcon experience={experience.id}/>
    {experience.id==="flowers"&&<div className="mini-flower-row">{["rose","tulip","sunflower","lavender"].map((flower)=><i className={`atlas-flower atlas-${flower}`} key={flower}/>)}</div>}
    {experience.id==="birthday"&&<div className="mini-cake"><i/><i/><i/><b>make a wish</b></div>}
    {experience.id==="film"&&<div className="mini-film-strip"><i/><i/><i/></div>}
    {experience.id==="chocolate"&&<div className="mini-chocolates">{Array.from({length:6}).map((_,i)=><i key={i}/>)}</div>}
    {experience.id==="jar"&&<div className="mini-notes"><i/><i/><i/></div>}
    {experience.id==="puzzle"&&<div className="mini-puzzle"><i>♡</i><i>?</i><i>✦</i><i>?</i></div>}
    {experience.id==="timeline"&&<div className="mini-timeline"><i/><i/><i/><i/></div>}
    <small>{experience.capability}</small>
  </div>;
}
