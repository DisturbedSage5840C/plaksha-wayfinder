import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { CampusMap } from "@/components/CampusMap";

export const Route = createFileRoute("/map")({
  component: MapPage,
  validateSearch: (s: Record<string, unknown>) => ({
    from: typeof s.from === "string" ? s.from : undefined,
    to: typeof s.to === "string" ? s.to : undefined,
    entryMethod: (
      typeof s.entryMethod === "string" ? s.entryMethod : "manual_select"
    ) as "qr_scan" | "manual_select" | "gps",
  }),
  head: () => ({
    meta: [{ title: "Campus Map · Plaksha Navigator" }],
  }),
});

function MapPage() {
  const { from, to, entryMethod } = Route.useSearch();
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0b1410]">
      <Navbar />
      <div className="flex-1 overflow-hidden pt-24">
        <CampusMap
          initialFromId={from || "gate02"}
          initialToId={to}
          initialEntryMethod={entryMethod || "manual_select"}
        />
      </div>
    </div>
  );
}
