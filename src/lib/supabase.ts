import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const supabaseConfigured =
  !!supabaseUrl &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !!supabaseAnonKey &&
  supabaseAnonKey !== 'your-anon-key-here';

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
);

// Types matching our DB schema
export type NavigationSession = {
  id: string;
  created_at: string;
  from_building_id: string;
  to_building_id: string;
  route_distance_meters: number;
  route_walk_time_minutes: number;
  entry_method: 'qr_scan' | 'manual_select' | 'gps';
  completed: boolean;
  device_type: 'mobile' | 'desktop';
  lat?: number;
  lng?: number;
};

export type QRScanEvent = {
  id: string;
  created_at: string;
  node_id: string;
  node_label: string;
  lat?: number;
  lng?: number;
};

export type BuildingView = {
  id: string;
  created_at: string;
  building_id: string;
  building_name: string;
};

/*
-- Run this in your Supabase project SQL Editor --

create table navigation_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  from_building_id text not null,
  to_building_id text not null,
  route_distance_meters integer,
  route_walk_time_minutes integer,
  entry_method text check (entry_method in ('qr_scan','manual_select','gps')),
  completed boolean default false,
  device_type text check (device_type in ('mobile','desktop')),
  lat double precision,
  lng double precision
);

create table qr_scan_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  node_id text not null,
  node_label text not null,
  lat double precision,
  lng double precision
);

create table building_views (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  building_id text not null,
  building_name text not null
);

-- Enable Row Level Security (public read/write for prototype)
alter table navigation_sessions enable row level security;
alter table qr_scan_events enable row level security;
alter table building_views enable row level security;

create policy "Allow public insert" on navigation_sessions for insert with check (true);
create policy "Allow public select" on navigation_sessions for select using (true);
create policy "Allow public insert" on qr_scan_events for insert with check (true);
create policy "Allow public select" on qr_scan_events for select using (true);
create policy "Allow public insert" on building_views for insert with check (true);
create policy "Allow public select" on building_views for select using (true);
*/
