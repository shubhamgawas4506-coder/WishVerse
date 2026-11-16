import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function NotFound(){return <main className="status-page"><Sparkles/><small>404 · LOST BETWEEN THE PAGES</small><h1>This little world<br/>couldn’t be found.</h1><p>The link may have moved, or the experience name may be incomplete.</p><div><Link href="/templates">Browse experiences</Link><Link href="/">Go home</Link></div></main>}
