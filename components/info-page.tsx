import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export function InfoPage({kicker,title,intro,children}:{kicker:string;title:string;intro:string;children:React.ReactNode}){
  return <main className="info-shell">
    <nav className="info-nav"><Link href="/"><Sparkles/> WishVerse</Link><Link href="/templates">Browse experiences</Link></nav>
    <article className="info-paper"><Link className="info-back" href="/"><ArrowLeft/> Back home</Link><small>{kicker}</small><h1>{title}</h1><p className="info-intro">{intro}</p>{children}<footer><span>Created by Shubham Gawas with love ♡</span><Link href="/contact">Questions? Contact Shubham</Link></footer></article>
  </main>
}
