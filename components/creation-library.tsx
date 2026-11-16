"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Copy, ExternalLink, FilePlus2, MoreHorizontal, Pencil, Send, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ExperienceIcon } from "@/components/experience-icon";
import { deleteCreation, duplicateCreation, getCreations, saveCreation, StoredCreation } from "@/lib/creation-store";
import { encodeGreeting, experienceMeta } from "@/lib/greeting";

type CreationFilter="all"|"draft"|"published";

export function CreationLibrary(){
  const [creations,setCreations]=useState<StoredCreation[]>([]);const [filter,setFilter]=useState<CreationFilter>("all");const [open,setOpen]=useState<string|null>(null);const [copied,setCopied]=useState<string|null>(null);
  const refresh=useCallback(()=>setCreations(getCreations()),[]);
  useEffect(()=>{refresh();window.addEventListener("wishverse:creations",refresh);return()=>window.removeEventListener("wishverse:creations",refresh)},[refresh]);
  const shown=filter==="all"?creations:creations.filter((creation)=>creation.status===filter);
  const remove=(creation:StoredCreation)=>{if(window.confirm(`Delete “${creation.name}”? This cannot be undone.`))deleteCreation(creation.id)};
  const rename=(creation:StoredCreation)=>{const name=window.prompt("Name this creation",creation.name)?.trim();if(name)saveCreation({...creation,name,greeting:creation.greeting})};
  const copyLink=async(creation:StoredCreation)=>{const url=`${location.origin}/gift/${creation.publicId}?r=${creation.rCode}#d=${encodeGreeting(creation.greeting)}`;await navigator.clipboard.writeText(url);setCopied(creation.id);window.setTimeout(()=>setCopied(null),1400)};
  const publish=(creation:StoredCreation)=>saveCreation({...creation,status:creation.status==="published"?"draft":"published",greeting:creation.greeting});
  return <main className="creations-page"><header className="library-nav"><Link href="/" className="library-back"><ArrowLeft/> Home</Link><Link href="/" className="library-brand"><span>✿</span> Wish<span>Verse</span></Link><Link href="/templates">Browse experiences <ArrowRight/></Link></header>
    <section className="creations-hero"><div><span><Sparkles/> SAVED ON THIS DEVICE</span><h1>Your little<br/><em>worlds.</em></h1><p>Continue a draft, publish when it feels right, or keep it quietly here until later.</p></div><Link href="/templates"><FilePlus2/> New creation</Link></section>
    <section className="creations-content"><div className="creation-tabs">{(["all","draft","published"] as CreationFilter[]).map((item)=><button className={filter===item?"active":""} key={item} onClick={()=>setFilter(item)}>{item}<span>{item==="all"?creations.length:creations.filter((creation)=>creation.status===item).length}</span></button>)}</div>
      {!shown.length?<div className="creations-empty"><div><ExperienceIcon experience="gift"/><i>✦</i></div><h2>{creations.length?"Nothing in this pocket yet.":"Your first little world starts here."}</h2><p>{creations.length?"Choose another tab or make something new.":"No fake drafts or sample creations—only the things you actually make."}</p><Link href="/templates">Choose an experience <ArrowRight/></Link></div>:<div className="creation-grid">{shown.map((creation)=><motion.article layout key={creation.id} className={`creation-card creation-${creation.greeting.experience}`}><div className="creation-card-art"><ExperienceIcon experience={creation.greeting.experience}/><span>{experienceMeta[creation.greeting.experience].shortName}</span><i/></div><div className="creation-card-copy"><small>{creation.rCode ? <strong style={{color:"var(--pink)",marginRight:4}}>{creation.rCode} ·</strong> : null}{creation.status} · edited {new Date(creation.updatedAt).toLocaleDateString()}</small><h2>{creation.name}</h2><p>For {creation.greeting.recipient} · by {creation.greeting.sender}</p><div><Link href={`/create/${creation.greeting.experience}?draft=${creation.id}`}><Pencil/> Edit</Link><button onClick={()=>publish(creation)}><Send/>{creation.status==="published"?"Unpublish":"Publish"}</button><button aria-label="More actions" onClick={()=>setOpen(open===creation.id?null:creation.id)}><MoreHorizontal/></button></div></div><AnimatePresence>{open===creation.id&&<motion.div className="creation-menu" initial={{opacity:0,y:-5}} animate={{opacity:1,y:0}} exit={{opacity:0}}><Link href={`/gift/${creation.publicId}?preview=message#d=${encodeGreeting(creation.greeting)}`} target="_blank"><ExternalLink/> Receiver preview</Link><button onClick={()=>copyLink(creation)}><Copy/>{copied===creation.id?"Copied":"Copy share link"}</button><button onClick={()=>{duplicateCreation(creation.id);setOpen(null)}}><FilePlus2/> Duplicate</button><button onClick={()=>rename(creation)}><Pencil/> Rename</button><button className="danger" onClick={()=>remove(creation)}><Trash2/> Delete</button></motion.div>}</AnimatePresence></motion.article>)}</div>}
    </section></main>
}
