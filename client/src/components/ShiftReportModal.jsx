import { useState, useEffect, useRef } from 'react';
import { FARS } from '../data.js';

// Pre-compute FARS stats once (module-level, cheap)
const FARS_STATS = {
  total: FARS.length,
  fatal: FARS.filter((f) => f.severity === 'FATAL').length,
  serious: FARS.filter((f) => f.severity === 'SERIOUS').length,
  topCorridors: [
    'I-285', 'I-75/85 Connector', 'Metropolitan Pkwy SW',
    'Buford Hwy NE', 'Campbellton Rd SW', 'Moreland Ave SE',
  ],
};

export default function ShiftReportModal({ incidents, decisions, onClose }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const now = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZoneName: 'short',
    });

    fetch('/api/aria', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incidents,
        decisions,
        farsStats: FARS_STATS,
        now,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setReport(data.report);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || 'Report generation failed.');
        setLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  function exportReport() {
    const ts = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .slice(0, 19);
    const filename = `RSOC_ShiftReport_${ts}.txt`;
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.78)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: '#090E1A',
          border: '1px solid #1C3045',
          borderRadius: 5,
          width: 680,
          maxWidth: 'calc(100vw - 40px)',
          maxHeight: 'calc(100vh - 80px)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
        }}
      >
        {/* Modal header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderBottom: '1px solid #122030',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 3,
                height: 16,
                background: '#FFB400',
                borderRadius: 1,
              }}
            />
            <div>
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: '0.12em',
                  color: '#C0CFDF',
                  lineHeight: 1.1,
                }}
              >
                ARIA SHIFT REPORT
              </div>
              <div
                style={{
                  color: '#3A4F6C',
                  fontSize: 8,
                  fontFamily: "'IBM Plex Mono', monospace",
                  letterSpacing: '0.1em',
                  marginTop: 1,
                }}
              >
                END-OF-SHIFT SUMMARY · ATLANTA RSOC
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #1C3045',
              borderRadius: 3,
              color: '#3A4F6C',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              width: 24,
              height: 24,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 18px',
          }}
        >
          {loading && <LoadingState />}
          {error && <ErrorState message={error} />}
          {report && <ReportBody text={report} />}
        </div>

        {/* Modal footer */}
        {report && (
          <div
            style={{
              borderTop: '1px solid #122030',
              padding: '9px 14px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              flexShrink: 0,
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: '5px 14px',
                background: 'transparent',
                border: '1px solid #1C3045',
                borderRadius: 3,
                color: '#3A4F6C',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.1em',
                cursor: 'pointer',
              }}
            >
              CLOSE
            </button>
            <button
              onClick={exportReport}
              style={{
                padding: '5px 14px',
                background: 'rgba(255,180,0,0.1)',
                border: '1px solid rgba(255,180,0,0.45)',
                borderRadius: 3,
                color: '#FFB400',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.1em',
                cursor: 'pointer',
              }}
            >
              ↓ EXPORT .TXT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '48px 0',
        color: '#3A4F6C',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          className="blink"
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#00D2E0',
          }}
        />
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            color: '#00D2E0',
            letterSpacing: '0.08em',
          }}
        >
          ARIA GENERATING REPORT...
        </span>
      </div>
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 9,
          color: '#2A3A50',
          letterSpacing: '0.06em',
        }}
      >
        Compiling incidents, decisions, and corridor data
      </div>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10,
        color: '#FF3B2F',
        padding: '24px 0',
        textAlign: 'center',
      }}
    >
      Report generation failed — {message}
    </div>
  );
}

function ReportBody({ text }) {
  // Split into lines and style section headers differently
  const lines = text.split('\n');

  return (
    <div
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        lineHeight: 1.75,
        color: '#8AA0BC',
      }}
    >
      {lines.map((line, i) => {
        const isHeader =
          /^(SHIFT OVERVIEW|HIGHEST PRIORITY INCIDENTS|CORRIDOR ANALYSIS|RECOMMENDED HANDOFF NOTES)/.test(
            line.trim()
          );
        const isEmpty = line.trim() === '';

        if (isEmpty) return <div key={i} style={{ height: 8 }} />;

        if (isHeader) {
          return (
            <div
              key={i}
              style={{
                color: '#FFB400',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: '0.14em',
                marginTop: i === 0 ? 0 : 18,
                marginBottom: 6,
                paddingBottom: 5,
                borderBottom: '1px solid rgba(255,180,0,0.18)',
              }}
            >
              {line.trim()}
            </div>
          );
        }

        return (
          <div key={i} style={{ color: '#8AA0BC' }}>
            {line}
          </div>
        );
      })}
    </div>
  );
}
