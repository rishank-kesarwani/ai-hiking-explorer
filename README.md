# AI Hiking Explorer 🌲⛰️

[![CI Pipeline](https://github.com/rishank-kesarwani/ai-hiking-explorer/actions/workflows/ci.yml/badge.svg)](https://github.com/rishank-kesarwani/ai-hiking-explorer/actions/workflows/ci.yml)
[![Production Backend](https://img.shields.io/badge/Render-Backend-46E3B7?logo=render)](https://render.com)
[![Production Frontend](https://img.shields.io/badge/Vercel-Frontend-000000?logo=vercel)](https://hiking-explorer.rishankkesharwani.com)

**AI Hiking Explorer** is a production-grade outdoor expedition discovery, meteorological risk intelligence, and AI trip planning platform. Built with a resilient **NestJS** backend (MongoDB 2dsphere + Redis) and a modern **Next.js** App Router frontend with an outdoor luxury design system.

---

## 🧭 Live Deployments & Architecture

- **Frontend Domain:** [hiking-explorer.rishankkesharwani.com](https://hiking-explorer.rishankkesharwani.com) (Deployed on **Vercel**)
- **Backend API:** [Render](https://render.com) Web Service
  - **Root Directory:** `/backend`
  - **Build Command:** `npm install && npm run build`
  - **Start Command:** `npm run start:prod`
  - **Health Check Probe:** `/health` (on `0.0.0.0`)
  - **Swagger Interactive Docs:** `/api/docs`

---

## 🚀 Key Features

### 1. Trail Discovery & Natural Language Search
- **Natural Language Parsing:** Search using free-text prompts like:
  - *"Easy hikes near Delhi for beginners"*
  - *"Find a scenic 5 km hike with waterfalls"*
  - *"Best sunrise hikes this weekend"*
  - *"Show moderate hikes with camping allowed"*
- **Multifaceted Filters:** Region, difficulty (Easy, Moderate, Hard, Expert), distance slider, elevation slider, duration, and terrain filters.
- **Geospatial Trailhead Search:** Uses MongoDB `2dsphere` spatial indexing (`$nearSphere`) and browser GPS to calculate straight-line distances to trailheads.
- **Suitability Attributes:** Verified tags for dog-friendly, family-friendly, waterfalls, scenic views, sunrise/sunset, and overnight camping.

### 2. Meteorological Forecasts & Safety Hazards
- **Live Provider Integration:** Real-time weather integration via Open-Meteo with resilient fallback to verified meteorological simulators.
- **Automated Hazard Detection:** Real-time warnings for extreme heat (>38°C), freezing temperatures (<0°C), severe ridge wind gusts (>45 km/h), lightning, and torrential rain.
- **Informational Safety Disclaimers:** Explicit outdoor activity guidance; trail conditions and AI recommendations are identified as guidance and never presented as authoritative safety guarantees.

### 3. AI Expedition Intelligence
- **Paced Itinerary Generator:** Generates step-by-step milestones adjusted for hiker aerobic fitness levels (Beginner, Intermediate, Advanced, Expert).
- **Hydration & Calorie Calculator:** Computes estimated water requirements (liters) and energy burn based on trail elevation gain, ambient temperature, and duration.
- **Dynamic Packing & Gear Checklist:** Generates tailored gear checklists based on trail distance, elevation, weather, overnight camping status, and canine companions.
- **Difficulty Reasoning & Fitness Match:** Explains why a trail is rated at its difficulty level and highlights potential challenge factors.

### 4. User Experience & Optional Authentication
- **Guest Access:** Browse, search, view elevation graphs, test weather forecasts, and generate temporary hiking plans without mandatory sign-in.
- **Modal-Driven Auth UX:** In-page modal for login and registration without disruptive global redirects when bookmarking favorites or saving plans.
- **JWT Session Security:** Access tokens (15m) + refresh tokens (7d) with concurrency-safe single refresh attempt, avoiding infinite 401 loops.
- **Offline Resilience:** Real-time network detection and offline indicators.

---

## 🛠️ Sports Tracker Engineering Baseline Compliance

This project incorporates the 28 production fixes from the Sports Tracker baseline:

| # | Production Requirement | Implementation Details |
|---|---|---|
| 1 | `process.env.PORT` | Configured with fallback `4000` in `main.ts` and `configuration.ts` |
| 2 | `0.0.0.0` Host Binding | Configured via `await app.listen(port, '0.0.0.0')` for container & Render compatibility |
| 3 | `GET /health` | Comprehensive probe returning MongoDB status, Redis mode, uptime, and memory |
| 4 | Render Health Checks | Unprefixed `/health` endpoint responding with HTTP 200 |
| 5 | Explicit CORS | Configured with `FRONTEND_URL`, localhost, custom domains, and credentials |
| 6 | Vercel Origin Config | Regex support for `https://*.vercel.app` preview branches |
| 7 | `REDIS_URL` Support | Native connection parsing for Render Redis URLs (`redis://...`, `rediss://...`) |
| 8 | Redis Host/Port Fallback | Automatic fallback to `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` |
| 9 | Redis Resilience | Backend boots and operates gracefully via `ResilientCacheService` if Redis is offline |
| 10 | Nest Build Dependencies | All required dependencies (`reflect-metadata`, `@nestjs/cli`, `typescript`) properly declared |
| 11 | `tsconfig.build.json` | Excludes test files (`**/*spec.ts`) during production compilation |
| 12 | Runtime Cookie-Parser | Universal import handling `cookieParser.default || cookieParser` |
| 13 | Swagger Documentation | Mounted at `/api/docs` with Bearer authentication |
| 14 | Global Validation | `ValidationPipe` with `transform: true, whitelist: true` |
| 15 | Helmet Security | Security headers with CSP configured to permit Swagger UI |
| 16 | Consistent Error Format | Global `HttpExceptionFilter` producing `{ statusCode, message, error, timestamp, path }` |
| 17 | URL Normalization | Base URL sanitizer stripping trailing slashes and handling `/api/v1` prefixes |
| 18 | Prevent Duplicate `/api/v1` | Explicit check preventing duplicate `/api/v1/api/v1` in client and routing |
| 19 | Timeout Handling | 15s request timeouts via `AbortController` |
| 20 | Network Error Handling | Friendly error toasts and retry handlers |
| 21 | Cancellation Handling | `AbortSignal` listener support in API client |
| 22 | 401 Refresh Mutex | Request queueing during active refresh; refreshes exactly once |
| 23 | Optional Authentication | `OptionalJwtAuthGuard` allows guests while attaching authenticated users |
| 24 | Protected Routes | `@UseGuards(JwtAuthGuard)` on favorites, saved hikes, user profile |
| 25 | Login-Required Modal | Contextual modal trigger via `requireAuth` preserving user workflow |
| 26 | Automated CI | GitHub Actions testing and building backend and frontend on Node 22 |
| 27 | Jest Test Coverage | 12 test suites covering geospatial, AI, weather, auth, and UI components |
| 28 | Environment Templates | `.env.example`, `backend/.env.example`, and `frontend/.env.example` |

---

## 🖼️ Vercel Image Optimization & Quota Preservation Architecture

To operate within Vercel's included team Image Optimization allowance (5,000 monthly transformations shared across multiple production domains), the frontend implements an engineering strategy that prevents quota exhaustion without sacrificing Core Web Vitals, mobile responsiveness, or visual aesthetics:

### 1. Architectural Strategy
* **Selective Bypassing for Repeated Grids (`TrailCard`)**:
  * Repeated card grids (Discover, Nearby, Recommendations, Featured, Favorites) render up to 30+ items per view.
  * Image sources (`images.unsplash.com`) are already served from an optimized global CDN with fixed query parameters (`auto=format&fit=crop&w=800&q=80`).
  * `TrailCard` uses Next.js `<Image unoptimized={true} />`, completely bypassing Vercel's `/_next/image` transformation charges while retaining responsive aspect ratios, layout stability, and lazy loading.
* **Preserved Optimization for High-Impact LCP Asset (`trails/[slug]`)**:
  * The single above-the-fold Trail Hero Banner retains full Next.js edge optimization with `priority`, `fill`, and responsive `sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1280px"`.
* **Zero-Transformation Vector Assets**:
  * Brand emblem (`HikingLogo.tsx`), browser tab icons (`favicon.svg`, `icon.svg`), and application logo (`logo.svg`) are pure SVGs, incurring zero transformation cost.
* **Edge Cache TTL Extension (`minimumCacheTTL: 2678400`)**:
  * Extended from Next.js 60-second default to **31 days**. Transformed assets are cached at Vercel's edge network, ensuring repeat visitors hit the edge cache (`x-vercel-cache: HIT`) instead of triggering new billable transformations.
* **Variant & Format Bounding**:
  * `formats: ['image/webp']` avoids duplicate parallel AVIF transformations.
  * `deviceSizes: [640, 768, 1080, 1280]` matches `.container` max width (`1280px`), eliminating wasteful 1920, 2048, and 3840 transformations on desktop displays.
  * `imageSizes: [64, 128, 256, 384]` compacts smaller responsive thumbnail buckets.
  * `qualities: [75]` restricts quality permutations.

### 2. Quota-Exceeded Resilience & Multi-Tier Fallbacks
If Vercel's monthly transformation quota is reached (resulting in HTTP 402/500 errors from `/_next/image`) or an external CDN photo is deleted:
1. **Tier 1 (Transformation Failover)**: If `/_next/image` fails, the hero component automatically switches to `unoptimized={true}`, instantly fetching directly from the source CDN.
2. **Tier 2 (Remote Fallback)**: If the primary photo URL returns 404, the component smoothly falls back to a verified remote landscape photo.
3. **Tier 3 (Immutable Local Static Fallback)**: If external networks or CDNs fail entirely, both `TrailCard` and the hero banner fall back to the pre-optimized local vector asset `/images/trail-placeholder.svg`. Broken image boxes are completely prevented.

### 3. Guidelines for Adding New Assets
* **Small Icons & Logos**: Always use inline SVGs, Lucide icons, or static files in `public/` marked `unoptimized`.
* **External Provider Photos**: Where the provider already provides CDN resizing (e.g. Unsplash, Cloudinary, Imgix), use `unoptimized={true}` for list/card views.
* **Hero/Banner Photography**: Use Next.js `<Image />` without `unoptimized`, always specifying accurate `sizes` matching the CSS container, and ensure fallback handlers are attached.
* **Static Graphics**: Place pre-compressed WebP or SVG files in `public/` and serve directly.

---

## 📂 Repository Structure

```
ai-hiking-explorer/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI Workflow
├── backend/                   # NestJS Production Backend
│   ├── src/
│   │   ├── common/            # Filters, Guards, Decorators, Utils
│   │   ├── config/            # Strongly-typed environment configuration
│   │   ├── modules/
│   │   │   ├── ai/            # Natural language search, itinerary & gear engine
│   │   │   ├── auth/          # JWT authentication, refresh rotation
│   │   │   ├── favorites/     # User favorites & saved trips
│   │   │   ├── health/        # Render health check probe
│   │   │   ├── hiking-plans/  # Itinerary plans & packing lists
│   │   │   ├── jobs/          # Resilient background reminder scheduler
│   │   │   ├── notifications/ # Dedicated Notification Service client
│   │   │   ├── redis/         # RedisService & ResilientCacheService
│   │   │   ├── trails/        # 2dsphere geospatial search, OSM & mock providers
│   │   │   ├── users/         # Profiles & hiking preferences
│   │   │   └── weather/       # Open-Meteo provider & hazard warnings
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   └── package.json
├── frontend/                  # Next.js 15 App Router Frontend
│   ├── src/
│   │   ├── app/               # App Router pages (discover, nearby, trails, plan, etc.)
│   │   ├── components/        # ElevationChart, WeatherWidget, TrailCard, LoginModal
│   │   ├── context/           # AuthContext, ToastContext
│   │   ├── lib/               # Normalized API Client, Types
│   │   ├── styles/            # Luxury outdoor design system (Vanilla CSS)
│   │   └── test/              # Frontend Jest unit & component tests
│   ├── next.config.mjs
│   ├── tsconfig.json
│   └── package.json
├── .gitignore
├── .env.example
├── package.json               # Monorepo root scripts
└── README.md
```

---

## ⚡ Getting Started Locally

### Prerequisites
- **Node.js**: v20+ (tested on v22)
- **MongoDB**: Local MongoDB instance or MongoDB Atlas URI
- **Redis** *(optional)*: Local Redis instance (resilient in-memory fallback is active if unavailable)

### 1. Clone & Configure Environment
```bash
git clone https://github.com/rishank-kesarwani/ai-hiking-explorer.git
cd ai-hiking-explorer

# Copy root environment file
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### 2. Install & Run Development Servers
```bash
# Install backend dependencies
cd backend && npm install
# Install frontend dependencies
cd ../frontend && npm install

# Run concurrently from root
cd .. && npm run dev
```
- Backend API running at: `http://localhost:4000`
- Swagger UI at: `http://localhost:4000/api/docs`
- Health check probe: `http://localhost:4000/health`
- Frontend UI running at: `http://localhost:3000`

---

## 🧪 Testing

Run all unit, integration, and component tests:

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd ../frontend && npm test

# Or from root
npm test
```

---

## 📜 Informational Disclaimer
*AI Hiking Explorer is built for outdoor discovery and planning purposes. Hiking involves inherent hazards, sudden meteorological shifts, and physical risks. Trail conditions, routes, and AI itineraries are synthesized approximations. Users should always carry proper gear, verify local park ranger announcements, obey physical trail markings, and never rely solely on digital applications for life safety.*

---

## 👨‍💻 Author
**Rishank Kesarwani**
- Website: [rishankkesharwani.com](https://rishankkesharwani.com)
- GitHub: [@rishank-kesarwani](https://github.com/rishank-kesarwani)
