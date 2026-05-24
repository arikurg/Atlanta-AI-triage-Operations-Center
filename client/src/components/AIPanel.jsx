import { useState, useEffect, useRef } from 'react';
import { SEV, C, nearbyFARS } from '../data.js';
import { SevBadge } from './IncidentFeed.jsx';

export default function AIPanel({ selectedInc, decisions, onDecision }) {
  return (
    <div
      style={{
        width: 278,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid #122030',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* ARIA header */}
      <div
        style={{
          padding: '6px 12px',
          borderBottom: '1px solid #122030',
          background: '#090E1A',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
        }}
      >
        <div
          className="blink"
          style={{ width: 5, height: 5, borderRadius: '50%', background: '#00D2E0' }}
        />
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.12em',
            color: '#00D2E0',
          }}
        >
          ARIA
        </span>
        <span
          style={{
            color: '#3A4F6C',
            fontSize: 8,
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          AI ROAD INTELLIGENCE ADVISOR
        </span>
      </div>

      {/* Panel body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 0 }}>
        {selectedInc ? (
          <IncidentAnalysis
            inc={selectedInc}
            decision={decisions[selectedInc.id]}
            onDecision={onDecision}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#3A4F6C',
        padding: '30px 20px',
        textAlign: 'center',
        height: '100%',
      }}
    >
      <div
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 13,
          letterSpacing: '0.12em',
          lineHeight: 2,
        }}
      >
        SELECT AN INCIDENT
        <br />
        TO INITIALIZE ARIA
      </div>
      <div style={{ fontSize: 10, color: '#2A3A50', marginTop: 8 }}>
        Click any card or map marker
      </div>
    </div>
  );
}

function IncidentAnalysis({ inc, decision, onDecision }) {
  const [triage, setTriage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setTriage(null);
    setError(null);
    setLoading(true);

    const hist = nearbyFARS(inc);
    fetch('/api/triage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inc, hist }),
      signal: ctrl.signal,
    })
      .then(async (r) => {
        const text = await r.text();
        if (!text.trim()) throw new Error('No response from server — is the Express backend running on :3001?');
        try {
          return JSON.parse(text);
        } catch {
          throw new Error('Server returned non-JSON — check Express console for errors');
        }
      })
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setTriage(data);
        setLoading(false);
      })
      .catch((e) => {
        if (e.name === 'AbortError') return;
        setError(e.message);
        setLoading(false);
      });

    return () => ctrl.abort();
  }, [inc]);

  const s = SEV[inc.severity] || SEV.MINOR;

  return (
    <>
      {/* Incident header */}
      <div
        style={{
          padding: '10px 12px',
          borderBottom: `1px solid ${C.b1}`,
          flexShrink: 0,
          background: C.panel,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 5,
          }}
        >
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              color: C.text,
              letterSpacing: '0.04em',
              lineHeight: 1.2,
              flex: 1,
              paddingRight: 8,
            }}
          >
            {inc.type || inc.id}
          </div>
          <SevBadge sev={inc.severity} />
        </div>

        <div style={{ color: C.text2, fontSize: 10, marginBottom: 8 }}>
          {inc.location}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Metric label="VEH" value={inc.vehicles ?? 0} />
          <Metric label="INJ" value={inc.injuries ?? '—'} />
          <Metric
            label="FAT"
            value={inc.fatalities ?? '—'}
            color={(inc.fatalities ?? 0) > 0 ? C.red : C.text}
          />
          <div style={{ marginLeft: 'auto' }}>
            <div
              style={{
                color: C.muted,
                fontSize: 8,
                fontFamily: "'IBM Plex Mono', monospace",
                letterSpacing: '0.1em',
              }}
            >
              COND
            </div>
            <div
              style={{
                color: C.text2,
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                marginTop: 3,
              }}
            >
              {inc.weather || '—'}/{inc.road || '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Analysis area */}
      <div className="fade-up" style={{ padding: '10px 12px' }}>
        {loading && <LoadingState />}
        {error && <ErrorState message={error} />}
        {triage && (
          <TriageResult
            triage={triage}
            inc={inc}
            decision={decision}
            onDecision={onDecision}
          />
        )}
      </div>
    </>
  );
}

function Metric({ label, value, color = C.text }) {
  return (
    <div>
      <div
        style={{
          color: C.muted,
          fontSize: 8,
          fontFamily: "'IBM Plex Mono', monospace",
          letterSpacing: '0.1em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          color,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 16,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        color: C.text2,
        padding: '10px 0',
      }}
    >
      <div
        className="blink"
        style={{ width: 6, height: 6, background: C.cyan, borderRadius: '50%' }}
      />
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
          fontStyle: 'italic',
        }}
      >
        ARIA analyzing incident...
      </span>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div
      style={{
        color: C.red,
        fontSize: 10,
        fontFamily: "'IBM Plex Mono', monospace",
        padding: '8px 0',
      }}
    >
      Analysis failed — {message || 'check API connection'}
    </div>
  );
}

function TriageResult({ triage, inc, decision, onDecision }) {
  const sc =
    triage.severity_score >= 8
      ? C.red
      : triage.severity_score >= 6
      ? C.amber
      : C.green;

  const isLive = inc.isLive;
  const btns = isLive
    ? [
        { l: 'ACCEPT',   c: C.green, a: 'ACCEPTED'  },
        { l: 'OVERRIDE', c: C.amber, a: 'OVERRIDDEN' },
        { l: 'ESCALATE', c: C.red,   a: 'ESCALATED'  },
      ]
    : [
        { l: 'LOG ANALYSIS',  c: C.blue,  a: 'ANALYSIS LOGGED'   },
        { l: 'FLAG CORRIDOR', c: C.amber, a: 'CORRIDOR FLAGGED'  },
        { l: 'MARK REVIEWED', c: C.green, a: 'REVIEWED'          },
      ];

  return (
    <>
      {/* Severity score */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 10px',
          background: `${sc}10`,
          border: `1px solid ${sc}28`,
          borderRadius: 3,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 38,
            fontWeight: 500,
            color: sc,
            lineHeight: 1,
          }}
        >
          {triage.severity_score}
        </div>
        <div>
          <div
            style={{
              color: sc,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '0.1em',
            }}
          >
            {triage.severity_label}
          </div>
          <div
            style={{
              color: C.muted,
              fontSize: 8,
              fontFamily: "'IBM Plex Mono', monospace",
              marginTop: 1,
            }}
          >
            ARIA SEVERITY /10
          </div>
        </div>
      </div>

      {/* Situation brief */}
      <Section label="SITUATION BRIEF">
        <div
          style={{
            color: C.text2,
            fontSize: 10,
            lineHeight: 1.65,
            paddingLeft: 8,
            borderLeft: `2px solid ${C.b2}`,
          }}
        >
          {triage.situation_brief}
        </div>
      </Section>

      {/* Est clearance + lane impact */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
        <InfoBox label="EST CLEARANCE" value={`${triage.est_clearance_min} min`} />
        <InfoBox
          label="LANE IMPACT"
          value={(triage.lane_impact || '—').substring(0, 20)}
        />
      </div>

      {/* Response units */}
      <Section label="RECOMMENDED UNITS">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {(triage.response_units || []).map((u) => (
            <span
              key={u}
              style={{
                padding: '3px 7px',
                background: `${C.cyan}12`,
                border: `1px solid ${C.cyan}30`,
                borderRadius: 2,
                color: C.cyan,
                fontSize: 9,
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              {u}
            </span>
          ))}
        </div>
      </Section>

      {/* Priority actions */}
      <Section label="PRIORITY ACTIONS">
        {(triage.priority_actions || []).map((a, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 7,
              marginBottom: 5,
              alignItems: 'flex-start',
            }}
          >
            <span
              style={{
                color: C.amber,
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9,
                minWidth: 12,
                flexShrink: 0,
              }}
            >
              {i + 1}.
            </span>
            <span style={{ color: C.text2, fontSize: 10, lineHeight: 1.5 }}>
              {a}
            </span>
          </div>
        ))}
      </Section>

      {/* Historical note */}
      {triage.historical_note && (
        <div
          style={{
            padding: '7px 9px',
            background: `${C.blue}0C`,
            border: `1px solid ${C.blue}20`,
            borderRadius: 3,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              color: C.muted,
              fontSize: 8,
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: '0.12em',
              marginBottom: 3,
            }}
          >
            HISTORICAL CONTEXT · NHTSA FARS
          </div>
          <div style={{ color: C.blue, fontSize: 10, lineHeight: 1.55 }}>
            {triage.historical_note}
          </div>
        </div>
      )}

      {/* Decision buttons */}
      <DecisionArea
        incId={inc.id}
        decision={decision}
        btns={btns}
        onDecision={onDecision}
      />
    </>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          color: C.muted,
          fontSize: 8,
          fontFamily: "'Barlow Condensed', sans-serif",
          letterSpacing: '0.12em',
          marginBottom: 5,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div
      style={{
        flex: 1,
        padding: '5px 8px',
        background: C.panel2,
        border: `1px solid ${C.b1}`,
        borderRadius: 3,
      }}
    >
      <div
        style={{
          color: C.muted,
          fontSize: 8,
          fontFamily: "'IBM Plex Mono', monospace",
          letterSpacing: '0.1em',
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: C.text,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function DecisionArea({ incId, decision, btns, onDecision }) {
  if (decision) {
    const col =
      decision.action === 'ACCEPTED'
        ? C.green
        : decision.action === 'ESCALATED'
        ? C.red
        : C.amber;
    return (
      <div
        style={{
          padding: 7,
          background: `${col}10`,
          border: `1px solid ${col}30`,
          borderRadius: 3,
          textAlign: 'center',
        }}
      >
        <span
          style={{
            color: col,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.08em',
          }}
        >
          ✓ {decision.action} · {decision.time}
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 5 }}>
      {btns.map((b) => (
        <button
          key={b.a}
          onClick={() => onDecision(incId, b.a)}
          style={{
            flex: 1,
            padding: '7px 4px',
            background: `${b.c}12`,
            border: `1px solid ${b.c}40`,
            borderRadius: 3,
            color: b.c,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: '0.08em',
            cursor: 'pointer',
          }}
        >
          {b.l}
        </button>
      ))}
    </div>
  );
}
