import { motion } from "framer-motion";
import {
  QrCode, Map, Route, Compass, Accessibility,
  Building2, Sparkles, Smartphone, Zap,
} from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "Instant QR Check-in",
    desc: "Scan any campus QR sticker to auto-set your location — no typing, no guessing.",
    accent: "#1d7afc",
  },
  {
    icon: Map,
    title: "Live Campus Map",
    desc: "Apple Maps–grade clarity with clickable buildings, hover info cards and smooth pinch-zoom.",
    accent: "#22c55e",
  },
  {
    icon: Zap,
    title: "Dual-Algorithm Routing",
    desc: "Switch between Dijkstra and A★ pathfinding in real-time to compare optimal paths.",
    accent: "#f59e0b",
  },
  {
    icon: Compass,
    title: "Turn-by-Turn Navigation",
    desc: "Immersive step-by-step directions with real GPS tracking as you walk the route.",
    accent: "#8b5cf6",
  },
  {
    icon: Building2,
    title: "Building Intelligence",
    desc: "Full facility info, department listings, floor counts and photos — one tap away.",
    accent: "#06b6d4",
  },
  {
    icon: Sparkles,
    title: "Smart Rerouting",
    desc: "Avoids construction zones and picks the shortest viable walking path automatically.",
    accent: "#ec4899",
  },
  {
    icon: Accessibility,
    title: "Accessible Routes",
    desc: "Step-free, ramp-friendly paths optimised for wheelchair users and mobility aids.",
    accent: "#22c55e",
  },
  {
    icon: Route,
    title: "Color-coded Paths",
    desc: "Distinct route colours — fastest (blue), accessible (green), scenic (amber) — at a glance.",
    accent: "#1d7afc",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    desc: "Designed for the phone in your pocket, with full-screen nav mode and native GPS.",
    accent: "#f59e0b",
  },
];

export function Features() {
  return (
    <section id="features" className="px-4 py-24 relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_60%,color-mix(in_oklab,var(--primary)_5%,transparent),transparent_50%)]"/>

      <div className="max-w-6xl mx-auto">
        <SectionHeader
          eyebrow="Capabilities"
          title="Everything you need to navigate."
          sub="A complete wayfinding stack purpose-built for Plaksha — QR, GPS, smart routing, building intelligence and accessibility all in one place."
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="group glass rounded-2xl p-5 hover:shadow-xl transition-all duration-300 border border-border/60 hover:border-border relative overflow-hidden"
            >
              {/* Subtle accent glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{ background: `radial-gradient(ellipse at 0% 0%, ${f.accent}12, transparent 60%)` }}
              />
              <div className="relative">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{ background: `${f.accent}18`, border: `1px solid ${f.accent}30` }}
                >
                  <f.icon className="w-5 h-5" style={{ color: f.accent }}/>
                </div>
                <div className="font-bold text-[15px] tracking-tight">{f.title}</div>
                <div className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{f.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-primary font-bold mb-4 px-3 py-1 rounded-full bg-primary/6 border border-primary/12"
      >
        {eyebrow}
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.05 }}
        className="text-3xl sm:text-4xl font-bold tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </motion.h2>
      {sub && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-muted-foreground text-base leading-relaxed"
        >
          {sub}
        </motion.p>
      )}
    </div>
  );
}
