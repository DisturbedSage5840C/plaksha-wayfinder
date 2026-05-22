import { Link, useRouter } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Moon, Sun, QrCode, MapPin, X, BarChart2, Navigation2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home",        to: "/",          hash: "" },
  { label: "Features",    to: "/",          hash: "#features" },
  { label: "Campus Map",  to: "/map",       hash: "" },
  { label: "Analytics",  to: "/analytics", hash: "" },
  { label: "About",       to: "/",          hash: "#about" },
  { label: "Team",        to: "/",          hash: "#team" },
];

export function Navbar() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (to: string, hash: string) => {
    setOpen(false);
    if (to === "/" && router.state.location.pathname === "/") {
      hash
        ? document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" })
        : window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.navigate({ to, hash: hash.replace("#", "") || undefined });
    }
  };

  return (
    <motion.header
      initial={{ y: -36, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className="fixed top-0 inset-x-0 z-50 px-4 pt-4"
    >
      <nav
        className={cn(
          "mx-auto max-w-6xl rounded-2xl px-5 py-3 flex items-center justify-between transition-all duration-300",
          scrolled
            ? "glass shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-border/80"
            : "glass shadow-[0_4px_16px_rgba(31,81,50,0.06)] border border-border/50"
        )}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
            <Navigation2 className="w-4.5 h-4.5 text-accent"/>
            <span className="absolute inset-0 rounded-xl ring-2 ring-accent/35 pulse-glow"/>
          </div>
          <div className="leading-tight">
            <div className="font-bold text-sm tracking-tight">Plaksha</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Campus Navigator
            </div>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map((l) => (
            <button
              key={l.label}
              type="button"
              onClick={() => go(l.to, l.hash)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-colors font-medium",
                "text-foreground/70 hover:text-foreground hover:bg-secondary",
                l.to === "/analytics" && "flex items-center gap-1.5",
                l.to === "/map" && "flex items-center gap-1.5",
              )}
            >
              {l.to === "/analytics" && <BarChart2 className="w-3.5 h-3.5"/>}
              {l.to === "/map" && <MapPin className="w-3.5 h-3.5"/>}
              {l.label}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-lg border border-border/70 flex items-center justify-center hover:bg-secondary transition-colors"
          >
            {theme === "dark"
              ? <Sun className="w-4 h-4 text-amber-400"/>
              : <Moon className="w-4 h-4"/>}
          </button>

          <Link
            to="/qr"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:brightness-95 transition shadow-sm shadow-accent/20"
          >
            <QrCode className="w-4 h-4"/> Scan QR
          </Link>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="md:hidden w-9 h-9 rounded-lg border border-border/70 flex items-center justify-center hover:bg-secondary transition"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-4 h-4"/> : <Menu className="w-4 h-4"/>}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="md:hidden mt-2 mx-auto max-w-6xl glass rounded-2xl p-2 border border-border/70 shadow-xl"
          >
            {navLinks.map((l) => (
              <button
                key={l.label}
                type="button"
                onClick={() => go(l.to, l.hash)}
                className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-secondary text-sm font-medium flex items-center gap-2 transition-colors"
              >
                {l.to === "/analytics" && <BarChart2 className="w-4 h-4 text-muted-foreground"/>}
                {l.to === "/map" && <MapPin className="w-4 h-4 text-muted-foreground"/>}
                {l.label}
              </button>
            ))}
            <div className="mx-2 my-1 h-px bg-border/50"/>
            <Link
              to="/qr"
              className="mx-2 mb-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-semibold"
              onClick={() => setOpen(false)}
            >
              <QrCode className="w-4 h-4"/> Scan QR Code
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
