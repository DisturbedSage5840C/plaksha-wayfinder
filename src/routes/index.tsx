import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Stats } from "@/components/Stats";
import { Future } from "@/components/Future";
import { Team } from "@/components/Team";
import { Footer } from "@/components/Footer";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, QrCode, BarChart2 } from "lucide-react";
import { buildings } from "@/lib/campus-data";
import { useState, useEffect } from "react";
import { fetchAnalyticsSummary } from "@/lib/analytics";
import { supabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Plaksha Campus Navigator — Smart Visual Navigation System" },
      {
        name: "description",
        content:
          "QR-enabled digital campus map for Plaksha University. Color-coded routes, building information and live navigation across campus.",
      },
    ],
  }),
});

function Index() {
  const [sessionCount, setSessionCount] = useState<number | null>(null);

  useEffect(() => {
    if (!supabaseConfigured) return;
    fetchAnalyticsSummary().then((data) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayCount = data.sessions.filter(
        (s: { created_at: string }) => new Date(s.created_at) >= today,
      ).length;
      setSessionCount(todayCount);
    });
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />

        {/* Map preview teaser */}
        <section className="px-4 -mt-4 pb-8">
          <div className="max-w-6xl mx-auto glass rounded-3xl p-3 shadow-2xl shadow-primary/10">
            {/* Live activity pill */}
            {sessionCount !== null && sessionCount > 0 && (
              <div className="flex justify-center mb-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-medium text-green-700 dark:text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  {sessionCount} navigations today
                </div>
              </div>
            )}
            <div className="relative aspect-[16/8] sm:aspect-[16/7] rounded-2xl overflow-hidden bg-[color:var(--cream)]">
              <svg viewBox="0 0 100 50" className="w-full h-full">
                <path d="M 5 25 Q 50 10 95 25" stroke="#cbd5b8" strokeWidth="1.5" fill="none" />
                <path d="M 30 5 Q 35 25 30 45" stroke="#cbd5b8" strokeWidth="1.5" fill="none" />
                <path d="M 70 5 Q 65 25 70 45" stroke="#cbd5b8" strokeWidth="1.5" fill="none" />
                <path d="M 12 14 Q 30 18 50 25 Q 70 30 88 36" stroke="#d4a017" strokeWidth="0.6" fill="none" className="route-animated" />
                {buildings.map((b) => {
                  const x = b.x;
                  const y = b.y * 0.5;
                  return (
                    <g key={b.id}>
                      <rect x={x - 2} y={y - 2} width="4" height="4" rx="0.5" fill={b.color} />
                    </g>
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Link
                  to="/map"
                  className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-xl hover:brightness-110 transition"
                >
                  <MapPin className="w-4 h-4" /> Explore the live map <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Features />
        <Stats />

        {/* CTA strip */}
        <section className="px-4 py-12">
          <div className="max-w-6xl mx-auto rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-primary to-[color:var(--moss)] text-primary-foreground relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-accent/30 blur-3xl" />
            <div className="relative grid md:grid-cols-2 gap-6 items-center">
              <motion.h3
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl font-semibold tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Scan once. Never get lost again.
              </motion.h3>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <Link to="/qr" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-accent-foreground font-medium">
                  <QrCode className="w-4 h-4" /> Try QR Scanner
                </Link>
                <Link to="/map" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 font-medium hover:bg-primary-foreground/15">
                  <MapPin className="w-4 h-4" /> Open Map
                </Link>
                <Link to="/analytics" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 font-medium hover:bg-primary-foreground/15">
                  <BarChart2 className="w-4 h-4" /> View Analytics
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Future />
        <Team />
      </main>
      <Footer />
    </div>
  );
}
