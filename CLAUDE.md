# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JCSM is a static website for an electric vehicle charging infrastructure (IRVE) company. It includes a public marketing site, an internal technician portal (`interne.html`), and a PHP API layer. HTML/CSS/JS served directly by nginx. One local build step: Tailwind CSS is compiled from source via `npm run build:css` into `css/tailwind.css`.

**Stack**: Vanilla JS (ES6+), Tailwind CSS (local build, v3.4, purged), PHP 8.4 (FPM), PostgreSQL (leads), Google Sheets integration, Leaflet.js maps, Twilio (SMS/voice), n8n (webhooks), PWA (Service Worker).

## Architecture

### Frontend

- **Public pages**: All HTML files at root. Pages share the same structure (preloader → nav → content → footer). Tailwind CSS is compiled locally into `css/tailwind.css` and linked from each page.
- **Internal portal**: `interne.html` — password-protected dashboard for technicians. Auth via server-side HMAC-SHA256 token (`api/login.php`), sessions stored in localStorage (8h TTL).
- **Regional pages**: `zones/*.html` — zone-specific landing pages with skip-link, `id="main-content"` on `<main>`, and LocalBusiness schema (HQ address Paris 75008 + regional `areaServed`).
- **Solutions pages**: `solutions/*.html`: segment-specific landing pages (cpo-operateurs, fabricants-bornes, entreprises-flottes, retail-grande-distribution).
- **Multilingual**: `en/`, `de/`, `es/`, `it/`, `nl/`, `pl/`, `pt/`: translated versions of the main marketing pages. Each directory mirrors a subset of root pages. When adding new language directories, update `tailwind.config.js` `content` glob to include them or their classes will be purged.
- **CSS**: `styles.css` — custom design system with CSS variables defined in `:root`. Tailwind utilities used alongside custom classes. Dark mode is disabled (light mode forced).
- **Design system (refonte 2026-06, "Clarté éditoriale B1")**: cream background `#FAFAF7` (`--color-bg`), ink text `#0F1B2D` (`--color-ink`), JCSM blue `#2563EB` accents only (violet/cyan banned), borders `#E3E2DB` (`--color-line`). Fonts: editorial serif **Fraunces**, **self-hosted** (RGPD-safe, no Google CDN) with Georgia/Times fallback via `--font-serif`, for h1-h2 only, weight 400 (`em` inside h1/h2 renders italic blue), h3-h6 in Inter bold, Inter for body (`--font-sans`). The `.woff2` files live in `/fonts/` (latin + latin-ext, normal 400/600 + italic 400/500); `@font-face` declarations are at the top of `css/critical.css` (render-blocking, loaded early); each page `<head>` preloads `/fonts/fraunces-400-latin.woff2` (the h1 weight). No external font dependency, so the CSP stays `font-src 'self'` (no Google allowed). Site is behind Cloudflare; cache-busting via `?v=` invalidates at the edge too. Evolution "Éditorial premium" 2026-06: `.sec-label` carries a gold rule (`#9A7B3F`), `.card-feature` lifts on soft shadow hover, stats use `.stat-serif`, hero photos use `.shot` (badge + floatcard) or `.hero-image-container`. Spec: `docs/superpowers/specs/2026-06-16-refonte-editorial-premium-design.md`. Components: `.card-lead` (ink), `.card-feature` (white+border), `.card-quote`, `.card-cta` (blue, bring own padding), `.sec-label`, `.section-dark` (one per page max, with `.step`), `.section-alt`, pill `.btn-primary`/`.btn-secondary` (border-radius forced via `!important`). Animations kept: scroll fade-in, counters, logo marquee (grayscale logos), scroll progress. Banned: particles, magnetic, spotlight, parallax, splittext, glassmorphism (except nav blur 8px), animated gradients, `bg-gradient-to-*` utilities. Wording rules: "réponse sous 24h ouvrées" (never "4h"), "France entière et Belgique" (never "7 régions"), no Google-rating claims ("4,9/5") or `aggregateRating`. Spec: `docs/superpowers/specs/2026-06-09-refonte-design-editorial-design.md`.
- **Standalone partner/product mockups**: `powerdot.html`, `virta.html`, `evergreen.html` are intentional standalone partner/product mockup pages (noindex, orphaned, not on the shared B1 shell). They are **EXCLUDED from the B1 design-system scope** — they intentionally use their own separate palette, so design audits should not flag them. (All three are `Disallow`ed in `robots.txt`.)
- **`demo/`**: a separate, git-tracked copy of the site; blocked from indexing (`Disallow: /demo/` should cover it) and out of scope for design audits.
- **PWA**: `manifest.json` + `sw.js` (cache v83). Strategies: network-first for HTML/API, cache-first for assets.

### JavaScript Modules (`js/`)

| File | Role |
|------|------|
| `config.js` | API endpoints (all server-side proxied), auth helpers (session CRUD, Bearer token headers), cache TTLs. Version 2.57.0. |
| `public.js` | All public page effects: mobile menu, scroll animations, cookie consent, form validation, toast notifications (XSS-safe via `textContent`), rAF counters with `aria-label`. Skips hover transitions if `wow-effects.js` is loaded. |
| `wow-effects.js` | Animation classes: Counter, ScrollProgress, LogoMarquee. Respects `prefers-reduced-motion`. Style injection with `id="jcsm-wow-styles"` dedup guard. |
| `map.js` | Leaflet map integration with geocoded intervention markers. Uses centralized `window.escapeHtml()`. Filters Null Island (0,0) coordinates. |
| `analytics.js` | Privacy-first analytics (no cookies, localStorage-based) |
| `utils.js` | Centralized `window.escapeHtml()`, toast notifications (XSS-safe), safe localStorage, date formatting (fr-FR) |
| `dashboard.js` | Dashboard stats widgets. ISO month keys (`2024-01`) for chronological chart sorting. |
| `fiches.js` | Method cards CRUD. Uses centralized `window.escapeHtml()`. |
| `landing.js` | Landing page contact form logic (Formspree) |
| `i18n.js` | Language switcher and locale routing for `en/`, `de/`, etc. |

### Server Config Backup (`config/`)

Nginx configs and encrypted `.env` stored in `config/` for disaster recovery. Blocked from web access (`deny all` in nginx). See `config/README.md` for restore instructions.

### Backend (`api/`)

PHP JSON APIs with CORS restricted to `jcsm.fr` and `www.jcsm.fr` only. Mix of file-based JSON storage and PostgreSQL (leads, conversations). Most endpoints require HMAC token auth via `auth.php`; a few (indexnow, twilio webhooks, intervention-link) use alternate schemes as noted.

| File | Role |
|------|------|
| `helpers.php` | Shared utilities: `loadEnvVar()` (reads .env), `checkRateLimit()` (file-based IP rate limiting with flock), `validateTwilioSignature()`, `generateInterventionToken()` / `validateInterventionToken()` (HMAC links), `storeConversationMessage()`. |
| `auth.php` | Shared auth module. HMAC-SHA256 token validation. User hashes loaded from `.env` (`AUTH_HASH_N`). Rate limiting via `helpers.php`. |
| `login.php` | Login endpoint. Returns `{ success, role, isAdmin, token }`. No auth required (public). |
| `interventions.php` | CRUD for interventions. Auth required on all methods. Uses `random_bytes()` for IDs. |
| `fiches.php` | Method cards with image upload. Auth required. Uses `SITE_HOST` constant (no `$_SERVER['HTTP_HOST']`). |
| `save-rapport.php` | Report generation (JSON + HTML + DOCX/RTF). Auth required. Full HTML report with header, info grid, sections, photos, footer. |
| `list-rapports.php` | Report listing. Auth required. |
| `proxy-sheets.php` | Server-side proxy to Google Apps Script. Auth required. Whitelisted GET params (`action`, `region`, `id`, `sheet`). Google Sheets URL kept server-side only. |
| `webhook-proxy.php` | Server-side proxy for n8n webhooks. Auth required. Accepts `type` (rapport/paiement/sms/notification). n8n URLs never exposed to frontend. |
| `ai-reformulate.php` | AI text rewrite tool (auth required). |
| `conversations.php` | Conversation thread CRUD (auth required). Backs `call-logs.php`. |
| `call-logs.php` | Call log listing (auth required). |
| `intervention-link.php` | Public intervention access via HMAC token (no JCSM auth, token is the credential). Used for SMS links sent to technicians. |
| `twilio-incoming-sms.php` | Twilio SMS webhook. Validates Twilio signature (no JCSM auth). |
| `twilio-voice-twiml.php` | Twilio voice TwiML endpoint. Validates Twilio signature. |
| `twilio-voice-token.php` | Twilio Voice SDK token generator (auth required). |
| `twilio-proxy.php` | Twilio REST API proxy (auth required). |
| `indexnow.php` | **CLI-only** URL submission to Bing/Yandex IndexNow. Not a web endpoint. The IndexNow key is public by design (served at `/{key}.txt` for verification). |

**CORS policy**: All web-exposed API files use the same pattern: only `https://jcsm.fr` and `https://www.jcsm.fr` are allowed. No wildcard, no `null`, no `localhost`. OPTIONS returns 204.

### Data Flow

Config loads → check auth (Bearer token) → fetch data via `proxy-sheets.php` (Google Sheets → localStorage cache with JSON diff → local JSON fallback → offline mode with message) → render UI → attach event listeners.

## Development

### Build step (Tailwind only)

Edit HTML/CSS/JS files directly; they are live on the nginx server. The only build step is Tailwind CSS:

```
npm run build:css   # one-shot purge + minify into css/tailwind.css
npm run watch:css   # rebuild on changes
```

Cache-bust by hard-refreshing (Ctrl+Shift+R). When adding a new language directory or HTML folder, update the `content` glob in `tailwind.config.js` so its classes are preserved.

### Deployment

- **nginx** 1.26+ with PHP 8.4-FPM (socket: `/run/php/php8.4-fpm.sock`)
- HTTPS enforced via 301 redirect (Certbot-managed SSL)
- HTTP/2 enabled (`http2 on;`)
- Pretty URLs: `try_files $uri $uri.html $uri/ =404` (no `.html` extension needed)
- Security headers in `/etc/nginx/snippets/security.conf` (included in all location blocks that use `add_header`)
- Global headers also loaded via `/etc/nginx/conf.d/security.conf`
- `.htaccess` is present but **ignored by nginx** — all rules must be in nginx config
- `www-data` ownership needed on `api/` and `rapports/` directories
- `.env` must be `640 auxence:www-data` for PHP-FPM to read it
- **Required env var**: `JCSM_AUTH_SECRET` must be set in `.env` (loaded by PHP). All API endpoints will fail 500 if missing.

### Git

- Single branch: `master`
- Remote: `origin` on GitHub
- Push: `git push origin master`

### Service Worker

After CSS/JS changes, bump the cache version in `sw.js` (lines 1-4: comment + `STATIC_CACHE`, `DYNAMIC_CACHE`, `API_CACHE`) to invalidate old caches. Current version: **v83**.

Also bump `version` in `js/config.js`. Current: **2.57.0**.

HTML pages also carry `?v=NN` cache-buster query strings on their CSS/JS links (~149 files). After significant CSS/JS changes, bump them too: `grep -rln '?v=NN' --include='*.html' . | grep -v '^./demo' | xargs sed -i 's/?v=NN/?v=MM/g'`. Keep this number in sync with the sw.js version.

## Authentication

Server-side HMAC-SHA256 token authentication via `api/login.php` → `api/auth.php`.

| Role | Access |
|------|--------|
| **Admin** | Full dashboard, all regions, user management |
| **Technician** | Filtered by region, interventions only |

- Auth flow: `login.php` verifies password → returns HMAC token → stored in `localStorage` as `jcsm_auth_session` with 8h TTL
- All API calls include `Authorization: Bearer <token>` header via `getAuthHeaders()`
- `destroySession()` clears all auth + cache data on logout
- Passwords are verified server-side only (no client-side hash comparison)

## Regional Pages (`zones/`)

Eight pages linked from the main site for local SEO (the seven French regions plus `france.html` and `belgique.html`):
- `france.html`, `auvergne-rhone-alpes.html`, `hauts-de-france.html`, `ile-de-france.html`, `nouvelle-aquitaine.html`, `occitanie.html`, `paca.html`, `belgique.html`
- Same HTML structure as root pages but with `../images/` paths for assets
- Each includes: skip-link, `id="main-content"` on `<main>`, LocalBusiness schema with HQ address (Paris 75008) and regional `areaServed` with `geoMidpoint`, `og:site_name`
- No `<meta name="keywords">` (removed — obsolete for SEO)

### SEO Structure (all pages)

- All pages have `og:site_name` meta tag ("JCSM - Infrastructure de Recharge")
- Service pages + a-propos + carrieres have BreadcrumbList schema (Accueil → Page)
- Service pages have enriched Service schema with `url`, `image`, `category`
- Contact form inputs have `sr-only` labels and `autocomplete` attributes for accessibility

## Contact Form (Important Gotcha)

The contact form (`#contactForm` in `index.html`) uses **Formspree** (`https://formspree.io/f/xyzpgqga`) and is handled exclusively by `js/landing.js`.

**`public.js` explicitly excludes `#contactForm`** from `initFormValidation()` and `initButtonLoadingStates()` to avoid handler conflicts. If adding a new form, this exclusion only applies to `#contactForm`.

The submit button uses `.submit-text` / `.submit-loading` spans for loading state.

## Cache Configuration (nginx)

| Type | Duration | Cache-Control |
|------|----------|---------------|
| Images (jpg, png, svg, webp, ico) | 1 month (2592000s) | `public, immutable` |
| Fonts (woff, woff2, ttf, otf) | 1 year (31536000s) | `public, immutable` |
| CSS / JS | 1 week (604800s) | `public, immutable` |
| HTML (pretty URLs) | 1 hour (3600s) | `public` |
| PHP | No cache | `no-cache, no-store, must-revalidate` |

## Google Sheets Integration

The internal portal fetches intervention data from Google Sheets via a chain:
1. Frontend calls `/api/proxy-sheets.php` (Google Sheets URL is **server-side only**, not exposed in `config.js`)
2. `proxy-sheets.php` validates auth + whitelisted params, forwards to Google Apps Script
3. The Apps Script reads/writes a Google Sheet and returns JSON
4. Fallback: if Sheets API fails → local `api/interventions.json`
5. Fallback: if local API fails → localStorage cached data (with JSON diff to avoid unnecessary re-renders)
6. Fallback: if no cache → offline mode with explicit message

The Google Apps Script source is in `scripts/google_apps_script.js`. It must be deployed as a Google Apps Script web app with "Anyone" access.

## Webhook Integration

n8n webhook URLs are **never exposed to the frontend**. All webhook calls go through `api/webhook-proxy.php`:
- Frontend sends `{ type: "rapport"|"paiement"|"sms"|"notification", data: {...} }` to `/api/webhook-proxy.php`
- The proxy maps `type` to the actual n8n URL (stored server-side only) and forwards the request
- Auth required on all webhook proxy calls

## Security

### Headers (nginx)

All 9 security headers configured in `/etc/nginx/snippets/security.conf`, included in every location block:

`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection`, `HSTS` (1 year + includeSubDomains + preload), `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (blocks geolocation, microphone, camera, payment, usb, magnetometer, gyroscope, accelerometer).

**CSP**: `default-src 'self'`; scripts from self + Tailwind CDN + unpkg + jsdelivr + Google Analytics; styles from self + Google Fonts + unpkg; fonts from self + Google Fonts; images from self + data: + CartoDB + OSM + Unsplash; connect to self + Formspree + Google Scripts + Nominatim + Google Analytics; no frames; no objects.

Protected files (nginx `deny all`): dotfiles, `.env`, `*.sql`, `*.sh`, `*.log`, `/api/*.json`. Directory listing disabled (nginx default).

### XSS Prevention

- Centralized `window.escapeHtml()` in `utils.js` — used by `map.js`, `fiches.js`, `interne.html`
- Toast notifications use `textContent` (not `innerHTML`) in both `utils.js` and `public.js`
- PHP APIs use `htmlspecialchars()` for HTML output, `json_encode()` for JSON

### API Security

- **CORS**: Only `https://jcsm.fr` and `https://www.jcsm.fr` (no wildcard, no `null`, no localhost)
- **Auth**: All endpoints require Bearer token (except `login.php`)
- **Rate limiting**: File-based IP tracking in `auth.php`
- **No Host header injection**: `fiches.php` uses `SITE_HOST` constant
- **Input validation**: Whitelisted params in `proxy-sheets.php`, date format validation in `save-rapport.php`
- **Fail-fast**: `auth.php` refuses to start if `JCSM_AUTH_SECRET` env var is missing

## Key Conventions

- **Language**: All UI text is in French. Code comments mix French and English.
- **Dark mode**: Disabled. Light mode is forced (`public.js` removes `.dark` class).
- **Images** are in `images/`. Partner logos use `mix-blend-mode: multiply` for transparent appearance on white backgrounds. Below-the-fold images use `loading="lazy"`.
- **New pages** should copy the HTML structure from an existing page (preloader with `role="status" aria-label="Chargement"`, skip-link, nav, content sections, footer, script tags).
- **Animation accessibility**: `wow-effects.js` respects `prefers-reduced-motion`. Counters have `aria-label` with final values.
- **Duplicate effect prevention**: `public.js` checks for `#jcsm-wow-styles` before initializing magnetic buttons, spotlight cards, and hover transitions (already handled by `wow-effects.js`). Style injections use unique `id` attributes to prevent duplicates.
- **API CORS**: Restricted to `jcsm.fr` and `www.jcsm.fr` only. No dev origins in production.
- **Formspree**: Contact form endpoint. If emails stop arriving, check the Formspree dashboard.
