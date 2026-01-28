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

## Key Conventions

- **Language**: All UI text is in French. Code comments mix French and English.
- **Auth passwords** are SHA-256 hashed in `js/config.js`. Two roles: Admin and Technician.
- **Images** are in `images/`. Partner logos use `mix-blend-mode: multiply` for transparent appearance on white backgrounds.
- **New pages** should copy the HTML structure from an existing page (preloader, nav, content sections, footer, script tags).
- **Animation accessibility**: `wow-effects.js` respects `prefers-reduced-motion`.
- **API CORS**: Restricted to `jcsm.fr`, `www.jcsm.fr`, `localhost:3000`.
