import { FARS, SEV, C } from '../data.js';

export default function IncidentFeed({
  liveIncidents,
  currentTab,
  setCurrentTab,
  selectedInc,
  onSelect,
}) {
  const list = currentTab === 'LIVE' ? liveIncidents : FARS;
  const feedLabel =
    currentTab === 'LIVE'
      ? `${liveIncidents.length} active incidents · Atlanta metro`
      : `${FARS.length} records · NHTSA FARS 2022–2023`;

  return (
    <div
      style={{
        width: 232,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #122030',
        flexShrink: 0,
      }}
    >
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #122030', flexShrink: 0 }}>
        <TabButton
          label={`LIVE (${liveIncidents.length})`}
          active={currentTab === 'LIVE'}
          onClick={() => setCurrentTab('LIVE')}
        />
        <TabButton
          label="HISTORICAL"
          active={currentTab === 'HIST'}
          onClick={() => setCurrentTab('HIST')}
        />
      </div>

      {/* Feed label */}
      <div
        style={{
          padding: '4px 8px',
          color: '#3A4F6C',
          fontSize: 8,
          fontFamily: "'IBM Plex Mono', monospace",
          borderBottom: '1px solid #122030',
          flexShrink: 0,
        }}
      >
        {feedLabel}
      </div>

      {/* Incident cards */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 4 }}>
        {list.map((inc) => (
          <IncidentCard
            key={inc.id}
            inc={inc}
            isSelected={selectedInc?.id === inc.id}
            onClick={() => onSelect(inc)}
          />
        ))}
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '7px 0',
        background: active ? '#0C1220' : 'transparent',
        border: 'none',
        borderBottom: `2px solid ${active ? '#00D2E0' : 'transparent'}`,
        color: active ? '#C0CFDF' : '#3A4F6C',
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: '0.1em',
        cursor: 'pointer',
        transition: 'all 0.12s',
      }}
    >
      {label}
    </button>
  );
}

function IncidentCard({ inc, isSelected, onClick }) {
  const s = SEV[inc.severity] || SEV.MINOR;
  const timeStr = inc.isLive
    ? inc.minsAgo === 0
      ? 'just now'
      : `${inc.minsAgo}m ago`
    : inc.date;

  return (
    <div
      onClick={onClick}
      style={{
        padding: '8px 9px',
        marginBottom: 3,
        cursor: 'pointer',
        background: isSelected ? s.bg : C.panel2,
        border: `1px solid ${isSelected ? s.bd : C.b1}`,
        borderLeft: `3px solid ${s.c}`,
        borderRadius: 3,
        transition: 'all 0.12s',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 3,
        }}
      >
        <span
          style={{
            color: s.c,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.04em',
            lineHeight: 1.2,
            flex: 1,
            paddingRight: 6,
          }}
        >
          {inc.isLive && <span style={{ marginRight: 3 }}>●</span>}
          {inc.isLive ? '' : '○ '}
          {inc.type || inc.id}
        </span>
        <SevBadge sev={inc.severity} />
      </div>

      <div
        style={{
          color: C.text2,
          fontSize: 10,
          marginBottom: 3,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {inc.location}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span
          style={{
            color: C.muted,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 8,
          }}
        >
          {inc.id}
        </span>
        <span
          style={{
            color: C.text2,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 8,
          }}
        >
          {timeStr}
        </span>
      </div>
    </div>
  );
}

export function SevBadge({ sev }) {
  const s = SEV[sev] || SEV.MINOR;
  return (
    <span
      style={{
        padding: '2px 6px',
        borderRadius: 2,
        fontSize: 9,
        fontWeight: 700,
        fontFamily: "'Barlow Condensed', sans-serif",
        letterSpacing: '0.1em',
        color: s.c,
        background: s.bg,
        border: `1px solid ${s.bd}`,
        whiteSpace: 'nowrap',
      }}
    >
      {sev}
    </span>
  );
}
