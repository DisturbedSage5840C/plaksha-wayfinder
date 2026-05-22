import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { RefreshCw, Activity, Users, Smartphone, Monitor, QrCode, MapPin, Clock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { fetchAnalyticsSummary } from "@/lib/analytics";
import { supabaseConfigured } from "@/lib/supabase";
import { buildings } from "@/lib/campus-data";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
  head: () => ({ meta: [{ title: "Live Analytics · Plaksha Navigator" }] }),
});

type Session = {
  to_building_id: string;
  entry_method: string;
  completed: boolean;
  device_type: string;
  created_at: string;
};
type Scan = { node_id: string; node_label: string; created_at: string };
type View = { building_id: string; building_name: string; created_at: string };

function AnalyticsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [views, setViews] = useState<View[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAnalyticsSummary();
      setSessions(data.sessions as Session[]);
      setScans(data.scans as Scan[]);
      setViews(data.views as View[]);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todaySessions = sessions.filter((s) => new Date(s.created_at) >= todayStart);
  const completionRate =
    sessions.length > 0
      ? Math.round((sessions.filter((s) => s.completed).length / sessions.length) * 100)
      : 0;
  const mobileCount = sessions.filter((s) => s.device_type === "mobile").length;
  const mobileRate =
    sessions.length > 0 ? Math.round((mobileCount / sessions.length) * 100) : 0;

  // Most popular destinations
  const destCounts: Record<string, number> = {};
  for (const s of sessions) {
    destCounts[s.to_building_id] = (destCounts[s.to_building_id] ?? 0) + 1;
  }
  const topDests = Object.entries(destCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id, count]) => ({
      name: buildings.find((b) => b.id === id)?.short ?? id,
      count,
    }));

  // Most scanned QR nodes
  const scanCounts: Record<string, { label: string; count: number }> = {};
  for (const s of scans) {
    if (!scanCounts[s.node_id]) scanCounts[s.node_id] = { label: s.node_label, count: 0 };
    scanCounts[s.node_id].count++;
  }
  const topScans = Object.entries(scanCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([, v]) => ({ name: v.label.split(" · ")[0].slice(0, 12), count: v.count }));

  // Entry method breakdown
  const qrCount = sessions.filter((s) => s.entry_method === "qr_scan").length;
  const gpsCount = sessions.filter((s) => s.entry_method === "gps").length;
  const manualCount = sessions.filter((s) => s.entry_method === "manual_select").length;
  const total = sessions.length || 1;
  const entryData = [
    { name: "QR Scan", count: qrCount, pct: Math.round((qrCount / total) * 100) },
    { name: "GPS", count: gpsCount, pct: Math.round((gpsCount / total) * 100) },
    { name: "Manual", count: manualCount, pct: Math.round((manualCount / total) * 100) },
  ];

  const COLORS = ["#22c55e", "#3b82f6", "#d4a017", "#7c4dff", "#e07b39", "#ec4899"];

  function timeAgo(dateStr: string) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  }

  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-28 pb-20 px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-semibold mb-2">Live Analytics</h1>
            <div className="glass rounded-3xl p-8 text-center">
              <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Supabase not configured</h2>
              <p className="text-muted-foreground mb-4">
                Set your <code className="font-mono text-sm bg-secondary px-1.5 py-0.5 rounded">VITE_SUPABASE_URL</code> and{" "}
                <code className="font-mono text-sm bg-secondary px-1.5 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code>{" "}
                environment variables and run the SQL schema to enable live analytics.
              </p>
              <div className="text-left bg-secondary rounded-xl p-4 text-sm font-mono text-muted-foreground">
                <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
                <div>VITE_SUPABASE_ANON_KEY=your-anon-key-here</div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Find the SQL schema in <code className="font-mono">src/lib/supabase.ts</code> — copy the comment block into your Supabase SQL Editor.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-widest text-green-600 dark:text-green-400">Live</span>
              </div>
              <h1 className="text-3xl font-semibold">Plaksha Navigator Analytics</h1>
              {lastUpdated && (
                <p className="text-muted-foreground text-sm mt-0.5">
                  Last updated {timeAgo(lastUpdated.toISOString())} · auto-refreshes every 30s
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              aria-label="Refresh analytics"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-medium transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Sessions", value: sessions.length, icon: Activity, color: "text-blue-500" },
              { label: "Today's Sessions", value: todaySessions.length, icon: Clock, color: "text-green-500" },
              { label: "Completion Rate", value: `${completionRate}%`, icon: MapPin, color: "text-purple-500" },
              { label: "Mobile Users", value: `${mobileRate}%`, icon: Smartphone, color: "text-orange-500" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-5"
              >
                <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <div className="text-2xl font-semibold">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">

            {/* Popular destinations */}
            <div className="glass rounded-2xl p-5">
              <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-4">
                Most Popular Destinations
              </div>
              {loading ? (
                <SkeletonBars />
              ) : topDests.length === 0 ? (
                <EmptyState label="No navigation sessions yet" />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={topDests} layout="vertical" margin={{ left: 0, right: 12 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={42} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, fontSize: 12 }}
                      formatter={(v) => [`${v} routes`, "Count"]}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {topDests.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* QR scan hotspots */}
            <div className="glass rounded-2xl p-5">
              <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-4 flex items-center gap-2">
                <QrCode className="w-3.5 h-3.5" /> QR Scan Hotspots
              </div>
              {loading ? (
                <SkeletonBars />
              ) : topScans.length === 0 ? (
                <EmptyState label="No QR scans yet" />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={topScans} layout="vertical" margin={{ left: 0, right: 12 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, fontSize: 12 }}
                      formatter={(v) => [`${v} scans`, "Scans"]}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {topScans.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-6">

            {/* Entry method breakdown */}
            <div className="glass rounded-2xl p-5">
              <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-4">
                Entry Methods
              </div>
              <div className="flex flex-col gap-3">
                {entryData.map((e, i) => (
                  <div key={e.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{e.name}</span>
                      <span className="font-semibold">{e.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${e.pct}%`, background: COLORS[i] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Device breakdown */}
            <div className="glass rounded-2xl p-5">
              <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-4">
                Device Split
              </div>
              <div className="flex flex-col gap-4 mt-2">
                {[
                  { label: "Mobile", icon: Smartphone, count: mobileCount, color: "#22c55e" },
                  { label: "Desktop", icon: Monitor, count: sessions.length - mobileCount, color: "#3b82f6" },
                ].map((d) => (
                  <div key={d.label} className="flex items-center gap-3">
                    <d.icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{d.label}</span>
                        <span className="font-semibold">{d.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: sessions.length > 0 ? `${Math.round((d.count / sessions.length) * 100)}%` : "0%",
                            background: d.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Building views */}
            <div className="glass rounded-2xl p-5">
              <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-4">
                Building Views
              </div>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-7 rounded-lg bg-secondary animate-pulse" />
                  ))}
                </div>
              ) : views.length === 0 ? (
                <EmptyState label="No building views yet" />
              ) : (
                <div className="flex flex-col gap-1 max-h-48 overflow-y-auto no-scrollbar">
                  {Object.entries(
                    views.reduce<Record<string, number>>((acc, v) => {
                      acc[v.building_name] = (acc[v.building_name] ?? 0) + 1;
                      return acc;
                    }, {})
                  )
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 8)
                    .map(([name, count]) => (
                      <div key={name} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-secondary/50">
                        <span className="truncate">{name}</span>
                        <span className="font-semibold text-muted-foreground ml-2">{count}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent sessions */}
          <div className="glass rounded-2xl p-5">
            <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-4">
              Recent Sessions
            </div>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-10 rounded-xl bg-secondary animate-pulse" />)}
              </div>
            ) : sessions.length === 0 ? (
              <EmptyState label="No sessions recorded yet. Start navigating to see data here." />
            ) : (
              <div className="flex flex-col gap-1 max-h-80 overflow-y-auto no-scrollbar">
                {sessions.slice(0, 20).map((s, i) => {
                  const fromName = s.to_building_id;
                  const toName = buildings.find((b) => b.id === s.to_building_id)?.short ?? s.to_building_id;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-xs px-3 py-2.5 rounded-xl hover:bg-secondary/50 transition"
                    >
                      <span className="text-muted-foreground w-16 flex-shrink-0">{timeAgo(s.created_at)}</span>
                      <span className="flex-1 truncate font-medium">→ {toName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        s.entry_method === "qr_scan" ? "bg-green-100 text-green-700" :
                        s.entry_method === "gps" ? "bg-blue-100 text-blue-700" :
                        "bg-secondary text-muted-foreground"
                      }`}>
                        {s.entry_method === "qr_scan" ? "QR" : s.entry_method === "gps" ? "GPS" : "Manual"}
                      </span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        {s.device_type === "mobile" ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

function SkeletonBars() {
  return (
    <div className="space-y-2 py-4">
      {[60, 45, 30, 20].map((w) => (
        <div key={w} className="h-6 rounded-md bg-secondary animate-pulse" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-8 text-muted-foreground text-sm">{label}</div>
  );
}
