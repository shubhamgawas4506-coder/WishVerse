import type { MetadataRoute } from "next";
export default function sitemap():MetadataRoute.Sitemap {
  const base=process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000";
  return ["","/templates","/create","/about","/privacy","/terms","/contact"].map((path)=>({
    url:`${base}${path}`,
    lastModified:new Date(),
    changeFrequency:(path===""?"weekly":"monthly") as "weekly"|"monthly",
    priority:path===""?1:path==="/templates"?0.9:0.6,
  }));
}
