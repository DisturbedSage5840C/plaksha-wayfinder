// Plaksha University campus bounding box (real GPS coordinates)
const CAMPUS = {
  north: 30.7295,
  south: 30.7245,
  east: 76.732,
  west: 76.7265,
};

// Convert real lat/lng to our 0-100 SVG coordinate space
export function gpsToSvg(lat: number, lng: number): { x: number; y: number } | null {
  const latBuffer = (CAMPUS.north - CAMPUS.south) * 0.2;
  const lngBuffer = (CAMPUS.east - CAMPUS.west) * 0.2;
  if (
    lat < CAMPUS.south - latBuffer ||
    lat > CAMPUS.north + latBuffer ||
    lng < CAMPUS.west - lngBuffer ||
    lng > CAMPUS.east + lngBuffer
  ) {
    return null;
  }
  // Latitude: north=y:0, south=y:100 (flipped); Longitude: west=x:0, east=x:100
  const x = ((lng - CAMPUS.west) / (CAMPUS.east - CAMPUS.west)) * 100;
  const y = ((CAMPUS.north - lat) / (CAMPUS.north - CAMPUS.south)) * 100;
  return {
    x: Math.max(2, Math.min(98, x)),
    y: Math.max(2, Math.min(98, y)),
  };
}

export type GPSStatus =
  | 'idle'
  | 'requesting'
  | 'tracking'
  | 'off_campus'
  | 'denied'
  | 'unavailable';

export interface GPSPosition {
  lat: number;
  lng: number;
  accuracy: number;
  svgPos: { x: number; y: number } | null;
  nearestNodeId: string | null;
  timestamp: number;
}

// Snap GPS position to nearest building node
// (imported lazily to avoid circular deps — call site passes the buildings array)
export function snapToNearestBuilding(
  lat: number,
  lng: number,
  buildings: { id: string; x: number; y: number }[],
  waypoints: { id: string; x: number; y: number }[],
): { nodeId: string; distanceMeters: number } | null {
  const svgPos = gpsToSvg(lat, lng);
  if (!svgPos) return null;

  let bestId = '';
  let bestDist = Infinity;

  for (const b of buildings) {
    const d = Math.hypot(b.x - svgPos.x, b.y - svgPos.y);
    if (d < bestDist) {
      bestDist = d;
      bestId = b.id;
    }
  }
  for (const w of waypoints) {
    const d = Math.hypot(w.x - svgPos.x, w.y - svgPos.y);
    if (d < bestDist) {
      bestDist = d;
      bestId = w.id;
    }
  }

  // 1 SVG unit ≈ 5.5 meters at Plaksha campus scale
  return { nodeId: bestId, distanceMeters: bestDist * 5.5 };
}
