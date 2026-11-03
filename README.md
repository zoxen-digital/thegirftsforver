# TheGiftsForever

One GitHub repo, two Next.js (App Router) apps sharing one MongoDB database:

| Folder   | What                        | Domain                         |
| -------- | --------------------------- | ------------------------------ |
| `web/`   | Storefront (customer site)  | `thegiftsforever.com`          |
| `admin/` | Admin panel                 | `admin.thegiftsforever.com`    |

Images uploaded from the admin are stored **inside MongoDB** (`StoredUpload` collection) and served from
`/api/uploads/<folder>/<file>` by both apps, so they survive Vercel redeploys (no disk writes).

## Local setup

```bash
cd admin && npm install && cp .env.example .env.local   # fill in values
cd ../web && npm install && cp .env.example .env.local  # same MONGODB_URI / MONGODB_DB
```

Seed demo content (categories, 44 products, slider, reviews, blogs, pages, inventory):

```bash
cd admin && npm run seed            # only when the catalog is empty
cd admin && npm run seed -- --fresh # wipe catalog/content and reseed (orders & uploads kept)
```

Run: `npm run dev` in `web/` (port 3000) and in `admin/` (port 3001).

## Deploy on Vercel (two projects, same repo)

1. Push this repo to GitHub.
2. Vercel → **Add New Project** → import the repo → set **Root Directory = `web`** → add env vars from `web/.env.example` → deploy → add domain `thegiftsforever.com`.
3. Vercel → **Add New Project** again → same repo → **Root Directory = `admin`** → add env vars from `admin/.env.example`
   (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, a long random `ADMIN_SECRET`, `NEXT_PUBLIC_SITE_URL=https://thegiftsforever.com`) → deploy → add domain `admin.thegiftsforever.com`.
4. In MongoDB Atlas → Network Access, allow `0.0.0.0/0` (Vercel uses dynamic IPs).

Both projects must use the **same** `MONGODB_URI` and `MONGODB_DB`.

## Admin sections

Dashboard (counts, date-filtered delivered/confirmed/cancelled revenue, net profit, revenue & order graphs) ·
Products (variations, gallery, SEO, custom forms, duplicate) · Categories (+ sort & home sort) · Blogs ·
Content Pages · Slider · Orders (11 statuses, view, add/edit, new-order chime) · Inventory (stock adjust + logs) ·
Fields & Forms (custom product inputs shown on the storefront) · Category / Google / WhatsApp Reviews · Tags · Websites.
