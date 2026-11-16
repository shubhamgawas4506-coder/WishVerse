"use client";
import Link from "next/link";
import { RotateCcw, Sparkles } from "lucide-react";
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){return <main className="status-page"><Sparkles/><small>SOMETHING CAME UNTAPED</small><h1>That page needs<br/>one more try.</h1><p>Your locally saved drafts should still be waiting.</p><div><button onClick={reset}><RotateCcw/> Try again</button><Link href="/my-creations">My creations</Link></div></main>}
