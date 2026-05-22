import { Link } from "@tanstack/react-router";
import { Github, Twitter, Linkedin, Instagram, MapPin, Mail, Send } from "lucide-react";

export function Footer() {
  return (
    <footer id="contact" className="px-4 pt-20 pb-10 bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-end">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-accent text-accent-foreground flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">Plaksha Campus Navigator</div>
                <div className="text-xs text-primary-foreground/70">Smart Visual Navigation System</div>
              </div>
            </div>
            <h3 className="mt-6 text-3xl sm:text-4xl font-semibold tracking-tight max-w-md" style={{ fontFamily: "var(--font-display)" }}>
              Get the navigator in your pocket.
            </h3>
            <p className="mt-3 text-primary-foreground/70 max-w-md text-sm">
              Be the first to know when we roll out QR codes across the full Plaksha campus.
            </p>
          </div>
          <form className="flex gap-2 w-full max-w-md lg:justify-self-end" onSubmit={(e) => e.preventDefault()}>
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/60" />
              <input
                placeholder="you@plaksha.edu.in"
                className="w-full pl-9 pr-3 py-3 rounded-xl bg-primary-foreground/10 border border-primary-foreground/20 text-sm outline-none placeholder:text-primary-foreground/50 focus:bg-primary-foreground/15"
              />
            </div>
            <button className="px-4 rounded-xl bg-accent text-accent-foreground font-medium text-sm flex items-center gap-1.5 hover:brightness-95">
              <Send className="w-4 h-4" /> Notify me
            </button>
          </form>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-primary-foreground/60 font-semibold mb-3">Product</div>
            <ul className="space-y-2 text-primary-foreground/85">
              <li><Link to="/map" className="hover:text-accent">Campus Map</Link></li>
              <li><Link to="/qr" className="hover:text-accent">QR Scanner</Link></li>
              <li><a href="#features" className="hover:text-accent">Features</a></li>
              <li><a href="#about" className="hover:text-accent">Roadmap</a></li>
            </ul>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-primary-foreground/60 font-semibold mb-3">Team</div>
            <ul className="space-y-2 text-primary-foreground/85">
              <li>Group 2 · Alpha Squad</li>
              <li>Plaksha University</li>
              <li>IPM 2025 Project</li>
            </ul>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-primary-foreground/60 font-semibold mb-3">Contact</div>
            <ul className="space-y-2 text-primary-foreground/85">
              <li>hello@plaksha-nav.app</li>
              <li>Plaksha University, Mohali</li>
            </ul>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-primary-foreground/60 font-semibold mb-3">Follow</div>
            <div className="flex gap-2">
              {[Twitter, Github, Linkedin, Instagram].map((Icon, i) => (
                <a key={i} className="w-8 h-8 rounded-lg bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center cursor-pointer">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-primary-foreground/15 flex flex-wrap items-center justify-between gap-3 text-xs text-primary-foreground/60">
          <div>© {new Date().getFullYear()} Plaksha Campus Navigator · Alpha Squad</div>
          <div>Built with care in Mohali · Dark green & cream forever</div>
        </div>
      </div>
    </footer>
  );
}
