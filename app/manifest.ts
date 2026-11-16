import type { MetadataRoute } from "next";
export default function manifest():MetadataRoute.Manifest{return {name:"WishVerse",short_name:"WishVerse",description:"Interactive gifts made with feeling.",start_url:"/",display:"standalone",background_color:"#fbf7ee",theme_color:"#e9a9bd",icons:[{src:"/icon.svg",sizes:"any",type:"image/svg+xml"}]}}
