// Plaksha University campus data — coordinates aligned with SVG viewBox 0 0 100 100.
// GPS bounding box: North 30.7295, South 30.7245, East 76.7320, West 76.7265.
// 1 SVG unit ≈ 5.5 meters at this campus scale.

import bhartiImg from "@/assets/bharti.jpeg";
import havellsImg from "@/assets/havells.jpeg";
import libraryImg from "@/assets/library.jpeg";
import diningImg from "@/assets/dining.jpeg";
import auditoriumImg from "@/assets/auditorium.jpeg";
import hostelImg from "@/assets/hostel.jpeg";
import sportsImg from "@/assets/sports.jpeg";
import gateImg from "@/assets/gate.jpeg";

export type Category =
  | "academic"
  | "residence"
  | "dining"
  | "sports"
  | "service"
  | "entry";

export type Building = {
  id: string;
  name: string;
  short: string;
  category: Category;
  x: number;
  y: number;
  color: string;
  description: string;
  facilities: string[];
  floors: number;
  departments?: string[];
  image: string;
};

export const buildings: Building[] = [
  {
    id: "gate02",
    name: "Gate 02 · Main Entry",
    short: "G2",
    category: "entry",
    x: 88, y: 12,
    color: "#0ea5e9",
    description:
      "Main campus entrance with security cabin, visitor registration and drop-off zone.",
    facilities: ["Security Cabin", "Visitor Registration", "Drop-off Zone", "EV Parking", "Barrier Gate"],
    floors: 1,
    image: gateImg,
  },
  {
    id: "h2_girls",
    name: "H2 · Girls Hostel",
    short: "H2G",
    category: "residence",
    x: 65, y: 7,
    color: "#ec4899",
    description:
      "Girls residential block with comfortable rooms, study spaces and common lounges.",
    facilities: ["Single Rooms", "Common Room", "Study Pods", "Laundry", "Pantry", "Yoga Room"],
    floors: 9,
    image: hostelImg,
  },
  {
    id: "h2_boys",
    name: "H2 · Boys Hostel",
    short: "H2B",
    category: "residence",
    x: 74, y: 22,
    color: "#3d8b56",
    description:
      "Boys residential block with gaming lounge, study pods and rooftop deck.",
    facilities: ["Single Rooms", "Common Room", "Gaming Lounge", "Laundry", "Study Pods", "Rooftop Deck"],
    floors: 9,
    image: hostelImg,
  },
  {
    id: "dining",
    name: "Dining Hall (DJNJH Hall)",
    short: "DH",
    category: "dining",
    x: 40, y: 18,
    color: "#d4a017",
    description:
      "Main campus dining hall with live counters, beverage bar and outdoor lawn seating.",
    facilities: ["Main Dining Hall", "Live Counter Stations", "Beverage Bar", "Outdoor Lawn Seating", "Tuck Shop", "Catering Services"],
    floors: 2,
    image: diningImg,
  },
  {
    id: "football",
    name: "Football Ground",
    short: "FG",
    category: "sports",
    x: 18, y: 18,
    color: "#e07b39",
    description:
      "Full-size synthetic football turf with floodlights and a surrounding jogging track.",
    facilities: ["Synthetic Football Turf", "Jogging Track", "Floodlights", "Spectator Benches", "Equipment Room"],
    floors: 1,
    image: sportsImg,
  },
  {
    id: "volleyball",
    name: "Volleyball Court",
    short: "VC",
    category: "sports",
    x: 9, y: 32,
    color: "#e07b39",
    description:
      "Outdoor volleyball and basketball courts with shaded seating.",
    facilities: ["Volleyball Court", "Basketball Half-Court", "Shaded Seating", "Net Storage"],
    floors: 1,
    image: sportsImg,
  },
  {
    id: "havells",
    name: "Havells Research Building",
    short: "HRB",
    category: "academic",
    x: 42, y: 40,
    color: "#1f5132",
    description:
      "Flagship 6-floor research tower with advanced labs, faculty offices and the Plaksha innovation hub.",
    facilities: ["Research Labs", "Faculty Offices", "Innovation Hub", "mPH (Multi-Purpose Hall)", "Esports Room", "Seminar Rooms", "Roof Terrace"],
    floors: 6,
    departments: ["Robotics", "AI / ML", "Materials Science", "Climate Tech"],
    image: havellsImg,
  },
  {
    id: "bharti",
    name: "Bharti Academic Block",
    short: "BAB",
    category: "academic",
    x: 56, y: 55,
    color: "#1f5132",
    description:
      "Primary 7-floor academic building with all major classrooms, Makerspace, CTLC and Physics Lab.",
    facilities: ["Lecture Halls (B1–B7)", "Makerspace", "CTLC Studio", "Physics Lab", "Chemistry Lab", "Cafe Lounge", "Design Studios", "Student Council Room"],
    floors: 7,
    departments: ["Computer Science", "Physics", "Mathematics", "Design Engineering"],
    image: bhartiImg,
  },
  {
    id: "library",
    name: "Asha Mukul Agrawal Library",
    short: "LIB",
    category: "academic",
    x: 76, y: 50,
    color: "#2d7a4a",
    description:
      "24/7 library with reading halls, group study rooms, digital archive and a quiet roof deck.",
    facilities: ["Main Reading Hall", "Group Study Rooms (6)", "Digital Archive", "Quiet Zone", "Cafe Corner", "Printing Station", "Roof Deck"],
    floors: 3,
    image: libraryImg,
  },
  {
    id: "auditorium",
    name: "Auditorium",
    short: "AUD",
    category: "academic",
    x: 40, y: 68,
    color: "#7c4dff",
    description:
      "500-seat air-conditioned auditorium for talks, performances, convocations and conferences.",
    facilities: ["500-Seat Hall", "Main Stage", "Green Room", "Professional AV Booth", "Foyer / Pre-function Area", "Breakout Rooms"],
    floors: 1,
    image: auditoriumImg,
  },
  {
    id: "hdfc",
    name: "HDFC Building",
    short: "HDFC",
    category: "service",
    x: 30, y: 62,
    color: "#6366f1",
    description:
      "HDFC bank branch, ATM and administrative office building on the south side of campus.",
    facilities: ["HDFC ATM (24/7)", "Bank Branch", "Admin Offices", "Meeting Rooms", "Reprographics"],
    floors: 3,
    image: havellsImg,
  },
  {
    id: "guest_house",
    name: "Guest House",
    short: "GH",
    category: "residence",
    x: 70, y: 80,
    color: "#8b5cf6",
    description:
      "On-campus guest accommodation for visiting faculty, parents and external delegates.",
    facilities: ["Guest Rooms (AC)", "Lounge", "Kitchenette", "Attached Parking"],
    floors: 2,
    image: hostelImg,
  },
];

// Waypoints — routing-only nodes, not shown as buildings
export type Waypoint = { id: string; x: number; y: number };
export const waypoints: Waypoint[] = [
  { id: "w_gate_entry",       x: 85, y: 15 },
  { id: "w_main_road_n",      x: 72, y: 17 },
  { id: "w_hostel_jct",       x: 70, y: 28 },
  { id: "w_dining_road",      x: 56, y: 22 },
  { id: "w_central_n",        x: 42, y: 30 },
  { id: "w_football_road",    x: 27, y: 20 },
  { id: "w_havells_approach", x: 44, y: 45 },
  { id: "w_central_s",        x: 50, y: 52 },
  { id: "w_bharti_n",         x: 54, y: 48 },
  { id: "w_library_road",     x: 68, y: 52 },
  { id: "w_audi_road",        x: 44, y: 63 },
  { id: "w_hdfc_road",        x: 34, y: 58 },
  { id: "w_south_spine",      x: 55, y: 70 },
  { id: "w_guest_road",       x: 65, y: 74 },
];

// QR Scanner node positions — physical QR stickers on campus
export const qrNodes = [
  { id: "gate02",       label: "Gate 02 · Main Entry",     x: 88, y: 12 },
  { id: "w_central_n", label: "North Campus Junction",     x: 42, y: 30 },
  { id: "w_central_s", label: "South Campus Junction",     x: 50, y: 52 },
  { id: "w_hostel_jct",label: "Hostel Junction",           x: 70, y: 28 },
  { id: "bharti",      label: "Bharti Block · Main Door",  x: 56, y: 55 },
  { id: "havells",     label: "Havells Building · Entry",  x: 42, y: 40 },
  { id: "library",     label: "Library · Main Entrance",   x: 76, y: 50 },
  { id: "auditorium",  label: "Auditorium · Foyer",        x: 40, y: 68 },
  { id: "dining",      label: "Dining Hall · Entrance",    x: 40, y: 18 },
];

// Edge list (bidirectional walking paths)
const edges: [string, string][] = [
  // Gate → main road
  ["gate02",          "w_gate_entry"],
  ["w_gate_entry",    "w_main_road_n"],
  // North road spine
  ["w_main_road_n",   "h2_girls"],
  ["w_main_road_n",   "w_hostel_jct"],
  ["w_hostel_jct",    "h2_boys"],
  ["w_hostel_jct",    "w_dining_road"],
  ["w_dining_road",   "dining"],
  ["w_dining_road",   "w_central_n"],
  // Central north junction
  ["w_central_n",     "w_football_road"],
  ["w_football_road", "football"],
  ["w_football_road", "volleyball"],
  ["w_central_n",     "w_havells_approach"],
  ["w_havells_approach", "havells"],
  ["w_havells_approach", "w_central_s"],
  // Library branch (east)
  ["w_main_road_n",   "w_library_road"],
  ["w_library_road",  "library"],
  ["w_library_road",  "w_central_s"],
  // Central south junction
  ["w_central_s",     "w_bharti_n"],
  ["w_bharti_n",      "bharti"],
  ["w_central_s",     "w_audi_road"],
  ["w_audi_road",     "auditorium"],
  ["w_audi_road",     "w_hdfc_road"],
  ["w_hdfc_road",     "hdfc"],
  ["w_hdfc_road",     "volleyball"],
  // South spine
  ["auditorium",      "w_south_spine"],
  ["w_south_spine",   "w_guest_road"],
  ["w_guest_road",    "guest_house"],
  ["library",         "w_guest_road"],
];

// --- Graph construction ---

type Node = { id: string; x: number; y: number };
const nodeMap: Record<string, Node> = {};
for (const b of buildings) nodeMap[b.id] = { id: b.id, x: b.x, y: b.y };
for (const w of waypoints) nodeMap[w.id] = w;

const adj: Record<string, { to: string; w: number }[]> = {};
for (const [a, b] of edges) {
  const na = nodeMap[a];
  const nb = nodeMap[b];
  if (!na || !nb) continue;
  const d = Math.hypot(na.x - nb.x, na.y - nb.y);
  (adj[a] ??= []).push({ to: b, w: d });
  (adj[b] ??= []).push({ to: a, w: d });
}

// --- Pathfinding ---

export type Algorithm = "dijkstra" | "astar";

function dijkstra(fromId: string, toId: string): string[] {
  if (!nodeMap[fromId] || !nodeMap[toId]) return [];
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited = new Set<string>();
  for (const id of Object.keys(nodeMap)) { dist[id] = Infinity; prev[id] = null; }
  dist[fromId] = 0;
  const queue = new Set(Object.keys(nodeMap));
  while (queue.size) {
    let u: string | null = null;
    let best = Infinity;
    for (const id of queue) if (dist[id] < best) { best = dist[id]; u = id; }
    if (!u || u === toId) break;
    queue.delete(u);
    visited.add(u);
    for (const { to, w } of adj[u] ?? []) {
      if (visited.has(to)) continue;
      const alt = dist[u] + w;
      if (alt < dist[to]) { dist[to] = alt; prev[to] = u; }
    }
  }
  const path: string[] = [];
  let cur: string | null = toId;
  while (cur) { path.unshift(cur); cur = prev[cur]; }
  if (path[0] !== fromId) return [];
  return path;
}

function astar(fromId: string, toId: string): string[] {
  if (!nodeMap[fromId] || !nodeMap[toId]) return [];
  const goal = nodeMap[toId];
  const h = (id: string) => Math.hypot(nodeMap[id].x - goal.x, nodeMap[id].y - goal.y);
  const g: Record<string, number> = {};
  const f: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  for (const id of Object.keys(nodeMap)) { g[id] = Infinity; f[id] = Infinity; prev[id] = null; }
  g[fromId] = 0; f[fromId] = h(fromId);
  const open = new Set([fromId]);
  const closed = new Set<string>();
  while (open.size) {
    let u: string | null = null;
    let best = Infinity;
    for (const id of open) if (f[id] < best) { best = f[id]; u = id; }
    if (!u) break;
    if (u === toId) break;
    open.delete(u); closed.add(u);
    for (const { to, w } of adj[u] ?? []) {
      if (closed.has(to)) continue;
      const tentative = g[u] + w;
      if (tentative < g[to]) {
        prev[to] = u; g[to] = tentative; f[to] = tentative + h(to);
        open.add(to);
      }
    }
  }
  const path: string[] = [];
  let cur: string | null = toId;
  while (cur) { path.unshift(cur); cur = prev[cur]; }
  if (path[0] !== fromId) return [];
  return path;
}

export function findRouteIds(fromId: string, toId: string, algo: Algorithm = "dijkstra"): string[] {
  return algo === "astar" ? astar(fromId, toId) : dijkstra(fromId, toId);
}

export function findRoute(
  fromId: string,
  toId: string,
  algo: Algorithm = "dijkstra",
): { x: number; y: number }[] {
  return findRouteIds(fromId, toId, algo).map((id) => ({ x: nodeMap[id].x, y: nodeMap[id].y }));
}

export function nearestBuildingId(x: number, y: number): string {
  let best = buildings[0].id;
  let bestD = Infinity;
  for (const b of buildings) {
    const d = Math.hypot(b.x - x, b.y - y);
    if (d < bestD) { bestD = d; best = b.id; }
  }
  return best;
}

// --- Turn-by-turn steps ---

export type Step = {
  kind: "start" | "straight" | "left" | "right" | "slight-left" | "slight-right" | "arrive";
  text: string;
  meters: number;
  x: number;
  y: number;
};

function nearestBuildingName(x: number, y: number): string | null {
  let best: Building | null = null;
  let bestD = Infinity;
  for (const b of buildings) {
    const d = Math.hypot(b.x - x, b.y - y);
    if (d < bestD) { bestD = d; best = b; }
  }
  return best && bestD < 12 ? best.name.replace(/\s·.*$/, "") : null;
}

export function buildSteps(fromId: string, toId: string, algo: Algorithm = "dijkstra"): Step[] {
  const ids = findRouteIds(fromId, toId, algo);
  if (ids.length < 2) return [];
  const pts = ids.map((id) => nodeMap[id]);
  const fromBldg = buildings.find((b) => b.id === fromId);
  const toBldg = buildings.find((b) => b.id === toId);
  const steps: Step[] = [{
    kind: "start",
    text: `Head out from ${fromBldg?.name ?? "your location"}`,
    meters: 0,
    x: pts[0].x,
    y: pts[0].y,
  }];
  let segMeters = 0;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];
    // 1 unit ≈ 5.5 meters
    segMeters += Math.hypot(cur.x - prev.x, cur.y - prev.y) * 5.5;
    if (i === pts.length - 1) {
      steps.push({
        kind: "arrive",
        text: `Arrive at ${toBldg?.name ?? "destination"}`,
        meters: Math.round(segMeters),
        x: cur.x,
        y: cur.y,
      });
      break;
    }
    const next = pts[i + 1];
    const a1 = Math.atan2(cur.y - prev.y, cur.x - prev.x);
    const a2 = Math.atan2(next.y - cur.y, next.x - cur.x);
    let diff = ((a2 - a1) * 180) / Math.PI;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    let kind: Step["kind"] = "straight";
    let verb = "Continue straight";
    if (diff > 45) { kind = "right"; verb = "Turn right"; }
    else if (diff > 18) { kind = "slight-right"; verb = "Bear right"; }
    else if (diff < -45) { kind = "left"; verb = "Turn left"; }
    else if (diff < -18) { kind = "slight-left"; verb = "Bear left"; }
    if (kind === "straight") continue;
    const landmark = nearestBuildingName(cur.x, cur.y);
    steps.push({
      kind,
      text: landmark ? `${verb} near ${landmark}` : verb,
      meters: Math.round(segMeters),
      x: cur.x,
      y: cur.y,
    });
    segMeters = 0;
  }
  return steps;
}

export function routeDistance(points: { x: number; y: number }[]): number {
  let d = 0;
  for (let i = 1; i < points.length; i++) {
    d += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  // 1 unit ≈ 5.5 meters
  return Math.round(d * 5.5);
}

export function estimateWalkTime(from: Building, to: Building): number {
  const route = findRoute(from.id, to.id);
  const meters = route.length
    ? routeDistance(route)
    : Math.hypot(from.x - to.x, from.y - to.y) * 5.5;
  // walking ~75 m/min
  return Math.max(1, Math.round(meters / 75));
}

export const routeColors = ["#1d7afc", "#d4a017", "#22c55e", "#7c4dff", "#e07b39"];

export function pathToSvgD(points: { x: number; y: number }[]): string {
  if (!points.length) return "";
  if (points.length < 3) {
    return points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
  }
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

// Expose nodeMap for path network drawing in CampusMap
export { nodeMap, edges };
