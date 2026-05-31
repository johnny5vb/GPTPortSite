# Carman Creative — carmancreative.com

Portfolio + agency site for John Carman. Next.js 16 + Tailwind v4 +
framer-motion, deployed to Netlify at **https://www.carmancreative.com**.

**Read [`PROJECT.md`](./PROJECT.md) first** — it covers brand, content,
components, accessibility decisions, and deployment.

## Run locally

```bash
npm install
npm run dev          # dev server with Turbopack
npm run build        # production build into .next/
npm start            # serve production build on :3000
```

## Deploy

```bash
npm run build
netlify deploy --prod --dir=.next
```

Netlify site: `carman-creative`. Domain DNS lives at WordPress.com (apex A
record + www CNAME to `carman-creative.netlify.app`).
