# WishVerse

WishVerse is a browser-first interactive gifting platform built with Next.js 16, React 19, TypeScript and Framer Motion. It turns letters, photos, flowers, songs, dates and small surprises into receiver-first experiences shared through one private link.

## Run locally

From `D:\wishverse`, the single PowerShell command is:

```powershell
npm.cmd install; npm.cmd run dev
```

Open [http://localhost:3000](http://localhost:3000). To use a different port:

```powershell
npm.cmd run dev -- --port 3001
```

## Production check and run

```powershell
npm.cmd run check; npm.cmd run start
```

`npm run start` serves the optimized build at port 3000. Set `NEXT_PUBLIC_SITE_URL` to the public HTTPS origin before building a deployment.

## Product routes

- `/` — scrapbook marketing experience.
- `/templates` — searchable and filterable discovery for 21 experience types.
- `/create/[experience]` — adaptive creator with unique controls and a matching live canvas.
- `/my-creations` — device-local drafts and published links, with edit, rename, duplicate and delete.
- `/gift/[publicId]#d=…` — no-index receiver route carrying the browser-first private payload.
- `/privacy`, `/terms`, `/about`, `/contact`, `/report` — product and safety information.

## Working experience types

Open When Letters, Memory Scrapbook, Camera Roll, Flower Bouquet, Digital Newspaper, Memory Book, Coffee Date, Favorite Place, Typewriter Letter, Surprise Gift Box, Memory Film, Birthday Celebration, Chocolate Box, Song Dedication, Video Message, Compliment Jar, Digital Coupons, Future Date, Secret Message Puzzle, Memory Timeline and Create From Scratch.

Each has its own controls, live preview and receiver interaction. Uploaded JPG, PNG, WebP and GIF files are validated up to 8 MB and compressed in the browser. Optional audio never autoplays. Share actions include copy, receiver preview, WhatsApp, email, Web Share and downloadable QR.

## Browser-first data model

This repository intentionally works without fake accounts or a pretend backend:

- drafts and favorites live in versioned `localStorage` on the current device;
- opaque draft and public IDs use browser cryptography;
- text, settings and compressed images are encoded in the URL fragment, which is not sent in normal HTTP requests;
- direct HTTPS media URLs are supported where the creator explicitly provides them;
- the Favorite Place template identifies its map as illustrated until a real provider is configured.

The tradeoff is that links can become long, browser data can be cleared, and shared links cannot be revoked. Do not treat this mode as durable storage for irreplaceable memories.

## Production deployment

1. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL`.
2. Run `npm.cmd run check` and `npm.cmd audit`.
3. Deploy to a Node.js 20.9+ host such as Vercel, or run `npm.cmd run start` behind HTTPS.
4. Before enabling public accounts or large media, implement the database, signed object-storage, revocation, expiry, moderation and scheduled-delivery adapters described in [`docs/EXPERIENCE_UPGRADE_PLAN.md`](docs/EXPERIENCE_UPGRADE_PLAN.md).

The current map, database, authentication, storage and email environment names are documented in `.env.example`; only the site URL is consumed by the browser-first slice.

## Verification

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd audit
```

The global styles include keyboard focus states and reduced-motion handling. Gift pages are excluded from indexing, and the app includes metadata, a manifest, robots rules, a sitemap, custom loading/error states and a 404.
