'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';
import data from '@/data/content.json';

// Real interactive map (Leaflet + Carto dark tiles) plotting DMF projects at
// their true coordinates. Pins scale by project count; hover for detail, click
// to open the filtered portfolio.
const NODES = {
  'Dubai':                  { lat: 25.204, lng: 55.271, country: 'UAE' },
  'Sharjah':                { lat: 25.357, lng: 55.391, country: 'UAE' },
  'Abu Dhabi':              { lat: 24.453, lng: 54.377, country: 'UAE' },
  'Al Marjan Island (RAK)': { lat: 25.681, lng: 55.750, country: 'UAE', label: 'Ras Al Khaimah' },
  'Doha':                   { lat: 25.286, lng: 51.531, country: 'Qatar' },
  'Jeddah':                 { lat: 21.485, lng: 39.192, country: 'Saudi Arabia' },
  'Al Madina':              { lat: 24.470, lng: 39.611, country: 'Saudi Arabia', label: 'Al Madinah' },
  'Kabul':                  { lat: 34.555, lng: 69.208, country: 'Afghanistan' },
};

export default function ProjectMap({ height = 480 }) {
  const el = useRef(null);
  const mapRef = useRef(null);
  const router = useRouter();
  const [ready, setReady] = useState(false);

  const nodes = useMemo(() => {
    const agg = {};
    for (const p of data.projects) {
      const city = (p.location || '').split(',')[0].trim();
      if (!NODES[city]) continue;
      (agg[city] ||= { city, count: 0, names: [], ...NODES[city] });
      agg[city].count++;
      if (agg[city].names.length < 4) agg[city].names.push(p.name);
    }
    return Object.values(agg).sort((a, b) => b.count - a.count);
  }, []);

  useEffect(() => {
    let map;
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !el.current || mapRef.current) return;
      map = L.map(el.current, { zoomControl: true, scrollWheelZoom: false, attributionControl: true });
      mapRef.current = map;
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd', maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      }).addTo(map);

      const max = Math.max(...nodes.map((n) => n.count));
      const latlngs = [];
      nodes.forEach((n) => {
        const r = 7 + (n.count / max) * 20;
        // soft halo + core
        L.circleMarker([n.lat, n.lng], { radius: r + 6, color: 'transparent', fillColor: '#D42A2A', fillOpacity: 0.12 }).addTo(map);
        const m = L.circleMarker([n.lat, n.lng], {
          radius: r, color: '#ffffff', weight: 1, fillColor: '#D42A2A', fillOpacity: 0.85,
        }).addTo(map);
        m.bindTooltip(
          `<span style="font-weight:700">${n.label || n.city}</span> · ${n.count} project${n.count > 1 ? 's' : ''}`,
          { direction: 'top', offset: [0, -r], className: 'dmf-tip', opacity: 1 }
        );
        m.on('click', () => router.push(`/projects?c=${encodeURIComponent(n.country)}`));
        m.on('mouseover', () => m.setStyle({ fillOpacity: 1 }));
        m.on('mouseout', () => m.setStyle({ fillOpacity: 0.85 }));
        latlngs.push([n.lat, n.lng]);
      });
      if (latlngs.length) map.fitBounds(latlngs, { padding: [50, 50], maxZoom: 6 });
      setReady(true);
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, [nodes, router]);

  return (
    <div>
      <div className="relative isolate overflow-hidden rounded-3xl border border-brand-hair">
        <div ref={el} style={{ height }} className="z-0 h-full w-full bg-brand-ink" aria-label="Map of DMF Engineering projects across the UAE and the Gulf" role="img" />
        {!ready && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="font-raleway text-[11px] uppercase tracking-[0.2em] text-white/40">Loading map…</span>
          </div>
        )}
      </div>
      {/* accessible / non-tile fallback list */}
      <div className="mt-4 flex flex-wrap gap-2">
        {nodes.map((n) => (
          <Link key={n.city} href={`/projects?c=${encodeURIComponent(n.country)}`}
            className="rounded-full border border-brand-hair px-3.5 py-1.5 font-raleway text-[11px] font-semibold uppercase tracking-[0.08em] text-white/70 transition-colors hover:border-brand-red hover:text-white">
            {n.label || n.city} <span className="text-brand-red">{String(n.count).padStart(2, '0')}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
