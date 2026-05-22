import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navigation2, X, ZoomIn, ZoomOut, Locate, Search, Clock, Footprints,
  Accessibility, MapPin, Compass, Crosshair, Layers, Route as RouteIcon,
  ChevronRight, ArrowUp, ArrowUpLeft, ArrowUpRight, CornerUpLeft, CornerUpRight,
  Flag, Play, Pause, QrCode, Cpu, Wifi, WifiOff, Zap, ArrowRight,
} from "lucide-react";
import {
  buildings, waypoints, qrNodes, nodeMap, edges,
  type Building, findRoute, pathToSvgD, routeDistance,
  buildSteps, type Step, type Algorithm,
} from "@/lib/campus-data";
import { cn } from "@/lib/utils";
import { useGPS } from "@/hooks/useGPS";
import { logNavigationSession, logBuildingView, logQRScan } from "@/lib/analytics";

type EntryMethod = "qr_scan" | "manual_select" | "gps";

type Props = {
  initialFromId?: string;
  initialToId?: string;
  initialEntryMethod?: EntryMethod;
};

// Per-building footprint sizes in SVG units [width, height]
const buildingDims: Record<string, [number, number]> = {
  bharti:      [15, 9],
  havells:     [13, 8],
  library:     [13, 8],
  auditorium:  [16, 8],
  dining:      [13, 8],
  h2_boys:     [11, 8],
  h2_girls:    [11, 8],
  hdfc:        [10, 6],
  guest_house: [12, 7],
  gate02:      [7,  5],
  football:    [9,  6],  // marker only — field rendered as grass area
  volleyball:  [9,  6],  // marker only — court rendered as grass area
};

export function CampusMap({
  initialFromId = "gate02",
  initialToId,
  initialEntryMethod = "manual_select",
}: Props) {
  const [fromId, setFromId] = useState(initialFromId);
  const [toId, setToId] = useState<string | null>(initialToId ?? null);
  const [entryMethod, setEntryMethod] = useState<EntryMethod>(initialEntryMethod);
  const [activeBuilding, setActiveBuilding] = useState<Building | null>(null);
  const [search, setSearch] = useState("");
  const [routeStyle, setRouteStyle] = useState<"fastest" | "accessible" | "scenic">("fastest");
  const [showLabels, setShowLabels] = useState(true);
  const [navMode, setNavMode] = useState(false);
  const [navPlaying, setNavPlaying] = useState(true);
  const [userPos, setUserPos] = useState<{ x: number; y: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const [algorithm, setAlgorithm] = useState<Algorithm>("dijkstra");
  const [qrOpen, setQrOpen] = useState(false);
  const [followGPS, setFollowGPS] = useState(false);

  const { status: gpsStatus, position: gpsPosition, error: gpsError, startTracking, stopTracking } = useGPS();

  const [zoom, setZoom] = useState(1.05);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const from = buildings.find((b) => b.id === fromId) ?? buildings[0];
  const to = toId ? (buildings.find((b) => b.id === toId) ?? null) : null;

  const route = useMemo(() => (to ? findRoute(from.id, to.id, algorithm) : []), [from, to, algorithm]);
  const routeD = useMemo(() => pathToSvgD(route), [route]);
  const meters = useMemo(() => (route.length ? routeDistance(route) : 0), [route]);
  const walkTime = Math.max(1, Math.round(meters / 75));
  const steps = useMemo<Step[]>(
    () => (to ? buildSteps(from.id, to.id, algorithm) : []),
    [from, to, algorithm],
  );

  const routeColor =
    routeStyle === "accessible" ? "#22c55e" :
    routeStyle === "scenic" ? "#f59e0b" : "#3b82f6";

  // Snap GPS to nearest building for "from"
  useEffect(() => {
    if (gpsStatus === "tracking" && gpsPosition?.nearestNodeId) {
      const b = buildings.find((x) => x.id === gpsPosition.nearestNodeId);
      if (b && b.id !== fromId) { setFromId(b.id); setEntryMethod("gps"); }
    }
  }, [gpsStatus, gpsPosition?.nearestNodeId, fromId]);

  // Simulation (preview only — stops in nav mode)
  useEffect(() => {
    const isRealGPS = gpsStatus === "tracking" && gpsPosition?.svgPos;
    if (isRealGPS || navMode) return;
    if (!to || route.length < 2 || !navPlaying) {
      if (!to) setUserPos({ x: from.x, y: from.y });
      return;
    }
    let t = progress * (route.length - 1);
    const total = route.length - 1;
    const id = setInterval(() => {
      t += 0.01;
      if (t >= total) { t = 0; setProgress(0); }
      else setProgress(t / total);
      const i = Math.floor(t);
      const frac = t - i;
      const a = route[i];
      const b = route[Math.min(i + 1, total)];
      setUserPos({ x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac });
    }, 60);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, route, navPlaying, gpsStatus, navMode]);

  useEffect(() => { setProgress(0); }, [toId, fromId]);

  const displayUserPos = useMemo(() =>
    gpsStatus === "tracking" && gpsPosition?.svgPos ? gpsPosition.svgPos : userPos,
    [gpsStatus, gpsPosition, userPos],
  );

  const TARGET_ZOOM = 2.8;

  // Auto-zoom/pan to follow user during nav
  useEffect(() => {
    if (!navMode || !followGPS || !displayUserPos) return;
    const container = containerRef.current;
    if (!container) return;
    const { width: cw, height: ch } = container.getBoundingClientRect();
    const px = (displayUserPos.x / 100) * cw;
    const py = (displayUserPos.y / 100) * ch;
    setZoom(TARGET_ZOOM);
    setPan({ x: (cw / 2 - px) * TARGET_ZOOM, y: (ch / 2 - py) * TARGET_ZOOM });
  }, [navMode, followGPS, displayUserPos]);

  // Update progress from real GPS proximity
  useEffect(() => {
    const isRealGPS = gpsStatus === "tracking" && gpsPosition?.svgPos;
    if (!navMode || route.length < 2 || !displayUserPos || !isRealGPS) return;
    let bestI = 0, bestD = Infinity;
    for (let i = 0; i < route.length; i++) {
      const d = Math.hypot(route[i].x - displayUserPos.x, route[i].y - displayUserPos.y);
      if (d < bestD) { bestD = d; bestI = i; }
    }
    setProgress(bestI / Math.max(1, route.length - 1));
  }, [navMode, route, displayUserPos, gpsStatus, gpsPosition]);

  // Current step
  const currentStepIdx = useMemo(() => {
    if (!steps.length || !userPos) return 0;
    let bestI = 0, bestD = Infinity;
    for (let i = 0; i < steps.length; i++) {
      const d = Math.hypot(steps[i].x - userPos.x, steps[i].y - userPos.y);
      if (d < bestD) { bestD = d; bestI = i; }
    }
    return Math.min(bestI, steps.length - 1);
  }, [steps, userPos]);

  // Direction arrows
  const arrows = useMemo(() => {
    if (route.length < 2) return [] as { x: number; y: number; a: number }[];
    return route.slice(0, -1).map((a, i) => {
      const b = route[i + 1];
      return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, a: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI };
    });
  }, [route]);

  // Path network lines from edges
  const pathNetworkLines = useMemo(() => edges
    .map(([a, b]) => {
      const na = nodeMap[a], nb = nodeMap[b];
      if (!na || !nb) return null;
      return { x1: na.x, y1: na.y, x2: nb.x, y2: nb.y, key: `${a}-${b}` };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null), []);

  function handleUseMyLocation() {
    gpsStatus === "tracking" ? stopTracking() : startTracking();
  }

  function handleQRNodeScan(node: { id: string; label: string }) {
    setFromId(node.id); setEntryMethod("qr_scan"); setQrOpen(false);
    logQRScan(node.id, node.label, gpsPosition?.lat, gpsPosition?.lng);
  }

  function handleStartNavigation() {
    if (!to) return;
    setNavMode(true); setNavPlaying(true); setProgress(0);
    setUserPos({ x: from.x, y: from.y });
    startTracking(); setFollowGPS(true);
    logNavigationSession({ fromId: from.id, toId: to.id, distanceMeters: meters, walkTimeMinutes: walkTime, entryMethod, lat: gpsPosition?.lat, lng: gpsPosition?.lng });
  }

  function handleOpenBuilding(b: Building) {
    setActiveBuilding(b); logBuildingView(b.id, b.name);
  }

  const filtered = useMemo(
    () => buildings.filter((b) => b.name.toLowerCase().includes(search.toLowerCase())), [search],
  );

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    setZoom((z) => Math.min(4, Math.max(0.7, z - e.deltaY * 0.002)));
  }
  function onPointerDown(e: React.PointerEvent) {
    dragRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    (e.target as Element).setPointerCapture?.(e.pointerId);
    if (navMode) setFollowGPS(false);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    setPan({ x: e.clientX - dragRef.current.x, y: e.clientY - dragRef.current.y });
  }
  function onPointerUp() { dragRef.current = null; }
  function recenter() { setPan({ x: 0, y: 0 }); setZoom(1.05); }

  return (
    <div className="relative w-full h-full flex bg-[#080f0a]">
      {!navMode && (
        <Sidebar
          search={search} setSearch={setSearch} filtered={filtered}
          from={from} to={to}
          setTo={(id) => { setToId(id); setEntryMethod("manual_select"); }}
          setFrom={(id) => { setFromId(id); setEntryMethod("manual_select"); }}
          openBuilding={handleOpenBuilding}
          routeStyle={routeStyle} setRouteStyle={setRouteStyle}
          meters={meters} walkTime={walkTime} steps={steps}
          useMyLocation={handleUseMyLocation}
          gpsStatus={gpsStatus} gpsPosition={gpsPosition} gpsError={gpsError}
        />
      )}

      {/* Map viewport */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden cursor-grab active:cursor-grabbing select-none"
        onWheel={onWheel} onPointerDown={onPointerDown}
        onPointerMove={onPointerMove} onPointerUp={onPointerUp}
      >
        {/* Pannable/zoomable surface */}
        <div
          className="absolute inset-0 will-change-transform"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transition: dragRef.current ? "none" : "transform 0.4s cubic-bezier(.2,.8,.2,1)",
          }}
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            <defs>
              <filter id="routeGlow" x="-25%" y="-25%" width="150%" height="150%">
                <feGaussianBlur stdDeviation="1.4" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="bldGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="gpsGlow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="1.8" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <pattern id="grass" width="3" height="3" patternUnits="userSpaceOnUse">
                <rect width="3" height="3" fill="#0a2110"/>
                <line x1="0" y1="1.5" x2="1" y2="0" stroke="#0f2d14" strokeWidth="0.3"/>
                <line x1="2" y1="3" x2="3" y2="1.5" stroke="#0f2d14" strokeWidth="0.3"/>
              </pattern>
              <radialGradient id="campusVignette" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="transparent"/>
                <stop offset="100%" stopColor="#050b06" stopOpacity="0.6"/>
              </radialGradient>
            </defs>

            {/* ═══ LAYER 1 — Ground ═══ */}
            <rect width="100" height="100" fill="#090f0b"/>
            <rect x="1.5" y="1.5" width="97" height="88" rx="3" fill="#0c1a0f" stroke="#1b3322" strokeWidth="0.5"/>

            {/* ═══ LAYER 2 — Sports / Green Areas ═══ */}
            {/* Football field */}
            <rect x="4" y="5" width="29" height="22" rx="2" fill="url(#grass)" stroke="#173d1e" strokeWidth="0.4"/>
            <rect x="5.5" y="6.5" width="26" height="19" rx="1" fill="none" stroke="#1d5225" strokeWidth="0.3"/>
            <line x1="18.5" y1="6.5" x2="18.5" y2="25.5" stroke="#1d5225" strokeWidth="0.25"/>
            <circle cx="18.5" cy="16" r="3.8" fill="none" stroke="#1d5225" strokeWidth="0.25"/>
            <circle cx="18.5" cy="16" r="0.5" fill="#1d5225"/>
            <rect x="5.5" y="12.5" width="3.5" height="7" rx="0.5" fill="none" stroke="#1d5225" strokeWidth="0.25"/>
            <rect x="31" y="12.5" width="3.5" height="7" rx="0.5" fill="none" stroke="#1d5225" strokeWidth="0.25"/>
            <text x="18.5" y="29" textAnchor="middle" fontSize="1.8" fill="#22803a" fontWeight="600">Football Ground</text>

            {/* Volleyball / Basketball courts */}
            <rect x="2.5" y="26.5" width="13" height="10" rx="1.5" fill="#0a2110" stroke="#173d1e" strokeWidth="0.35"/>
            <rect x="3.5" y="27.5" width="11" height="8" rx="0.5" fill="none" stroke="#1d5225" strokeWidth="0.25"/>
            <line x1="9" y1="27.5" x2="9" y2="35.5" stroke="#1d5225" strokeWidth="0.25"/>
            <circle cx="9" cy="31.5" r="1.8" fill="none" stroke="#1d5225" strokeWidth="0.2"/>
            <text x="9" y="39" textAnchor="middle" fontSize="1.6" fill="#22803a" fontWeight="600">V-Court</text>

            {/* Central green strip */}
            <ellipse cx="42" cy="44" rx="6" ry="4" fill="#0a2010" stroke="#163a1a" strokeWidth="0.2" opacity="0.7"/>
            {/* East lawn near library */}
            <rect x="78" y="55" width="14" height="26" rx="2" fill="#0a2010" stroke="#163a1a" strokeWidth="0.2" opacity="0.5"/>
            {/* North green patch near gate */}
            <ellipse cx="82" cy="5" rx="9" ry="3" fill="#0a2010" stroke="#163a1a" strokeWidth="0.2" opacity="0.4"/>

            {/* ═══ LAYER 3 — Roads ═══ */}
            {/* Road shadow/base */}
            <g stroke="#0e1a10" strokeLinecap="round" fill="none">
              {pathNetworkLines.map((l) => (
                <line key={`rs-${l.key}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} strokeWidth="3.2"/>
              ))}
            </g>
            {/* Road surface */}
            <g stroke="#141f15" strokeLinecap="round" fill="none">
              {pathNetworkLines.map((l) => (
                <line key={`r-${l.key}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} strokeWidth="2.2"/>
              ))}
            </g>
            {/* Road edge highlight */}
            <g stroke="#1e2e20" strokeLinecap="round" fill="none" opacity="0.6">
              {pathNetworkLines.map((l) => (
                <line key={`rh-${l.key}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} strokeWidth="0.4"/>
              ))}
            </g>
            {/* Center dashed markings */}
            <g stroke="#243526" strokeLinecap="round" strokeDasharray="2.5 2.5" fill="none" opacity="0.35">
              {pathNetworkLines.map((l) => (
                <line key={`rd-${l.key}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} strokeWidth="0.25"/>
              ))}
            </g>

            {/* ═══ LAYER 4 — Buildings ═══ */}
            {buildings.map((b) => {
              const [bw, bh] = buildingDims[b.id] ?? [10, 7];
              const isFrom = b.id === from.id;
              const isTo = to?.id === b.id;
              const dim = !!to && !isFrom && !isTo;
              const isSports = b.category === "sports";
              if (isSports) return null;
              const pulseR = Math.max(bw, bh) * 0.65;
              return (
                <g key={b.id} className="cursor-pointer" opacity={dim ? 0.35 : 1}
                   onClick={(e) => { e.stopPropagation(); handleOpenBuilding(b); }}>
                  {/* Glow ring when selected */}
                  {(isFrom || isTo) && (
                    <circle cx={b.x} cy={b.y} r={pulseR} fill={isTo ? routeColor : "#4ade80"} opacity="0.12">
                      <animate attributeName="r" values={`${pulseR * 0.8};${pulseR * 1.4};${pulseR * 0.8}`} dur="2.5s" repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="0.2;0;0.2" dur="2.5s" repeatCount="indefinite"/>
                    </circle>
                  )}
                  {/* Drop shadow */}
                  <rect x={b.x - bw / 2 + 0.6} y={b.y - bh / 2 + 0.8} width={bw} height={bh} rx={1.5}
                        fill="black" opacity="0.4"/>
                  {/* Building body */}
                  <rect x={b.x - bw / 2} y={b.y - bh / 2} width={bw} height={bh} rx={1.5}
                        fill={b.color} fillOpacity={isFrom || isTo ? 1 : 0.88}
                        stroke={isFrom ? "#4ade80" : isTo ? routeColor : "rgba(255,255,255,0.15)"}
                        strokeWidth={isFrom || isTo ? 0.55 : 0.2}
                        filter={isFrom || isTo ? "url(#bldGlow)" : undefined}/>
                  {/* Roof highlight */}
                  <rect x={b.x - bw / 2 + 0.3} y={b.y - bh / 2 + 0.3} width={bw - 0.6} height={bh * 0.28} rx={1.2}
                        fill="rgba(255,255,255,0.07)" style={{ pointerEvents: "none" }}/>
                  {/* Label */}
                  <text x={b.x} y={b.y + 0.8} textAnchor="middle" fontSize="2.1" fontWeight="700"
                        fill="white" letterSpacing="0.03em" style={{ pointerEvents: "none" }}>
                    {b.short}
                  </text>
                  {/* "YOU ARE HERE" or "DESTINATION" badge */}
                  {isFrom && (
                    <g transform={`translate(${b.x}, ${b.y - bh / 2 - 3})`}>
                      <rect x="-6" y="-2" width="12" height="4" rx="2" fill="#4ade80"/>
                      <text textAnchor="middle" y="1" fontSize="1.6" fontWeight="700" fill="#052e0e">YOU</text>
                    </g>
                  )}
                  {isTo && (
                    <g transform={`translate(${b.x}, ${b.y - bh / 2 - 3})`}>
                      <rect x="-5" y="-2" width="10" height="4" rx="2" fill={routeColor}/>
                      <text textAnchor="middle" y="1" fontSize="1.6" fontWeight="700" fill="white">DEST</text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* ═══ LAYER 4b — Sports click targets ═══ */}
            {buildings.filter((b) => b.category === "sports").map((b) => {
              const isFrom = b.id === from.id;
              const isTo = to?.id === b.id;
              const dim = !!to && !isFrom && !isTo;
              const isFB = b.id === "football";
              const cx = isFB ? 18.5 : 9;
              const cy = isFB ? 16 : 31.5;
              return (
                <g key={`sp-${b.id}`} className="cursor-pointer" opacity={dim ? 0.4 : 1}
                   onClick={(e) => { e.stopPropagation(); handleOpenBuilding(b); }}>
                  <rect x={isFB ? 4 : 2.5} y={isFB ? 5 : 26.5} width={isFB ? 29 : 13} height={isFB ? 22 : 10}
                        rx="2" fill="transparent"
                        stroke={isFrom ? "#4ade80" : isTo ? routeColor : "transparent"}
                        strokeWidth="0.6"/>
                </g>
              );
            })}

            {/* ═══ LAYER 5 — QR icons (waypoints only) ═══ */}
            {qrNodes.map((node) => {
              const isBuilding = buildings.some((b) => b.id === node.id);
              if (isBuilding) return null;
              return (
                <g key={`qr-${node.id}`} onClick={() => handleQRNodeScan(node)} style={{ cursor: "pointer" }} opacity={0.85}>
                  <rect x={node.x - 2.2} y={node.y - 2.2} width={4.4} height={4.4} rx={0.7}
                        fill="#091a0d" stroke="#22c55e" strokeWidth="0.3"/>
                  <rect x={node.x - 1.5} y={node.y - 1.5} width={1.1} height={1.1} rx={0.15} fill="#22c55e"/>
                  <rect x={node.x + 0.4} y={node.y - 1.5} width={1.1} height={1.1} rx={0.15} fill="#22c55e"/>
                  <rect x={node.x - 1.5} y={node.y + 0.4} width={1.1} height={1.1} rx={0.15} fill="#22c55e"/>
                  <rect x={node.x - 0.4} y={node.y - 0.4} width={0.8} height={0.8} rx={0.1} fill="#22c55e" opacity="0.7"/>
                </g>
              );
            })}

            {/* QR badges on buildings */}
            {qrNodes.map((node) => {
              const b = buildings.find((x) => x.id === node.id);
              if (!b) return null;
              const [bw, bh] = buildingDims[b.id] ?? [10, 7];
              return (
                <g key={`qr-b-${node.id}`} onClick={(e) => { e.stopPropagation(); handleQRNodeScan(node); }}
                   style={{ cursor: "pointer" }}>
                  <rect x={b.x + bw / 2 - 0.5} y={b.y - bh / 2 - 3.5} width={3} height={3} rx={0.4}
                        fill="#091a0d" stroke="#22c55e" strokeWidth="0.25"/>
                  <rect x={b.x + bw / 2 + 0.3} y={b.y - bh / 2 - 3.2} width={0.7} height={0.7} rx={0.1} fill="#22c55e"/>
                  <rect x={b.x + bw / 2 + 1.3} y={b.y - bh / 2 - 3.2} width={0.7} height={0.7} rx={0.1} fill="#22c55e"/>
                  <rect x={b.x + bw / 2 + 0.3} y={b.y - bh / 2 - 2.2} width={0.7} height={0.7} rx={0.1} fill="#22c55e"/>
                </g>
              );
            })}

            {/* ═══ LAYER 6 — Active route ═══ */}
            {routeD && (
              <>
                <path d={routeD} stroke={routeColor} strokeWidth="5" fill="none" opacity="0.2"
                      filter="url(#routeGlow)" strokeLinecap="round" strokeLinejoin="round"/>
                <path d={routeD} stroke="rgba(255,255,255,0.7)" strokeWidth="2.8" fill="none"
                      strokeLinecap="round" strokeLinejoin="round"/>
                <path d={routeD} stroke={routeColor} strokeWidth="1.6" fill="none"
                      strokeLinecap="round" strokeLinejoin="round" className="route-animated"/>
                {arrows.filter((_, i) => i % 2 === 0).map((a, i) => (
                  <g key={i} transform={`translate(${a.x},${a.y}) rotate(${a.a})`}>
                    <path d="M -1.1 -0.8 L 1.1 0 L -1.1 0.8 Z" fill="white" opacity="0.9"/>
                  </g>
                ))}
              </>
            )}

            {/* ═══ LAYER 7 — GPS accuracy circle ═══ */}
            {gpsStatus === "tracking" && gpsPosition?.svgPos && (
              <circle cx={gpsPosition.svgPos.x} cy={gpsPosition.svgPos.y}
                      r={Math.max(2, Math.min(12, (gpsPosition.accuracy ?? 20) / 5))}
                      fill="#3b82f6" opacity="0.1" stroke="#3b82f6" strokeWidth="0.3" strokeOpacity="0.5"/>
            )}

            {/* ═══ LAYER 8 — User dot ═══ */}
            {displayUserPos && (
              <g transform={`translate(${displayUserPos.x},${displayUserPos.y})`} filter="url(#gpsGlow)">
                <circle r="4.5" fill="#3b82f6" opacity="0.12">
                  <animate attributeName="r" values="3;8;3" dur="2.5s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.25;0;0.25" dur="2.5s" repeatCount="indefinite"/>
                </circle>
                <circle r="2.6" fill="white" opacity="0.95"/>
                <circle r="1.9" fill="#3b82f6"/>
                <circle r="0.7" fill="white"/>
              </g>
            )}

            {/* ═══ LAYER 9 — Building name labels ═══ */}
            {showLabels && buildings.filter((b) => b.category !== "sports").map((b) => {
              const [bw, bh] = buildingDims[b.id] ?? [10, 7];
              const labelY = b.y + bh / 2 + 3;
              const shortLabel = b.name.split("·")[0].trim().split(" ").slice(0, 2).join(" ");
              return (
                <g key={`lbl-${b.id}`} transform={`translate(${b.x},${labelY})`} style={{ pointerEvents: "none" }}>
                  <rect x="-9.5" y="-2" width="19" height="4" rx="2" fill="rgba(0,0,0,0.65)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.2"/>
                  <text textAnchor="middle" y="1" fontSize="2" fontWeight="500" fill="rgba(255,255,255,0.88)">
                    {shortLabel}
                  </text>
                </g>
              );
            })}

            {/* Campus vignette overlay */}
            <rect width="100" height="100" fill="url(#campusVignette)" style={{ pointerEvents: "none" }}/>
          </svg>
        </div>

        {/* ══════════ SEARCH BAR (top center) ══════════ */}
        {!navMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[min(96%,520px)] pointer-events-auto z-10">
            <div className="rounded-2xl bg-white/[0.97] backdrop-blur-2xl shadow-2xl shadow-black/50 border border-white/60 overflow-hidden">
              {/* From row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex-shrink-0 w-3 h-3 rounded-full bg-emerald-500 ring-[3px] ring-emerald-500/25"/>
                <select
                  aria-label="Starting location"
                  value={from.id}
                  onChange={(e) => { setFromId(e.target.value); setEntryMethod("manual_select"); }}
                  className="flex-1 bg-transparent text-[14px] font-medium outline-none text-slate-800 cursor-pointer"
                >
                  {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  title={gpsStatus === "tracking" ? "Stop GPS" : "Use my location"}
                  className={cn(
                    "flex-shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all",
                    gpsStatus === "tracking" ? "text-blue-600 bg-blue-50 ring-1 ring-blue-200" : "text-[#1d7afc] hover:bg-[#1d7afc]/10"
                  )}
                >
                  <Crosshair className="w-3.5 h-3.5"/>
                  {gpsStatus === "requesting" ? "…" : gpsStatus === "tracking" ? "GPS On" : "Me"}
                </button>
              </div>

              {/* Connector */}
              <div className="mx-4 flex items-center gap-3">
                <div className="w-3 flex justify-center"><div className="w-px h-3 bg-slate-200"/></div>
                <div className="flex-1 h-px bg-slate-100"/>
              </div>

              {/* To row */}
              <div className="flex items-center gap-2 px-4 py-3">
                <div className="flex-shrink-0 w-3 h-3 rounded-sm" style={{ background: routeColor }}/>
                <select
                  aria-label="Destination building"
                  value={toId ?? ""}
                  onChange={(e) => { setToId(e.target.value || null); setEntryMethod("manual_select"); }}
                  className="flex-1 bg-transparent text-[14px] font-medium outline-none text-slate-800 cursor-pointer"
                >
                  <option value="">Choose destination…</option>
                  {buildings.filter((b) => b.id !== from.id).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                {to && (
                  <>
                    <div className="flex-shrink-0 flex items-center gap-1 text-[12px] font-bold text-white px-2.5 py-1 rounded-lg shadow-sm" style={{ background: routeColor }}>
                      <Clock className="w-3 h-3"/> {walkTime}m
                    </div>
                    <button type="button" aria-label="Clear destination" onClick={() => setToId(null)}
                            className="flex-shrink-0 w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center transition">
                      <X className="w-3.5 h-3.5 text-slate-400"/>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Route style pills */}
            {to && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                          className="mt-2 flex gap-2">
                {(["fastest", "accessible", "scenic"] as const).map((s) => (
                  <button key={s} type="button" onClick={() => setRouteStyle(s)}
                          className={cn(
                            "flex-1 py-2 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-1.5 border backdrop-blur-xl transition-all",
                            routeStyle === s
                              ? "bg-white/95 text-slate-900 border-white shadow-lg"
                              : "bg-black/45 text-white border-white/15 hover:bg-black/60"
                          )}>
                    {s === "fastest" && <Zap className="w-3 h-3"/>}
                    {s === "accessible" && <Accessibility className="w-3 h-3"/>}
                    {s === "scenic" && <Footprints className="w-3 h-3"/>}
                    {s[0].toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* ══════════ MAP CONTROLS (right) ══════════ */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-10">
          <MapBtn onClick={() => setZoom((z) => Math.min(4, z + 0.3))} title="Zoom in"><ZoomIn className="w-4 h-4"/></MapBtn>
          <MapBtn onClick={() => setZoom((z) => Math.max(0.7, z - 0.3))} title="Zoom out"><ZoomOut className="w-4 h-4"/></MapBtn>
          <div className="h-px bg-white/10 mx-1 my-0.5"/>
          <MapBtn onClick={recenter} title="Recenter map"><Locate className="w-4 h-4"/></MapBtn>
          <MapBtn onClick={() => setShowLabels((v) => !v)} active={showLabels} title="Toggle labels"><Layers className="w-4 h-4"/></MapBtn>
          <MapBtn onClick={handleUseMyLocation} active={gpsStatus === "tracking"}
                  title={gpsStatus === "tracking" ? "GPS active" : "Enable GPS"}>
            {gpsStatus === "tracking" ? <Wifi className="w-4 h-4"/> : <WifiOff className="w-4 h-4"/>}
          </MapBtn>
          <div className="h-px bg-white/10 mx-1 my-0.5"/>
          <MapBtn onClick={() => setQrOpen(true)} title="Scan QR checkpoint"><QrCode className="w-4 h-4"/></MapBtn>
          <MapBtn onClick={() => setAlgorithm((a) => a === "dijkstra" ? "astar" : "dijkstra")}
                  title={`Algorithm: ${algorithm}`}><Cpu className="w-4 h-4"/></MapBtn>
        </div>

        {/* ══════════ COMPASS ══════════ */}
        <div className="absolute left-4 top-4 hidden md:flex flex-col items-center gap-1 z-10">
          <div className="w-11 h-11 rounded-full bg-black/60 backdrop-blur border border-white/15 flex items-center justify-center text-white shadow-xl">
            <Compass className="w-5 h-5"/>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-white/70 font-medium">N</div>
        </div>

        {/* ══════════ BOTTOM STATUS BADGES ══════════ */}
        <div className="absolute left-4 bottom-4 hidden md:flex flex-col gap-2 z-10">
          <div className="rounded-xl bg-black/60 backdrop-blur border border-white/12 text-white px-3 py-1.5 text-[11px] flex items-center gap-2 shadow-xl">
            <Cpu className="w-3.5 h-3.5 text-blue-400"/>
            <span className="uppercase tracking-widest opacity-60">Algo</span>
            <span className="font-semibold">{algorithm === "dijkstra" ? "Dijkstra" : "A*"}</span>
            {route.length > 0 && <span className="opacity-50">· {route.length} nodes</span>}
          </div>
          {(gpsStatus === "tracking" || gpsStatus === "off_campus") && (
            <div className={cn(
              "rounded-xl backdrop-blur border text-white px-3 py-1.5 text-[11px] flex items-center gap-2 shadow-xl",
              gpsStatus === "tracking" ? "bg-blue-900/60 border-blue-400/25" : "bg-amber-900/60 border-amber-400/25"
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full", gpsStatus === "tracking" ? "bg-blue-400 animate-pulse" : "bg-amber-400")}/>
              {gpsStatus === "tracking" ? `GPS · ~${Math.round(gpsPosition?.accuracy ?? 0)}m` : "GPS · Off Campus"}
            </div>
          )}
        </div>

        {/* ══════════ PRE-NAV ETA CARD ══════════ */}
        <AnimatePresence>
          {to && !navMode && (
            <motion.div
              initial={{ y: 32, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 32, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-[min(420px,calc(100%-2rem))] z-10"
            >
              <div className="rounded-2xl bg-white/[0.97] backdrop-blur-2xl shadow-2xl shadow-black/50 border border-white/60 overflow-hidden">
                <div className="px-5 pt-4 pb-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Route breadcrumb */}
                      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>
                          {from.short}
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-300"/>
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-white px-2 py-0.5 rounded-full" style={{ background: routeColor }}>
                          <MapPin className="w-2.5 h-2.5"/>
                          {to.short}
                        </div>
                      </div>
                      {/* Time + distance */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-slate-900 tabular-nums">{walkTime}</span>
                        <span className="text-lg font-medium text-slate-400">min</span>
                        <span className="text-slate-200 text-lg mx-0.5">·</span>
                        <span className="text-lg font-medium text-slate-500">{meters} m</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 capitalize">{routeStyle} route · {steps.length} steps</div>
                    </div>
                    <button type="button" aria-label="Clear destination" onClick={() => setToId(null)}
                            className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition mt-0.5">
                      <X className="w-3.5 h-3.5 text-slate-500"/>
                    </button>
                  </div>
                </div>
                <div className="p-4 pt-3">
                  <button type="button" onClick={handleStartNavigation}
                          className="w-full rounded-xl text-white py-3 text-[14px] font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]"
                          style={{ background: `linear-gradient(135deg, #1d7afc, #1560d4)`, boxShadow: "0 4px 16px rgba(29,122,252,0.4)" }}>
                    <Navigation2 className="w-4 h-4"/>
                    Start Navigation
                    <ArrowRight className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════ NAV OVERLAY ══════════ */}
        <AnimatePresence>
          {navMode && to && steps.length > 0 && (
            <NavOverlay
              step={steps[Math.min(currentStepIdx, steps.length - 1)]}
              nextStep={steps[Math.min(currentStepIdx + 1, steps.length - 1)]}
              stepIdx={currentStepIdx} totalSteps={steps.length}
              destination={to} meters={meters} walkTime={walkTime}
              progress={progress} playing={navPlaying}
              onTogglePlay={() => setNavPlaying((p) => !p)}
              onExit={() => { setNavMode(false); setProgress(0); setFollowGPS(false); recenter(); }}
              followGPS={followGPS} isRealGPS={gpsStatus === "tracking"}
              onRefollow={() => setFollowGPS(true)}
            />
          )}
        </AnimatePresence>

        {/* ══════════ QR SHEET ══════════ */}
        <AnimatePresence>
          {qrOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setQrOpen(false)}
                        className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div initial={{ y: 32, opacity: 0, scale: 0.96 }} animate={{ y: 0, opacity: 1, scale: 1 }}
                          exit={{ y: 32, opacity: 0, scale: 0.96 }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">QR Checkpoint</div>
                    <div className="text-lg font-bold text-slate-900">Snap to a known location</div>
                  </div>
                  <button type="button" aria-label="Close QR checkpoint" onClick={() => setQrOpen(false)}
                          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">
                    <X className="w-4 h-4 text-slate-600"/>
                  </button>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Tap any location below to instantly set it as your current position on the map.
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                  {qrNodes.map((node) => (
                    <button key={node.id} type="button" aria-label={`Snap to ${node.label}`}
                            onClick={() => handleQRNodeScan(node)}
                            className="text-left p-3 rounded-xl border border-slate-200 hover:border-[#1d7afc] hover:bg-[#1d7afc]/5 transition">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#1d7afc]/10 text-[#1d7afc] flex items-center justify-center flex-shrink-0">
                          <QrCode className="w-4 h-4"/>
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 truncate">{node.label}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <BuildingModal
          building={activeBuilding} onClose={() => setActiveBuilding(null)}
          onNavigateTo={(id) => { setToId(id); setActiveBuilding(null); setEntryMethod("manual_select"); }}
          onNavigateFrom={(id) => { setFromId(id); setActiveBuilding(null); setEntryMethod("manual_select"); }}
        />
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  Sub-components                           */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function MapBtn({ children, onClick, title, active }: { children: React.ReactNode; onClick: () => void; title?: string; active?: boolean }) {
  return (
    <button type="button" onClick={onClick} title={title}
            className={cn(
              "w-10 h-10 rounded-xl backdrop-blur-xl border flex items-center justify-center shadow-lg transition-all",
              active
                ? "bg-[#1d7afc] text-white border-[#1d7afc]/80 shadow-[#1d7afc]/25"
                : "bg-black/60 text-white/80 border-white/12 hover:bg-black/75 hover:text-white"
            )}>
      {children}
    </button>
  );
}

function Sidebar({
  search, setSearch, filtered, from, to, setTo, setFrom, openBuilding,
  routeStyle, setRouteStyle, meters, walkTime, steps,
  useMyLocation, gpsStatus, gpsPosition, gpsError,
}: {
  search: string; setSearch: (v: string) => void; filtered: Building[];
  from: Building; to: Building | null;
  setTo: (id: string) => void; setFrom: (id: string) => void;
  openBuilding: (b: Building) => void;
  routeStyle: string; setRouteStyle: (v: "fastest" | "accessible" | "scenic") => void;
  meters: number; walkTime: number; steps: Step[];
  useMyLocation: () => void;
  gpsStatus: string;
  gpsPosition: { lat: number; lng: number; accuracy: number; nearestNodeId: string | null } | null;
  gpsError: string | null;
}) {
  const categoryColors: Record<string, string> = {
    academic: "bg-emerald-900/50 text-emerald-300 border-emerald-700/30",
    residence: "bg-blue-900/50 text-blue-300 border-blue-700/30",
    dining: "bg-amber-900/50 text-amber-300 border-amber-700/30",
    sports: "bg-orange-900/50 text-orange-300 border-orange-700/30",
    service: "bg-indigo-900/50 text-indigo-300 border-indigo-700/30",
    entry: "bg-sky-900/50 text-sky-300 border-sky-700/30",
  };

  return (
    <aside className="hidden lg:flex flex-col w-[340px] bg-[#0a1510] text-white/90 border-r border-white/8 overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="p-4 sticky top-0 bg-[#0a1510]/95 backdrop-blur-xl z-10 border-b border-white/6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1d7afc] to-[#1254c0] flex items-center justify-center shadow-lg">
            <Navigation2 className="w-4.5 h-4.5 text-white"/>
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">Plaksha Navigator</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">Smart Campus Routing</div>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35"/>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
                 placeholder="Search buildings…"
                 className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/6 border border-white/8 text-sm outline-none focus:bg-white/10 focus:border-white/16 placeholder-white/35 transition"/>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* You-are-here card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #1d7afc22, #1f513222)" }}>
          <div className="border border-white/10 rounded-2xl p-4">
            <div className="text-[10px] uppercase tracking-widest text-white/50 font-semibold mb-1">You are at</div>
            <div className="font-bold text-base">{from.name}</div>
            {to ? (
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="text-[10px] uppercase tracking-widest text-white/50 font-semibold mb-1">Heading to</div>
                <div className="font-semibold text-sm">{to.name}</div>
                <div className="mt-2 flex items-center gap-3 text-xs text-white/60">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {walkTime} min</span>
                  <span>{meters} m</span>
                  <span className="capitalize">{routeStyle}</span>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-xs text-white/45">Select a destination to plan your route.</div>
            )}
          </div>
        </div>

        {/* GPS card */}
        <div className="rounded-xl bg-white/4 border border-white/8 p-3">
          <div className="flex items-center gap-2.5">
            <span className={cn(
              "w-2 h-2 rounded-full flex-shrink-0",
              gpsStatus === "tracking" ? "bg-blue-400 animate-pulse" :
              gpsStatus === "requesting" ? "bg-yellow-400 animate-pulse" :
              gpsStatus === "off_campus" ? "bg-amber-400" :
              gpsStatus === "denied" ? "bg-red-400" : "bg-white/20"
            )}/>
            <span className="text-xs flex-1 text-white/70">
              {gpsStatus === "tracking" ? `GPS Active · ~${Math.round(gpsPosition?.accuracy ?? 0)}m accuracy`
                : gpsStatus === "requesting" ? "Requesting GPS…"
                : gpsStatus === "off_campus" ? "GPS · Off campus"
                : gpsStatus === "denied" ? "GPS access denied"
                : "GPS off — tap to enable"}
            </span>
            {(gpsStatus === "idle" || gpsStatus === "denied" || gpsStatus === "unavailable" || gpsStatus === "off_campus") && (
              <button type="button" onClick={useMyLocation}
                      className="text-[11px] text-[#1d7afc] font-bold flex items-center gap-1 hover:text-[#3b8ffc] transition">
                <Crosshair className="w-3 h-3"/> Enable
              </button>
            )}
            {gpsStatus === "tracking" && (
              <button type="button" onClick={useMyLocation} className="text-[11px] text-white/40 hover:text-white/70 transition">
                Stop
              </button>
            )}
          </div>
          {gpsError && <div className="text-[10px] text-amber-400 mt-1.5">{gpsError}</div>}
        </div>

        {/* Quick destinations */}
        <Section title="Quick destinations">
          <div className="grid grid-cols-2 gap-2">
            {["library", "dining", "auditorium", "football"].map((id) => {
              const b = buildings.find((x) => x.id === id);
              if (!b) return null;
              return (
                <button key={id} type="button" onClick={() => setTo(id)}
                        className="text-left rounded-xl overflow-hidden border border-white/8 hover:border-white/25 transition group bg-white/3">
                  <div className="aspect-[5/3] overflow-hidden">
                    <img src={b.image} alt={b.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300"/>
                  </div>
                  <div className="px-2.5 py-2">
                    <div className="text-xs font-semibold truncate">{b.short}</div>
                    <div className="text-[10px] text-white/45 capitalize mt-0.5">{b.category}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        {/* All locations */}
        <Section title="All locations">
          <div className="flex flex-col gap-0.5">
            {filtered.map((b) => (
              <button key={b.id} type="button" onClick={() => openBuilding(b)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/6 text-left transition group">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-white/8">
                  <img src={b.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300"/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{b.name.split("·")[0].trim()}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full border font-semibold uppercase tracking-wider", categoryColors[b.category])}>
                      {b.category}
                    </span>
                    <span className="text-[10px] text-white/35">{b.floors}F</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-white/25 group-hover:text-white/50 transition"/>
              </button>
            ))}
          </div>
        </Section>

        {/* Turn-by-turn directions */}
        {steps.length > 0 && (
          <Section title={`Directions · ${walkTime} min · ${meters} m`}>
            <ol className="flex flex-col gap-1.5 max-h-72 overflow-y-auto no-scrollbar">
              {steps.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/4 border border-white/8">
                  <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0">
                    <StepIcon kind={s.kind}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold leading-snug">{s.text}</div>
                    {s.meters > 0 && <div className="text-[10px] text-white/40 mt-0.5">{s.meters} m</div>}
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        )}
      </div>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-2.5">{title}</div>
      {children}
    </div>
  );
}

function BuildingModal({ building, onClose, onNavigateTo, onNavigateFrom }: {
  building: Building | null; onClose: () => void;
  onNavigateTo: (id: string) => void; onNavigateFrom: (id: string) => void;
}) {
  return (
    <AnimatePresence>
      {building && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 z-30 flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}>
          <motion.div initial={{ y: 48, scale: 0.95, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }}
                      exit={{ y: 48, scale: 0.95, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 320, damping: 30 }}
                      onClick={(e) => e.stopPropagation()}
                      className="relative w-full sm:max-w-lg rounded-3xl overflow-hidden bg-white shadow-2xl">
            <div className="relative h-52 sm:h-60 overflow-hidden">
              <img src={building.image} alt={building.name} className="w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"/>
              <button type="button" aria-label="Close building info" onClick={onClose}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md transition">
                <X className="w-4 h-4 text-slate-700"/>
              </button>
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <div className="text-[10px] uppercase tracking-widest opacity-70 mb-0.5">{building.category}</div>
                <div className="text-2xl font-bold">{building.name}</div>
                <div className="text-sm opacity-70 mt-0.5">{building.floors} floor{building.floors > 1 ? "s" : ""}</div>
              </div>
            </div>

            <div className="p-5">
              <p className="text-sm text-slate-600 leading-relaxed">{building.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {building.facilities.map((f) => (
                  <span key={f} className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium">{f}</span>
                ))}
              </div>
              {building.departments && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {building.departments.map((d) => (
                    <span key={d} className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/50">{d}</span>
                  ))}
                </div>
              )}
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => onNavigateFrom(building.id)}
                        className="rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-sm font-semibold text-slate-800 flex items-center justify-center gap-1.5 transition">
                  <MapPin className="w-4 h-4"/> Start here
                </button>
                <button type="button" onClick={() => onNavigateTo(building.id)}
                        className="rounded-xl text-white py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 transition shadow-lg"
                        style={{ background: "linear-gradient(135deg,#1d7afc,#1254c0)", boxShadow: "0 4px 12px rgba(29,122,252,0.35)" }}>
                  <Navigation2 className="w-4 h-4"/> Directions
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StepIcon({ kind }: { kind: Step["kind"] }) {
  const cls = "w-4 h-4 text-white/80";
  switch (kind) {
    case "start": return <MapPin className={cls}/>;
    case "arrive": return <Flag className={cls}/>;
    case "left": return <CornerUpLeft className={cls}/>;
    case "right": return <CornerUpRight className={cls}/>;
    case "slight-left": return <ArrowUpLeft className={cls}/>;
    case "slight-right": return <ArrowUpRight className={cls}/>;
    default: return <ArrowUp className={cls}/>;
  }
}

function NavOverlay({
  step, nextStep, stepIdx, totalSteps, destination, meters, walkTime,
  progress, playing, onTogglePlay, onExit, followGPS, isRealGPS, onRefollow,
}: {
  step: Step; nextStep?: Step; stepIdx: number; totalSteps: number;
  destination: Building; meters: number; walkTime: number;
  progress: number; playing: boolean;
  onTogglePlay: () => void; onExit: () => void;
  followGPS: boolean; isRealGPS: boolean; onRefollow: () => void;
}) {
  const remainingM = Math.max(0, Math.round(meters * (1 - progress)));
  const remainingMin = Math.max(1, Math.round(remainingM / 75));

  return (
    <>
      {/* Top direction card */}
      <motion.div initial={{ y: -44, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -44, opacity: 0 }}
                  className="absolute top-4 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto sm:w-[min(560px,calc(100%-2rem))] z-20">
        <div className="rounded-2xl text-white shadow-2xl shadow-black/60 overflow-hidden"
             style={{ background: "linear-gradient(135deg, #1d7afc, #1358d4)" }}>
          <div className="flex items-center gap-4 p-4">
            <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0 border border-white/20">
              <div className="scale-[1.6]"><StepIcon kind={step.kind}/></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] uppercase tracking-widest opacity-70 font-semibold">
                {step.kind === "arrive" ? "Arriving at destination" : `In ${step.meters || remainingM} m`}
              </div>
              <div className="text-xl font-bold leading-tight mt-0.5 truncate">{step.text}</div>
              {nextStep && step.kind !== "arrive" && (
                <div className="flex items-center gap-1 text-[11px] opacity-75 mt-1">
                  <ChevronRight className="w-3 h-3"/> {nextStep.text}
                </div>
              )}
            </div>
            <button type="button" aria-label="End navigation" onClick={onExit}
                    className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center flex-shrink-0 transition border border-white/20">
              <X className="w-4 h-4"/>
            </button>
          </div>
          {/* Destination label */}
          <div className="px-4 pb-3 flex items-center gap-2">
            <Flag className="w-3 h-3 opacity-60"/>
            <span className="text-[11px] opacity-70 font-medium">To: {destination.name}</span>
          </div>
        </div>
      </motion.div>

      {/* Bottom progress card */}
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
                  className="absolute bottom-4 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto sm:w-[min(560px,calc(100%-2rem))] z-20">
        <div className="rounded-2xl bg-white/[0.97] backdrop-blur-2xl shadow-2xl shadow-black/50 border border-white/60 overflow-hidden">
          {/* Progress bar */}
          <div className="h-1.5 bg-slate-100">
            <motion.div className="h-full rounded-full bg-[#1d7afc]"
                         animate={{ width: `${Math.min(100, progress * 100)}%` }}
                         transition={{ duration: 0.4 }}/>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 tabular-nums">{remainingMin}</span>
                <span className="text-base font-medium text-slate-400">min</span>
                <span className="text-slate-200 mx-0.5">·</span>
                <span className="text-base font-medium text-slate-500">{remainingM} m</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {isRealGPS ? (
                  <span className="flex items-center gap-1 text-blue-500 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"/>Live GPS
                  </span>
                ) : (
                  <span>Step {Math.min(stepIdx + 1, totalSteps)} / {totalSteps}</span>
                )}
              </div>
            </div>
            {/* Re-center */}
            {!followGPS && (
              <button type="button" aria-label="Center on my location" onClick={onRefollow}
                      className="w-10 h-10 rounded-full bg-[#1d7afc] hover:brightness-110 text-white flex items-center justify-center transition shadow-lg shadow-[#1d7afc]/30">
                <Locate className="w-4 h-4"/>
              </button>
            )}
            {/* Play/Pause (sim mode only) */}
            {!isRealGPS && (
              <button type="button" onClick={onTogglePlay}
                      className="w-10 h-10 rounded-full bg-slate-900 hover:bg-slate-700 text-white flex items-center justify-center transition">
                {playing ? <Pause className="w-4 h-4"/> : <Play className="w-4 h-4"/>}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
