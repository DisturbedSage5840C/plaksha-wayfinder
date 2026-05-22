import { supabase, supabaseConfigured } from './supabase';

export async function logNavigationSession(data: {
  fromId: string;
  toId: string;
  distanceMeters: number;
  walkTimeMinutes: number;
  entryMethod: 'qr_scan' | 'manual_select' | 'gps';
  lat?: number;
  lng?: number;
}) {
  if (!supabaseConfigured) return;
  const deviceType = window.innerWidth < 768 ? 'mobile' : 'desktop';
  const { error } = await supabase.from('navigation_sessions').insert({
    from_building_id: data.fromId,
    to_building_id: data.toId,
    route_distance_meters: data.distanceMeters,
    route_walk_time_minutes: data.walkTimeMinutes,
    entry_method: data.entryMethod,
    completed: false,
    device_type: deviceType,
    lat: data.lat,
    lng: data.lng,
  });
  if (error) console.warn('Analytics log failed (non-critical):', error.message);
}

export async function logQRScan(
  nodeId: string,
  nodeLabel: string,
  lat?: number,
  lng?: number,
) {
  if (!supabaseConfigured) return;
  const { error } = await supabase.from('qr_scan_events').insert({
    node_id: nodeId,
    node_label: nodeLabel,
    lat,
    lng,
  });
  if (error) console.warn('QR scan log failed (non-critical):', error.message);
}

export async function logBuildingView(buildingId: string, buildingName: string) {
  if (!supabaseConfigured) return;
  const { error } = await supabase.from('building_views').insert({
    building_id: buildingId,
    building_name: buildingName,
  });
  if (error) console.warn('Building view log failed (non-critical):', error.message);
}

export async function fetchAnalyticsSummary() {
  if (!supabaseConfigured) return { sessions: [], scans: [], views: [] };
  const [sessions, scans, views] = await Promise.all([
    supabase
      .from('navigation_sessions')
      .select('to_building_id, entry_method, completed, device_type, created_at')
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('qr_scan_events')
      .select('node_id, node_label, created_at')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('building_views')
      .select('building_id, building_name, created_at')
      .order('created_at', { ascending: false })
      .limit(200),
  ]);
  return {
    sessions: sessions.data ?? [],
    scans: scans.data ?? [],
    views: views.data ?? [],
  };
}
