import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { SectionHeader } from "./Features";

const stats = [
  { v: 92, suffix: "%", label: "First-time visitors who felt lost" },
  { v: 87, suffix: "%", label: "Want a QR-based map" },
  { v: 3.2, suffix: "x", label: "Faster wayfinding (avg)" },
  { v: 9, suffix: "+", label: "Buildings mapped on day one" },
];

const survey = [
  { name: "Easier nav", value: 92, color: "#1f5132" },
  { name: "Faster", value: 81, color: "#2d7a4a" },
  { name: "Less stress", value: 76, color: "#d4a017" },
  { name: "Recommend", value: 95, color: "#3d8b56" },
];

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => (Number.isInteger(to) ? Math.round(v).toString() : v.toFixed(1)));

  useEffect(() => {
    if (inView) {
      const controls = animate(mv, to, { duration: 1.4, ease: "easeOut" });
      return controls.stop;
    }
  }, [inView, mv, to]);

  return (
    <span ref={ref} className="inline-flex items-baseline">
      <motion.span>{rounded}</motion.span>
      <span className="text-accent-foreground/80">{suffix}</span>
    </span>
  );
}

export function Stats() {
  return (
    <section className="px-4 py-24">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          eyebrow="Survey insights"
          title="Plaksha needs this. The numbers prove it."
          sub="Based on 120+ student & visitor responses collected on campus."
        />

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl bg-primary text-primary-foreground p-5"
            >
              <div className="text-4xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                <Counter to={s.v} suffix={s.suffix} />
              </div>
              <div className="text-xs text-primary-foreground/70 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold">User feedback on the prototype</div>
              <div className="text-xs text-muted-foreground">% of respondents agreeing with each statement</div>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">n=120</div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={survey} barSize={56}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {survey.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
