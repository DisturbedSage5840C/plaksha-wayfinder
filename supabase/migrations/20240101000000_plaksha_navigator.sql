-- Plaksha Navigator schema

create table if not exists navigation_sessions (
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

create table if not exists qr_scan_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  node_id text not null,
  node_label text not null,
  lat double precision,
  lng double precision
);

create table if not exists building_views (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  building_id text not null,
  building_name text not null
);

-- Row Level Security (public read/write for prototype)
alter table navigation_sessions enable row level security;
alter table qr_scan_events enable row level security;
alter table building_views enable row level security;

create policy "Allow public insert" on navigation_sessions for insert with check (true);
create policy "Allow public select" on navigation_sessions for select using (true);
create policy "Allow public insert" on qr_scan_events for insert with check (true);
create policy "Allow public select" on qr_scan_events for select using (true);
create policy "Allow public insert" on building_views for insert with check (true);
create policy "Allow public select" on building_views for select using (true);

-- Seed a few example sessions so the analytics dashboard shows data immediately
insert into navigation_sessions (from_building_id, to_building_id, route_distance_meters, route_walk_time_minutes, entry_method, completed, device_type)
values
  ('gate02', 'bharti', 420, 6, 'qr_scan', true, 'mobile'),
  ('gate02', 'library', 380, 5, 'manual_select', true, 'desktop'),
  ('dining', 'havells', 220, 3, 'gps', false, 'mobile'),
  ('h2_boys', 'auditorium', 510, 7, 'qr_scan', true, 'mobile'),
  ('gate02', 'dining', 190, 3, 'manual_select', true, 'mobile'),
  ('bharti', 'library', 160, 2, 'gps', true, 'desktop'),
  ('gate02', 'auditorium', 620, 8, 'qr_scan', false, 'mobile');

insert into qr_scan_events (node_id, node_label)
values
  ('gate02', 'Gate 02 · Main Entry'),
  ('bharti', 'Bharti Block · Main Door'),
  ('gate02', 'Gate 02 · Main Entry'),
  ('w_central_n', 'North Campus Junction'),
  ('library', 'Library · Main Entrance'),
  ('gate02', 'Gate 02 · Main Entry');

insert into building_views (building_id, building_name)
values
  ('bharti', 'Bharti Academic Block'),
  ('library', 'Asha Mukul Agrawal Library'),
  ('havells', 'Havells Research Building'),
  ('auditorium', 'Auditorium'),
  ('bharti', 'Bharti Academic Block'),
  ('dining', 'Dining Hall (DJNJH Hall)');
