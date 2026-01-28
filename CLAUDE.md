# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JCSM is a static website for an electric vehicle charging infrastructure (IRVE) company. It includes a public marketing site, an internal technician portal (`interne.html`), and a PHP API layer. No build step — HTML/CSS/JS served directly by Apache.

**Stack**: Vanilla JS (ES6+), Tailwind CSS (CDN), PHP 7.4+, Google Sheets integration, Leaflet.js maps, PWA (Service Worker).

## Architecture

### Frontend

- **Public pages**: All HTML files at root. Pages share the same structure (preloader → nav → content → footer). Tailwind loaded via CDN with inline config in each HTML page.
- **Internal portal**: `interne.html` — password-protected dashboard for technicians. Auth via SHA-256 hashing in `js/config.js`, sessions stored in localStorage (8h TTL).
- **Regional pages**: `zones/*.html` — zone-specific landing pages.
- **CSS**: `styles.css` — custom design system with 90+ CSS variables defined in `:root`. Tailwind utilities used alongside custom classes. Dark mode is disabled (light mode forced).
- **PWA**: `manifest.json` + `sw.js` (cache v3). Strategies: network-first for HTML/API, cache-first for assets.

### JavaScript Modules (`js/`)

| File | Role |
|------|------|
| `config.js` | API endpoints, auth (SHA-256 hashing, session management), cache TTLs |
| `public.js` | All public page effects: mobile menu, particles, scroll animations, cookie consent, magnetic buttons, form validation, toast notifications |
| `app.js` | Internal portal: auth check, data fetch (Google Sheets → local JSON fallback), interventions list, calendar, report generation |
| `wow-effects.js` | Premium animation classes: AnimatedCounter, ScrollProgress, LogoMarquee, TextSplit, ParallaxSection |
| `map.js` | Leaflet map integration with geocoded intervention markers |
| `analytics.js` | Privacy-first analytics (no cookies, localStorage-based) |
| `utils.js` | Toast notifications, safe localStorage, date formatting (fr-FR) |
| `dashboard.js` | Dashboard stats widgets |
| `fiches.js` | Method cards CRUD |
| `landing.js` | Landing page contact form logic |

### Backend (`api/`)

PHP JSON APIs with CORS. File-based storage (JSON files, no database).

- `interventions.php` — CRUD for interventions
- `fiches.php` — Method cards with image upload
- `save-rapport.php` — Report generation (JSON + HTML + DOCX/RTF)
- `list-rapports.php` — Report listing
- `proxy-sheets.php` — CORS proxy to Google Apps Script

### Data Flow

Config loads → check auth → fetch data (Google Sheets → localStorage cache → local JSON fallback → offline cache) → render UI → attach event listeners.

## Development

### No build system

Edit HTML/CSS/JS files directly. Changes are live on the Apache server. Cache-bust by hard-refreshing (Ctrl+Shift+R).

### Deployment

- Apache with `mod_rewrite`, `mod_headers`, `mod_deflate`
- HTTPS enforced via `.htaccess` (301 redirect)
- Pretty URLs: `.html` extension removed via rewrite rules
- Security headers configured in `.htaccess`
- `www-data` ownership needed on `api/` and report directories

### Git

- Single branch: `master`
- Remote: `origin` on GitHub
- Push: `git push origin master`

### Service Worker

After CSS/JS changes, bump the cache version in `sw.js` (line 2: `CACHE_VERSION`) to invalidate old caches.

## Authentication

Two roles with SHA-256 hashed passwords in `js/config.js`:

| Role | Access | Passwords |
|------|--------|-----------|
| **Admin** | Full dashboard, all regions, user management | `JCSM2025` / `JCSMADMIN` |
| **Technician** | Filtered by region, interventions only | `technicien` / `JCSM` |

- Auth check: `checkAuth()` in `app.js` reads `jcsm_auth_session` from localStorage
- Session duration: 8 hours, stored as `{ role, timestamp, hash }`
- Login page: `interne.html` shows login form, redirects to dashboard on success

## Regional Pages (`zones/`)

Six pages linked from the main site for local SEO:
- `auvergne-rhone-alpes.html`, `hauts-de-france.html`, `ile-de-france.html`, `nouvelle-aquitaine.html`, `occitanie.html`, `paca.html`
- Same HTML structure as root pages but with `../images/` paths for assets
- Each includes zone-specific content, nav, and footer

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
1. `js/app.js` calls `api/proxy-sheets.php`
2. `proxy-sheets.php` forwards to a **Google Apps Script** web app (deployed as URL)
3. The Apps Script reads/writes a Google Sheet and returns JSON
4. Fallback: if Sheets API fails → local `api/interventions.json`
5. Fallback: if local API fails → localStorage cached data
6. Fallback: if no cache → offline mode

The Google Apps Script source is in `scripts/google_apps_script.js`. It must be deployed as a Google Apps Script web app with "Anyone" access.

## Security Headers (`.htaccess`)

Configured headers: `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `HSTS` (1 year), `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, `Permissions-Policy` (blocks geolocation, microphone, camera, payment).

Protected files: `.env`, `*.json`, `*.sql`, `*.sh`, `.git/`, backups. Directory listing disabled.

## Key Conventions

- **Language**: All UI text is in French. Code comments mix French and English.
- **Dark mode**: Disabled. Light mode is forced (`public.js` removes `.dark` class, CSS dark media query removed).
- **Images** are in `images/`. Partner logos use `mix-blend-mode: multiply` for transparent appearance on white backgrounds.
- **New pages** should copy the HTML structure from an existing page (preloader, nav, content sections, footer, script tags).
- **Animation accessibility**: `wow-effects.js` respects `prefers-reduced-motion`.
- **API CORS**: Restricted to `jcsm.fr`, `www.jcsm.fr`, `localhost:3000`.
- **Formspree**: Contact form endpoint. If emails stop arriving, check the Formspree dashboard.
