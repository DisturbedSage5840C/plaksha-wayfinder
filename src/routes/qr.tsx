import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Camera, MapPin, Check, ScanLine, QrCode, ArrowLeft, Crosshair } from "lucide-react";
import { buildings, qrNodes } from "@/lib/campus-data";
import { logQRScan } from "@/lib/analytics";
import { useGPS } from "@/hooks/useGPS";
import { Navbar } from "@/components/Navbar";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/qr")({
  component: QRPage,
  validateSearch: (s: Record<string, unknown>) => ({
    code: typeof s.code === "string" ? s.code : undefined,
  }),
  head: () => ({ meta: [{ title: "QR Scanner · Plaksha Navigator" }] }),
});

function QRPage() {
  const router = useRouter();
  const { code } = Route.useSearch();
  const [scanning, setScanning] = useState(false);
  const [detectedNodeId, setDetectedNodeId] = useState<string | null>(null);
  const { status: gpsStatus, position: gpsPos, startTracking } = useGPS();

  // Handle incoming real QR scan from URL param
  useEffect(() => {
    if (code) {
      const match = code.match(/^plaksha:\/\/(.+)$/);
      if (match) handleQRDetect(match[1]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  function handleQRDetect(nodeId: string) {
    const node = qrNodes.find((n) => n.id === nodeId);
    if (!node) return;
    setDetectedNodeId(nodeId);
    setScanning(false);
    logQRScan(nodeId, node.label, gpsPos?.lat, gpsPos?.lng);
  }

  function simulateScan(nodeId: string) {
    setScanning(true);
    setTimeout(() => handleQRDetect(nodeId), 2000);
  }

  const detectedNode = detectedNodeId ? qrNodes.find((n) => n.id === detectedNodeId) : null;
  const detectedBuilding = detectedNodeId ? buildings.find((b) => b.id === detectedNodeId) : null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-28 pb-20 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <Link to="/map" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Map
            </Link>
            <h1 className="text-3xl font-semibold">QR Scanner</h1>
            <p className="text-muted-foreground mt-1">
              Scan any campus QR code to instantly set your location and get directions.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">

            {/* Scanner panel */}
            <div className="glass rounded-3xl p-5">
              <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">
                Camera Scanner
              </div>

              {/* Viewfinder */}
              <div className="relative aspect-square rounded-2xl bg-black overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-800" />
                <div
                  className="absolute inset-0 opacity-30"
                  style={{ background: "radial-gradient(circle at 50% 50%, #1f5132 0%, transparent 60%)" }}
                />

                {/* Corner reticles */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-3/5 aspect-square">
                    {(["tl", "tr", "bl", "br"] as const).map((p) => (
                      <span
                        key={p}
                        className={`absolute w-8 h-8 border-accent ${
                          p === "tl" ? "top-0 left-0 border-t-2 border-l-2 rounded-tl-xl" :
                          p === "tr" ? "top-0 right-0 border-t-2 border-r-2 rounded-tr-xl" :
                          p === "bl" ? "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-xl" :
                                       "bottom-0 right-0 border-b-2 border-r-2 rounded-br-xl"
                        }`}
                      />
                    ))}

                    {/* Scan line animation */}
                    {scanning && (
                      <motion.div
                        initial={{ top: "10%" }}
                        animate={{ top: "85%" }}
                        transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse" }}
                        className="absolute left-1 right-1 h-0.5 bg-accent shadow-[0_0_24px_4px_rgba(212,160,23,0.7)]"
                      />
                    )}

                    {!scanning && !detectedNodeId && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ScanLine className="w-12 h-12 text-white/30" />
                      </div>
                    )}

                    {/* Success tick */}
                    {detectedNodeId && (
                      <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-primary/90 rounded-xl"
                      >
                        <Check className="w-16 h-16 text-accent" />
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Status bar */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
                  <div className="px-2 py-1 rounded-md bg-black/50 text-white text-[10px] flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${scanning ? "bg-accent animate-pulse" : detectedNodeId ? "bg-green-400" : "bg-white/40"}`} />
                    {scanning ? "Scanning…" : detectedNodeId ? "QR Detected!" : "Ready"}
                  </div>
                  <div className="px-2 py-1 rounded-md bg-black/50 text-white text-[10px]">
                    PLAKSHA-NAV-v2
                  </div>
                </div>
              </div>

              {/* GPS status row */}
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${gpsStatus === "tracking" ? "bg-green-400" : "bg-white/20"}`} />
                <span className="text-muted-foreground">
                  {gpsStatus === "tracking"
                    ? `GPS active · ~${Math.round(gpsPos?.accuracy ?? 0)}m accuracy`
                    : "GPS inactive"}
                </span>
                {gpsStatus === "idle" && (
                  <button
                    type="button"
                    onClick={startTracking}
                    className="ml-auto text-primary font-medium flex items-center gap-1 text-xs"
                  >
                    <Crosshair className="w-3 h-3" /> Enable GPS
                  </button>
                )}
              </div>

              {/* Detected building info */}
              <AnimatePresence>
                {detectedNode && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-4 rounded-2xl bg-primary text-primary-foreground p-4"
                  >
                    <div className="text-[10px] uppercase tracking-wider opacity-70 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Location Set
                    </div>
                    <div className="text-lg font-semibold mt-0.5">📍 {detectedNode.label}</div>
                    {detectedBuilding && (
                      <div className="text-xs opacity-70 mt-1">{detectedBuilding.description}</div>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        router.navigate({
                          to: "/map",
                          search: { from: detectedNodeId!, entryMethod: "qr_scan" },
                        })
                      }
                      className="mt-3 w-full rounded-xl bg-accent text-accent-foreground py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      <MapPin className="w-4 h-4" /> Open Map from Here
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scan / stop button */}
              {!detectedNodeId && (
                <button
                  type="button"
                  onClick={() => setScanning((s) => !s)}
                  className="mt-4 w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:brightness-110 transition"
                >
                  <Camera className="w-4 h-4" />
                  {scanning ? "Stop Scanning" : "Start Scanning"}
                </button>
              )}

              {detectedNodeId && (
                <button
                  type="button"
                  onClick={() => { setDetectedNodeId(null); setScanning(false); }}
                  className="mt-3 w-full py-2.5 rounded-xl bg-secondary text-sm font-medium"
                >
                  Scan Again
                </button>
              )}
            </div>

            {/* QR code grid */}
            <div>
              <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-4">
                Campus QR Codes
              </div>
              <div className="grid grid-cols-2 gap-3">
                {qrNodes.map((node) => (
                  <div key={node.id} className="glass rounded-2xl p-3 flex flex-col items-center gap-2">
                    <div className="rounded-xl overflow-hidden bg-white p-2">
                      <QRCodeSVG
                        value={`plaksha://${node.id}`}
                        size={80}
                        fgColor="#1f5132"
                        bgColor="#ffffff"
                        level="M"
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-semibold leading-tight">{node.label}</div>
                      <button
                        type="button"
                        onClick={() => simulateScan(node.id)}
                        className="mt-1.5 text-[10px] text-primary font-semibold hover:underline flex items-center gap-1 mx-auto"
                      >
                        <QrCode className="w-2.5 h-2.5" /> Simulate Scan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
