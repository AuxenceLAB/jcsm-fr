# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JCSM is a static website for an electric vehicle charging infrastructure (IRVE) company. It includes a public marketing site, an internal technician portal (`interne.html`), and a PHP API layer. No build step — HTML/CSS/JS served directly by Apache.

**Stack**: Vanilla JS (ES6+), Tailwind CSS (CDN), PHP 7.4+, Google Sheets integration, Leaflet.js maps, PWA (Service Worker).

## Architecture

### Frontend

- **Public pages**: All HTML files at root. Pages share the same structure (preloader → nav → content → footer). Tailwind loaded via CDN with inline config in each HTML page.
- **Internal portal**: `interne.html` — password-protected dashboard for technicians. Auth via server-side HMAC-SHA256 token (`api/login.php`), sessions stored in localStorage (8h TTL).
- **Regional pages**: `zones/*.html` — zone-specific landing pages with skip-link, `id="main-content"` on `<main>`, and LocalBusiness schema (HQ address Paris 75008 + regional `areaServed`).
- **CSS**: `styles.css` — custom design system with 90+ CSS variables defined in `:root`. Tailwind utilities used alongside custom classes. Dark mode is disabled (light mode forced).
- **PWA**: `manifest.json` + `sw.js` (cache v12). Strategies: network-first for HTML/API, cache-first for assets.

### JavaScript Modules (`js/`)

| File | Role |
|------|------|
| `config.js` | API endpoints (all server-side proxied), auth helpers (session CRUD, Bearer token headers), cache TTLs. Version 2.3.0. |
| `public.js` | All public page effects: mobile menu, particles (8 on mobile, 20 desktop), scroll animations, cookie consent, magnetic buttons, form validation, toast notifications (XSS-safe via `textContent`), rAF counters with `aria-label`. Skips magnetic/spotlight/hover if `wow-effects.js` is loaded. |
| `app.js` | Internal portal (legacy reference): auth check, data fetch (proxy-sheets → localStorage cache → offline), interventions list, report generation. Race-condition-safe (JSON compare before re-render). |
| `wow-effects.js` | Premium animation classes: AnimatedCounter, ScrollProgress, LogoMarquee, TextSplit, ParallaxSection. Respects `prefers-reduced-motion`. Style injection with `id="jcsm-wow-styles"` dedup guard. |
| `map.js` | Leaflet map integration with geocoded intervention markers. Uses centralized `window.escapeHtml()`. Filters Null Island (0,0) coordinates. |
| `analytics.js` | Privacy-first analytics (no cookies, localStorage-based) |
| `utils.js` | Centralized `window.escapeHtml()`, toast notifications (XSS-safe), safe localStorage, date formatting (fr-FR) |
| `dashboard.js` | Dashboard stats widgets. ISO month keys (`2024-01`) for chronological chart sorting. |
| `fiches.js` | Method cards CRUD. Uses centralized `window.escapeHtml()`. |
| `landing.js` | Landing page contact form logic (Formspree) |

### Backend (`api/`)

PHP JSON APIs with CORS restricted to `jcsm.fr` and `www.jcsm.fr` only. File-based storage (JSON files, no database). All endpoints require HMAC token auth via `auth.php` (except `login.php`).

| File | Role |
|------|------|
| `auth.php` | Shared auth module. HMAC-SHA256 token validation. Requires `JCSM_AUTH_SECRET` env var (fails hard if missing). Rate limiting via file-based IP tracking. |
| `login.php` | Login endpoint. Returns `{ success, role, isAdmin, token }`. No auth required (public). |
| `interventions.php` | CRUD for interventions. Auth required on all methods. Uses `random_bytes()` for IDs. |
| `fiches.php` | Method cards with image upload. Auth required. Uses `SITE_HOST` constant (no `$_SERVER['HTTP_HOST']`). |
| `save-rapport.php` | Report generation (JSON + HTML + DOCX/RTF). Auth required. Full HTML report with header, info grid, sections, photos, footer. |
| `list-rapports.php` | Report listing. Auth required. |
| `proxy-sheets.php` | Server-side proxy to Google Apps Script. Auth required. Whitelisted GET params (`action`, `region`, `id`, `sheet`). Google Sheets URL kept server-side only. |
| `webhook-proxy.php` | Server-side proxy for n8n webhooks. Auth required. Accepts `type` (rapport/paiement/sms/notification). n8n URLs never exposed to frontend. |

**CORS policy**: All API files use the same pattern — only `https://jcsm.fr` and `https://www.jcsm.fr` are allowed. No wildcard, no `null`, no `localhost`. OPTIONS returns 204.

### Data Flow

Config loads → check auth (Bearer token) → fetch data via `proxy-sheets.php` (Google Sheets → localStorage cache with JSON diff → local JSON fallback → offline mode with message) → render UI → attach event listeners.

## Development

### No build system

Edit HTML/CSS/JS files directly. Changes are live on the Apache server. Cache-bust by hard-refreshing (Ctrl+Shift+R).

### Deployment

- Apache with `mod_rewrite`, `mod_headers`, `mod_deflate`
- HTTPS enforced via `.htaccess` (301 redirect)
- Pretty URLs: `.html` extension removed via rewrite rules
- Security headers configured in `.htaccess`
- `www-data` ownership needed on `api/` and report directories
- **Required env var**: `JCSM_AUTH_SECRET` must be set in server environment (Apache `SetEnv` or `.env` loaded by PHP). All API endpoints will fail 500 if missing.

### Git

- Single branch: `master`
- Remote: `origin` on GitHub
- Push: `git push origin master`

### Service Worker

After CSS/JS changes, bump the cache version in `sw.js` (lines 2-5: `CACHE_NAME`, `STATIC_CACHE`, `DYNAMIC_CACHE`, `API_CACHE`) to invalidate old caches. Current version: **v12**.

Also bump `version` in `js/config.js`. Current: **2.3.0**.

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

Six pages linked from the main site for local SEO:
- `auvergne-rhone-alpes.html`, `hauts-de-france.html`, `ile-de-france.html`, `nouvelle-aquitaine.html`, `occitanie.html`, `paca.html`
- Same HTML structure as root pages but with `../images/` paths for assets
- Each includes: skip-link, `id="main-content"` on `<main>`, LocalBusiness schema with HQ address (Paris 75008) and regional `areaServed` with `geoMidpoint`
- No `<meta name="keywords">` (removed — obsolete for SEO)

## Contact Form (Important Gotcha)

The contact form (`#contactForm` in `index.html`) uses **Formspree** (`https://formspree.io/f/xyzpgqga`) and is handled exclusively by `js/landing.js`.

**`public.js` explicitly excludes `#contactForm`** from `initFormValidation()` and `initButtonLoadingStates()` to avoid handler conflicts. If adding a new form, this exclusion only applies to `#contactForm`.

The submit button uses `.submit-text` / `.submit-loading` spans for loading state.

## Cache Configuration (`.htaccess`)

| Type | Duration |
|------|----------|
| Images (jpg, png, svg, webp) | 1 month |
| Fonts (woff, woff2) | 1 year |
| CSS / JS | 1 week |
| JSON / XML | 1 day |
| HTML | 1 hour |
| PHP | No cache (must-revalidate) |

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

### Headers (`.htaccess`)

`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection`, `HSTS` (1 year + preload), `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, `Referrer-Policy`, `Permissions-Policy` (blocks geolocation, microphone, camera, payment).

**CSP**: `default-src 'self'`; scripts from self + Tailwind CDN + unpkg + jsdelivr + Google Analytics; styles from self + Google Fonts + unpkg; connect to self + Formspree + Google Scripts + Nominatim + Google Analytics; no frames; no objects.

Protected files: `.env`, `*.json`, `*.sql`, `*.sh`, `.git/`, backups, composer files. Directory listing disabled.

### XSS Prevention

- Centralized `window.escapeHtml()` in `utils.js` — used by `map.js`, `fiches.js`, `app.js`
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
