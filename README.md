# Plaksha Campus Navigator 🗺️

> **Smart Visual Navigation System** for Plaksha University — QR-enabled, GPS-tracked, and beautifully designed.

A fully interactive campus wayfinding app built by **Alpha Squad (Group 2)** for the IPM 2025 project at Plaksha University, Mohali. Students, faculty and visitors can scan a QR code at any campus checkpoint to instantly know where they are, then get color-coded, turn-by-turn walking directions to any building.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗺️ **SVG Campus Map** | Hand-crafted dark-mode campus map with football pitch markings, volleyball courts, asphalt roads, and per-building footprints |
| 📍 **Real GPS Navigation** | Live browser GPS tracking — the map auto-zooms and follows you as you walk. No animation, no simulation |
| 📱 **QR Check-in** | Scan a campus QR sticker to snap your position instantly — no typing required |
| 🔵 **Turn-by-Turn Directions** | Immersive step-by-step overlay with distance, ETA and the next maneuver |
| 🧠 **Dual Pathfinding** | Toggle between **Dijkstra** and **A\*** algorithms in real-time and compare results |
| 🎨 **Color-coded Routes** | Fastest (blue) · Accessible (green) · Scenic (amber) |
| 🏢 **Building Intelligence** | Tap any building for photos, floor count, departments, facilities and quick directions |
| 📊 **Live Analytics Dashboard** | Real-time Supabase-backed charts — navigation sessions, QR scans, popular destinations, device split |
| ♿ **Accessible Routes** | Step-free paths for wheelchair users and mobility aids |
| 🌙 **Dark / Light Mode** | Full theme toggle with system-aware defaults |

---

## 🖼️ Screenshots

### Campus Map
The SVG map features a realistic dark campus layout with:
- Football field with pitch markings and centre circle
- Volleyball / basketball courts
- Asphalt road network with dashed centre lines
- Per-building footprints (Bharti 15×9, Library 13×8, Auditorium 16×8…)
- Drop shadows, roof highlights and vignette overlay

### Navigation Mode
When you tap **Start Navigation**:
1. GPS is immediately requested
2. The map auto-zooms to 2.8× and centers on your position
3. As you physically walk, the map pans to keep you centered
4. Turn instructions update in real-time from GPS proximity (not a timer)
5. Tap the **Locate** button to re-center if you pan the map

### Analytics Dashboard (`/analytics`)
Live charts powered by Supabase:
- Total navigations, QR scans, building views
- Top destinations bar chart
- Entry method breakdown (QR / GPS / manual)
- Mobile vs desktop split
- Recent sessions list

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) + React 19 (file-based routing) |
| Bundler | Vite 6 |
| Styling | Tailwind CSS v4 + CSS variables (OKLCH color system) |
| Animations | Framer Motion |
| Charts | Recharts |
| Database | Supabase (PostgreSQL + Row Level Security) |
| QR Codes | `qrcode.react` |
| Icons | Lucide React |
| Pathfinding | Dijkstra + A\* (custom implementation) |
| GPS | Browser Geolocation API (`watchPosition`) |
| Maps | Custom hand-drawn SVG (viewBox 0 0 100 100) |
| Language | TypeScript (strict mode) |

---

## 🗂️ Project Structure

```
plaksha-wayfinder/
├── src/
│   ├── components/
│   │   ├── CampusMap.tsx      # Main map component — SVG, GPS, routing UI
│   │   ├── Hero.tsx           # Landing page hero with mini campus map
│   │   ├── Features.tsx       # Features section
│   │   ├── Stats.tsx          # Survey data + bar chart
│   │   ├── Team.tsx           # Team member cards
│   │   ├── Future.tsx         # Roadmap section
│   │   ├── Navbar.tsx         # Scroll-aware navigation bar
│   │   └── Footer.tsx         # Footer with email capture
│   ├── hooks/
│   │   ├── useGPS.ts          # Browser GPS hook (watchPosition)
│   │   └── useTheme.ts        # Dark/light mode toggle
│   ├── lib/
│   │   ├── campus-data.ts     # Buildings, waypoints, edges, Dijkstra/A*
│   │   ├── gps.ts             # GPS → SVG coordinate mapping
│   │   ├── analytics.ts       # Supabase write/read helpers
│   │   └── supabase.ts        # Supabase client + types
│   ├── routes/
│   │   ├── index.tsx          # Landing page
│   │   ├── map.tsx            # Campus map page
│   │   ├── qr.tsx             # QR scanner page
│   │   └── analytics.tsx      # Analytics dashboard
│   └── styles.css             # Tailwind v4 + animations + glassmorphism
├── supabase/
│   └── migrations/
│       └── 20240101000000_plaksha_navigator.sql
└── public/
```

---

## 🏛️ Campus Buildings Mapped

| ID | Name | Category | Floors |
|---|---|---|---|
| `gate02` | Gate 02 · Main Entry | Entry | 1 |
| `h2_girls` | H2 · Girls Hostel | Residence | 9 |
| `h2_boys` | H2 · Boys Hostel | Residence | 9 |
| `dining` | Dining Hall (DJNJH Hall) | Dining | 2 |
| `football` | Football Ground | Sports | — |
| `volleyball` | Volleyball Court | Sports | — |
| `havells` | Havells Research Building | Academic | 6 |
| `bharti` | Bharti Academic Block | Academic | 7 |
| `library` | Asha Mukul Agrawal Library | Academic | 3 |
| `auditorium` | Auditorium | Academic | 1 |
| `hdfc` | HDFC Building | Service | 3 |
| `guest_house` | Guest House | Residence | 2 |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm 10+

### Install & Run

```bash
# Clone the repo
git clone https://github.com/DisturbedSage5840C/plaksha-wayfinder.git
cd plaksha-wayfinder

# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs at **http://localhost:8080**

### Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> **Note:** The app works fully without Supabase — all analytics calls silently no-op when `VITE_SUPABASE_URL` is not set. Only the analytics dashboard will show a "not configured" state.

### Local Supabase (optional)

```bash
# Requires Docker Desktop running
npx supabase start

# Apply the schema + seed data
npx supabase db reset
```

---

## 🗺️ GPS Coordinate System

The campus SVG uses **viewBox 0 0 100 100** (1 unit ≈ 5.5 meters).

Real GPS coordinates are mapped to SVG space using the campus bounding box:

| Bound | Value |
|---|---|
| North | 30.7295° N |
| South | 30.7245° N |
| East | 76.7320° E |
| West | 76.7265° E |

The `gpsToSvg(lat, lng)` function in [`src/lib/gps.ts`](src/lib/gps.ts) handles this conversion. If GPS detects the user is outside this bounding box, status changes to `off_campus` and the map stays at the starting building.

---

## 🧠 Pathfinding Algorithms

Both algorithms operate on the same weighted graph of **12 buildings + 14 waypoints = 26 nodes** and **29 bidirectional edges**. Edge weights are Euclidean distances in SVG units.

**Dijkstra** — classic shortest-path, explores nodes in order of accumulated cost.

**A\*** — heuristic-guided (straight-line distance to goal), typically faster on sparse campus graphs.

Toggle between them live using the **Cpu** button on the map. The route, step count and node count update instantly.

---

## 📊 Database Schema

```sql
-- Navigation sessions
create table navigation_sessions (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz default now(),
  from_building_id      text not null,
  to_building_id        text not null,
  route_distance_meters integer,
  route_walk_time_minutes integer,
  entry_method          text check (entry_method in ('qr_scan','manual_select','gps')),
  completed             boolean default false,
  device_type           text check (device_type in ('mobile','desktop')),
  lat                   double precision,
  lng                   double precision
);

-- QR scan events
create table qr_scan_events (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  node_id    text not null,
  node_label text not null,
  lat        double precision,
  lng        double precision
);

-- Building views
create table building_views (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  building_id   text not null,
  building_name text not null
);
```

All tables have Row Level Security enabled with public insert/select policies (prototype mode).

---

## 🛣️ Roadmap

- [ ] Indoor navigation (floor-by-floor in Bharti, Havells, Library)
- [ ] Real-time parking availability via IoT sensors
- [ ] AI voice assistant ("Where is the Physics Lab?")
- [ ] Full campus QR rollout at every major node
- [ ] Alternate route system with crowd density ranking
- [ ] PWA / installable app for offline map access

---

## 👥 Team — Alpha Squad (Group 2)

| Name | Role |
|---|---|
| **Ali Usman Muhammad** | Product Lead |
| **Shrikant Yadav** | Frontend Engineer |
| **Aaryan Agarwal** | Map & UX Engineer |
| **Utkarsh Khurana** | Systems & QR Lead |

IPM 2025 Project · Plaksha University · Mohali, Punjab

---

## 📄 License

MIT — free to use, modify and deploy.

---

<div align="center">
  Built with ❤️ at Plaksha University · Dark green & cream forever
</div>
