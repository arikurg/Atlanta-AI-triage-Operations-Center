import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { FARS, SEV } from '../data.js';

// Expose the npm Leaflet instance to window so leaflet.heat (CDN UMD) can extend it
window.L = L;

// Precomputed heatmap points: [lat, lng, intensity]
const HEAT_WEIGHTS = { FATAL: 1.5, SERIOUS: 1.0, MODERATE: 0.4, MINOR: 0.2 };
const HEAT_POINTS = FARS.map((f) => [f.lat, f.lng, (HEAT_WEIGHTS[f.severity] ?? 0.2) * 2.0]);

// Singleton loader — only injects the <script> once
let heatPluginPromise = null;
function loadHeatPlugin() {
  if (L.heatLayer) return Promise.resolve();
  if (!heatPluginPromise) {
    heatPluginPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js';
      s.onload = resolve;
      s.onerror = () => reject(new Error('Failed to load leaflet.heat'));
      document.head.appendChild(s);
    });
  }
  return heatPluginPromise;
}

export default function MapView({ liveIncidents, selectedInc, onSelect, mapFlyToRef }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const farsMarkersRef = useRef({});  // FARS dot markers (hidden in heatmap mode)
  const liveMarkersRef = useRef({});  // live incident markers (always visible)
  const heatLayerRef = useRef(null);
  const [heatmapActive, setHeatmapActive] = useState(false);

  // Init map once + preload heat plugin
  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([33.749, -84.388], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;

    if (mapFlyToRef) {
      mapFlyToRef.current = (lat, lng) =>
        map.setView([lat, lng], 13, { animate: true, duration: 0.4 });
    }

    // Preload plugin so it's ready when the user clicks HEATMAP
    loadHeatPlugin().catch(() => {});

    return () => {
      map.remove();
      mapRef.current = null;
      heatLayerRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Rebuild live incident markers whenever incidents or selection change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.values(liveMarkersRef.current).forEach((m) => map.removeLayer(m));
    liveMarkersRef.current = {};

    liveIncidents.forEach((inc) => {
      const s = SEV[inc.severity] || SEV.MINOR;
      const isSel = selectedInc?.id === inc.id;
      const sz = isSel ? 16 : 12;
      const icon = L.divIcon({
        html: `<div style="width:${sz}px;height:${sz}px;border-radius:50%;background:${s.c};border:2px solid #fff;box-shadow:0 0 ${isSel ? 14 : 7}px ${s.c}80"></div>`,
        iconSize: [sz, sz],
        iconAnchor: [sz / 2, sz / 2],
        className: '',
      });
      const m = L.marker([inc.lat, inc.lng], { icon }).addTo(map);
      m.bindPopup(`<b>● LIVE: ${inc.type}</b><br>${inc.location}<br>${inc.severity} · ${inc.minsAgo}m ago`);
      m.on('click', () => onSelect(inc));
      liveMarkersRef.current[inc.id] = m;
    });
  }, [liveIncidents, selectedInc, onSelect]);

  // Manage FARS dots ↔ heatmap when toggle changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (heatmapActive) {
      // Hide FARS dots
      Object.values(farsMarkersRef.current).forEach((m) => map.removeLayer(m));
      farsMarkersRef.current = {};

      // Build/show heat layer
      loadHeatPlugin().then(() => {
        if (!mapRef.current) return;
        if (!heatLayerRef.current) {
          heatLayerRef.current = L.heatLayer(HEAT_POINTS, {
            radius: 40,
            blur: 30,
            maxZoom: 12,
            max: 0.4,
            minOpacity: 0.4,
            gradient: {
              0.2: 'rgba(255,180,0,0.01)',
              0.4: 'rgba(255,140,0,0.6)',
              0.65: 'rgba(255,80,0,0.8)',
              1.0: 'rgba(255,30,0,1.0)',
            },
          });
        }
        if (!mapRef.current.hasLayer(heatLayerRef.current)) {
          heatLayerRef.current.addTo(mapRef.current);
          heatLayerRef.current.setZIndex(500);
          setTimeout(() => {
            const heatCanvas = document.querySelector('.leaflet-heatmap-layer');
            if (heatCanvas) {
              heatCanvas.style.mixBlendMode = 'screen';
              heatCanvas.style.filter = 'none';
            }
          }, 500);
        }
      });
    } else {
      // Remove heat layer
      if (heatLayerRef.current && map.hasLayer(heatLayerRef.current)) {
        map.removeLayer(heatLayerRef.current);
      }

      // Rebuild FARS dot markers
      Object.values(farsMarkersRef.current).forEach((m) => map.removeLayer(m));
      farsMarkersRef.current = {};

      FARS.forEach((f) => {
        const s = SEV[f.severity] || SEV.MINOR;
        const icon = L.divIcon({
          html: `<div style="width:7px;height:7px;border-radius:50%;background:${s.c};opacity:0.55;border:1px solid ${s.c}"></div>`,
          iconSize: [7, 7],
          iconAnchor: [3, 3],
          className: '',
        });
        const m = L.marker([f.lat, f.lng], { icon }).addTo(map);
        m.bindPopup(
          `<b>${f.location}</b><br>${f.severity} · ${f.date}<br>Factors: ${f.factors.join(', ')}<br>Vehicles: ${f.vehicles} · Fatalities: ${f.fatalities}`
        );
        m.on('click', () => onSelect(f));
        farsMarkersRef.current[f.id] = m;
      });
    }
  }, [heatmapActive, onSelect]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ flex: 1, position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Heatmap toggle — top-right */}
      <button
        onClick={() => setHeatmapActive((v) => !v)}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          padding: '5px 11px',
          background: heatmapActive ? 'rgba(255,180,0,0.10)' : 'rgba(9,14,26,0.90)',
          border: `1px solid ${heatmapActive ? 'rgba(255,180,0,0.55)' : '#1C3045'}`,
          borderRadius: 3,
          color: heatmapActive ? '#FFB400' : '#3A4F6C',
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: '0.12em',
          cursor: 'pointer',
          transition: 'all 0.15s',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span style={{ fontSize: 8, opacity: heatmapActive ? 1 : 0.5 }}>▓</span>
        HEATMAP
      </button>

      {/* Legend — bottom-left */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: 10,
          zIndex: 1000,
          background: 'rgba(9,14,26,0.93)',
          border: '1px solid #1C3045',
          borderRadius: 4,
          padding: '6px 10px',
        }}
      >
        <div
          style={{
            color: '#3A4F6C',
            fontSize: 8,
            fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: '0.12em',
            marginBottom: 4,
          }}
        >
          LEGEND
        </div>
        <LegendRow color="#FF3B2F" size={12} label="Live incident" />
        {heatmapActive ? (
          <LegendRow color="#FFB400" size={8} label="Crash density (FARS)" gradient />
        ) : (
          <>
            <LegendRow color="#FF3B2F" size={8} label="Fatal (FARS)" />
            <LegendRow color="#FFB400" size={8} label="Serious (FARS)" />
            <LegendRow color="#FF7B00" size={8} label="Moderate (FARS)" />
          </>
        )}
        <div
          style={{
            color: '#3A4F6C',
            fontSize: 7,
            borderTop: '1px solid #122030',
            paddingTop: 4,
            marginTop: 3,
          }}
        >
          NHTSA FARS 2022–2023
        </div>
      </div>
    </div>
  );
}

function LegendRow({ color, size, label, gradient }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
      {gradient ? (
        <span
          style={{
            display: 'inline-block',
            width: 24,
            height: 6,
            borderRadius: 2,
            background: 'linear-gradient(to right, #FFB400, #FF7B00, #FF3B2F)',
            flexShrink: 0,
          }}
        />
      ) : (
        <span style={{ color, fontSize: size }}>●</span>
      )}
      <span style={{ color: '#7A90B0', fontSize: 9 }}>{label}</span>
    </div>
  );
}
