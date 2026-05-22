import { motion } from "framer-motion";
import { Route as RouteIcon, ParkingCircle, Network, Mic, Building2 } from "lucide-react";
import { SectionHeader } from "./Features";

const items = [
  { icon: RouteIcon, title: "Alternate Route System", desc: "Multiple route options ranked by time, scenery and crowd density." },
  { icon: ParkingCircle, title: "Real-time Parking", desc: "Live parking availability via IoT sensors integrated into the map." },
  { icon: Network, title: "Full Campus Rollout", desc: "QR codes at every major node — covering 100% of campus surface." },
  { icon: Mic, title: "AI Voice Assistant", desc: "Ask 'Where is the Physics Lab?' and get walking directions instantly." },
  { icon: Building2, title: "Indoor Navigation", desc: "Floor-by-floor wayfinding inside Bharti, Havells and the Library." },
];

export function Future() {
  return (
    <section id="about" className="px-4 py-24 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_30%,color-mix(in_oklab,var(--accent)_15%,transparent),transparent_60%)]" />
      <div className="max-w-6xl mx-auto">
        <SectionHeader eyebrow="Roadmap" title="Future Recommendations" sub="Where the navigator goes next — from real-time sensors to fully indoor AR wayfinding." />
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="relative rounded-2xl p-5 bg-card border border-border overflow-hidden group hover:border-primary/30 transition"
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-accent/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-[color:var(--moss)] text-primary-foreground flex items-center justify-center mb-3">
                  <it.icon className="w-5 h-5" />
                </div>
                <div className="font-semibold">{it.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{it.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
