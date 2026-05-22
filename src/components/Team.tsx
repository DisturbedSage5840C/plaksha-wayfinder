import { motion } from "framer-motion";
import { SectionHeader } from "./Features";
import { Linkedin, Github, Mail, Star } from "lucide-react";

const team = [
  { name: "Ali Usman Muhammad",  role: "Product Lead",           initials: "AU", accent: "#1d7afc", skills: ["Strategy", "UX", "PM"] },
  { name: "Shrikant Yadav",      role: "Frontend Engineer",       initials: "SY", accent: "#22c55e", skills: ["React", "Tailwind", "TypeScript"] },
  { name: "Aaryan Agarwal",      role: "Map & UX Engineer",       initials: "AA", accent: "#f59e0b", skills: ["SVG Maps", "Motion", "Design"] },
  { name: "Utkarsh Khurana",     role: "Systems & QR Lead",       initials: "UK", accent: "#8b5cf6", skills: ["Routing", "QR", "Supabase"] },
];

export function Team() {
  return (
    <section id="team" className="px-4 py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-secondary/40"/>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_100%,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_60%)]"/>

      <div className="max-w-6xl mx-auto">
        <SectionHeader
          eyebrow="Group 2 · Alpha Squad"
          title="The team behind the navigator."
          sub="Four students building the way Plaksha should feel from day one — clear, smart and beautifully simple."
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {team.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="group glass rounded-2xl p-5 text-center hover:shadow-2xl transition-all duration-300 relative overflow-hidden border border-border/60 hover:border-border"
            >
              {/* Accent glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${m.accent}14, transparent 65%)` }}
              />

              <div className="relative">
                {/* Avatar */}
                <div className="relative mx-auto w-20 h-20 mb-4">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${m.accent}, ${m.accent}99)` }}
                  >
                    {m.initials}
                  </div>
                  {/* Alpha badge */}
                  <div
                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-black border-2 border-card text-white shadow-md"
                    style={{ background: m.accent }}
                  >
                    α
                  </div>
                </div>

                <div className="font-bold text-[15px] tracking-tight">{m.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{m.role}</div>

                {/* Skills */}
                <div className="mt-3 flex flex-wrap justify-center gap-1">
                  {m.skills.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
                      style={{ background: `${m.accent}12`, color: m.accent, borderColor: `${m.accent}25` }}
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Social links */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  {[Linkedin, Github, Mail].map((Icon, j) => (
                    <a
                      key={j}
                      className="w-8 h-8 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-200 cursor-pointer"
                    >
                      <Icon className="w-3.5 h-3.5"/>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Project badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 flex justify-center"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-border text-sm text-muted-foreground">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500"/>
            IPM 2025 Project · Plaksha University · Mohali
          </div>
        </motion.div>
      </div>
    </section>
  );
}
