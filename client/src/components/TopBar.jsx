import { useState, useEffect } from 'react';

export default function TopBar({ stats, dataSource, onShiftReport }) {
  const [clock, setClock] = useState('');

  useEffect(() => {
    const tick = () =>
      setClock(new Date().toLocaleTimeString('en-US', { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        height: 44,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        borderBottom: '1px solid #122030',
        background: '#090E1A',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{ width: 3, height: 18, background: '#FF3B2F', borderRadius: 1 }}
        />
        <div>
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: '0.12em',
              color: '#C0CFDF',
              lineHeight: 1.1,
            }}
          >
            ATLANTA RSOC
          </div>
          <div
            style={{
              color: '#3A4F6C',
              fontSize: 8,
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: '0.12em',
            }}
          >
            ROAD SAFETY OPERATIONS CENTER
          </div>
        </div>
      </div>

      {/* Stats + clock + shift report */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <Stat label="ACTIVE" value={stats.active} color="#C0CFDF" />
        <Stat label="CRITICAL" value={stats.critical} color="#FF3B2F" />
        <Stat label="RESOLVED" value={stats.resolved} color="#00C890" />

        {/* Data source badge */}
        {dataSource === 'live' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div
              className="blink"
              style={{ width: 5, height: 5, borderRadius: '50%', background: '#00C890', flexShrink: 0 }}
            />
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9,
                color: '#00C890',
                letterSpacing: '0.08em',
                whiteSpace: 'nowrap',
              }}
            >
              GDOT 511 LIVE
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div
              className="blink"
              style={{ width: 5, height: 5, borderRadius: '50%', background: '#FFB400', flexShrink: 0 }}
            />
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9,
                color: '#FFB400',
                letterSpacing: '0.08em',
                whiteSpace: 'nowrap',
              }}
            >
              SIMULATED
            </span>
          </div>
        )}

        <button
          onClick={onShiftReport}
          style={{
            padding: '4px 11px',
            background: 'rgba(9,14,26,0.9)',
            border: '1px solid rgba(255,180,0,0.35)',
            borderRadius: 3,
            color: '#FFB400',
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 500,
            fontSize: 10,
            letterSpacing: '0.1em',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          SHIFT REPORT
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            marginLeft: 6,
          }}
        >
          <div
            className="blink"
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: '#00C890',
            }}
          />
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              color: '#00C890',
            }}
          >
            LIVE
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              color: '#6A85A8',
              marginLeft: 5,
            }}
          >
            {clock}
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 8,
              color: '#3A4F6C',
            }}
          >
            EST
          </span>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 19,
          color,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div style={{ color: '#3A4F6C', fontSize: 8, letterSpacing: '0.1em' }}>
        {label}
      </div>
    </div>
  );
}
