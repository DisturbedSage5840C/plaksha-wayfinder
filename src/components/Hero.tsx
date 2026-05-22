import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Navigation2, QrCode, Sparkles, Zap } from "lucide-react";
import { buildings } from "@/lib/campus-data";

const stats = [
  { v: "12+", l: "Buildings" },
  { v: "24/7", l: "Navigation" },
  { v: "<3s", l: "QR to route" },
];

export function Hero() {
  return (
    <section className="relative pt-32 pb-16 px-4 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,color-mix(in_oklab,var(--accent)_16%,transparent),transparent)]"/>
        <div className="absolute top-28 left-0 right-0 h-px gps-line overflow-hidden opacity-60"/>
        <div className="absolute top-52 left-0 right-0 h-px gps-line overflow-hidden opacity-40" style={{ animationDelay: "1.2s" }}/>
        <div className="absolute top-80 left-0 right-0 h-px gps-line overflow-hidden opacity-30" style={{ animationDelay: "2.4s" }}/>
      </div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left — copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-semibold text-primary border border-primary/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500"/>
            QR-enabled · GPS-tracked · Plaksha University
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
            className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.06]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Find your way
            <br />
            <span className="bg-gradient-to-r from-primary via-[color:var(--moss)] to-[color:var(--amber-accent)] bg-clip-text text-transparent">
              across Plaksha.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="mt-5 text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed"
          >
            A QR-enabled smart campus map with real GPS navigation, color-coded routes
            and building intelligence — for every student, visitor and guest at Plaksha.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <Link to="/map"
              className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all shadow-lg shadow-primary/25">
              <MapPin className="w-4 h-4"/>
              Open Campus Map
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
            </Link>
            <Link to="/qr"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-accent-foreground font-semibold hover:brightness-95 transition-all shadow-md shadow-accent/20">
              <QrCode className="w-4 h-4"/> Scan QR Code
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}
            className="mt-8 grid grid-cols-3 max-w-xs gap-3"
          >
            {stats.map((s) => (
              <div key={s.l} className="glass rounded-xl px-3 py-3 text-center border border-primary/8">
                <div className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-display)" }}>{s.v}</div>
                <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — campus mini-map illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative"
        >
          <div className="glass rounded-3xl p-3 shadow-2xl shadow-primary/12 border border-primary/8">
            <div className="relative rounded-2xl overflow-hidden bg-[#090f0b]" style={{ aspectRatio: "4/3" }}>
              {/* The campus SVG mini-map using real building positions */}
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <radialGradient id="heroVignette" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor="transparent"/>
                    <stop offset="100%" stopColor="#050b06" stopOpacity="0.7"/>
                  </radialGradient>
                  <filter id="heroGlow" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="1.5" result="b"/>
                    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>

                {/* Ground */}
                <rect width="100" height="100" fill="#090f0b"/>
                <rect x="2" y="2" width="96" height="88" rx="3" fill="#0c1a0f" stroke="#1b3322" strokeWidth="0.4"/>

                {/* Football field */}
                <rect x="4" y="5" width="29" height="22" rx="2" fill="#0b2410" stroke="#17401e" strokeWidth="0.3"/>
                <rect x="6" y="7" width="25" height="18" rx="1" fill="none" stroke="#1c5025" strokeWidth="0.25"/>
                <line x1="18.5" y1="7" x2="18.5" y2="25" stroke="#1c5025" strokeWidth="0.2"/>
                <circle cx="18.5" cy="16" r="3.5" fill="none" stroke="#1c5025" strokeWidth="0.2"/>

                {/* Volleyball court */}
                <rect x="2.5" y="27" width="13" height="10" rx="1.5" fill="#0b2410" stroke="#17401e" strokeWidth="0.3"/>

                {/* Roads — path network */}
                <g stroke="#141f15" strokeLinecap="round" fill="none" strokeWidth="2.2">
                  <line x1="88" y1="12" x2="85" y2="15"/>
                  <line x1="85" y1="15" x2="72" y2="17"/>
                  <line x1="72" y1="17" x2="65" y2="7"/>
                  <line x1="72" y1="17" x2="70" y2="28"/>
                  <line x1="70" y1="28" x2="74" y2="22"/>
                  <line x1="70" y1="28" x2="56" y2="22"/>
                  <line x1="56" y1="22" x2="40" y2="18"/>
                  <line x1="56" y1="22" x2="42" y2="30"/>
                  <line x1="42" y1="30" x2="27" y2="20"/>
                  <line x1="27" y1="20" x2="18" y2="18"/>
                  <line x1="27" y1="20" x2="9" y2="32"/>
                  <line x1="42" y1="30" x2="44" y2="45"/>
                  <line x1="44" y1="45" x2="42" y2="40"/>
                  <line x1="44" y1="45" x2="50" y2="52"/>
                  <line x1="72" y1="17" x2="68" y2="52"/>
                  <line x1="68" y1="52" x2="76" y2="50"/>
                  <line x1="68" y1="52" x2="50" y2="52"/>
                  <line x1="50" y1="52" x2="54" y2="48"/>
                  <line x1="54" y1="48" x2="56" y2="55"/>
                  <line x1="50" y1="52" x2="44" y2="63"/>
                  <line x1="44" y1="63" x2="40" y2="68"/>
                  <line x1="44" y1="63" x2="34" y2="58"/>
                  <line x1="34" y1="58" x2="30" y2="62"/>
                  <line x1="34" y1="58" x2="9" y2="32"/>
                  <line x1="40" y1="68" x2="55" y2="70"/>
                  <line x1="55" y1="70" x2="65" y2="74"/>
                  <line x1="65" y1="74" x2="70" y2="80"/>
                  <line x1="76" y1="50" x2="65" y2="74"/>
                </g>

                {/* Animated demo route (Gate → Library) */}
                <path d="M 88 12 L 85 15 L 72 17 L 68 52 L 76 50"
                      stroke="#1d7afc" strokeWidth="2.2" fill="none" strokeLinecap="round" className="route-animated" opacity="0.85"/>
                <path d="M 88 12 L 85 15 L 72 17 L 68 52 L 76 50"
                      stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.5"/>

                {/* Buildings */}
                {buildings.filter(b => b.category !== "sports").map((b) => {
                  const isActive = b.id === "gate02" || b.id === "library";
                  return (
                    <g key={b.id}>
                      <rect x={b.x - 4} y={b.y - 2.8} width={8} height={5.5} rx={1.2}
                            fill={b.color} fillOpacity={0.9}
                            stroke={isActive ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.15)"}
                            strokeWidth={isActive ? 0.45 : 0.18}
                            filter={isActive ? "url(#heroGlow)" : undefined}/>
                      <text x={b.x} y={b.y + 1} textAnchor="middle" fontSize="1.8" fontWeight="700"
                            fill="white" style={{ pointerEvents: "none" }}>
                        {b.short}
                      </text>
                    </g>
                  );
                })}

                {/* User dot at Gate */}
                <g transform="translate(88,12)" filter="url(#heroGlow)">
                  <circle r="3.8" fill="#3b82f6" opacity="0.15">
                    <animate attributeName="r" values="2.5;6;2.5" dur="2.5s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.25;0;0.25" dur="2.5s" repeatCount="indefinite"/>
                  </circle>
                  <circle r="2.2" fill="white" opacity="0.95"/>
                  <circle r="1.5" fill="#3b82f6"/>
                  <circle r="0.55" fill="white"/>
                </g>

                {/* Destination marker at Library */}
                <g transform="translate(76,50)">
                  <circle r="3" fill="#1d7afc" opacity="0.2">
                    <animate attributeName="r" values="2;5;2" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
                  </circle>
                </g>

                {/* Vignette */}
                <rect width="100" height="100" fill="url(#heroVignette)"/>
              </svg>

              {/* Floating "you are here" card */}
              <motion.div
                animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-4 right-4 glass rounded-xl px-3 py-2 text-xs shadow-xl border border-white/20"
              >
                <div className="text-[10px] text-muted-foreground font-medium">You are at</div>
                <div className="font-bold text-sm">Gate 02 · Entry</div>
              </motion.div>

              {/* Floating ETA card */}
              <motion.div
                animate={{ y: [0, 7, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 0.6, ease: "easeInOut" }}
                className="absolute bottom-4 left-4 glass rounded-xl px-3 py-2.5 text-xs shadow-xl border border-white/20"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#1d7afc] flex items-center justify-center">
                    <Navigation2 className="w-3.5 h-3.5 text-white"/>
                  </div>
                  <div>
                    <div className="font-bold text-sm">4 min walk</div>
                    <div className="text-[10px] text-muted-foreground">to Library · 320 m</div>
                  </div>
                </div>
              </motion.div>

              {/* Live GPS badge */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-400 text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"/>
                GPS Live
              </div>
            </div>
          </div>

          {/* Ambient glow behind the card */}
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--primary)_20%,transparent),transparent_70%)] blur-2xl"/>
        </motion.div>
      </div>
    </section>
  );
}
