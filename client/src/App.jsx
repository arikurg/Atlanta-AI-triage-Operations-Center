import { useState, useEffect, useCallback, useRef } from 'react';
import { FARS, mkIncident } from './data.js';
import TopBar from './components/TopBar.jsx';
import IncidentFeed from './components/IncidentFeed.jsx';
import MapView from './components/MapView.jsx';
import AIPanel from './components/AIPanel.jsx';
import QueryBar from './components/QueryBar.jsx';
import ShiftReportModal from './components/ShiftReportModal.jsx';

export default function App() {
  const [liveIncidents, setLiveIncidents] = useState(() =>
    Array.from({ length: 7 }, mkIncident)
  );
  const [selectedInc, setSelectedInc] = useState(null);
  const [currentTab, setCurrentTab] = useState('LIVE');
  const [decisions, setDecisions] = useState({});
  const [showShiftReport, setShowShiftReport] = useState(false);
  const [dataSource, setDataSource] = useState('simulated'); // 'live' | 'simulated'
  const dataSourceRef = useRef('simulated'); // readable inside intervals without stale closure
  const mapFlyToRef = useRef(null);

  // Keep ref in sync with state (intervals read the ref to avoid stale closure)
  useEffect(() => { dataSourceRef.current = dataSource; }, [dataSource]);

  // Poll /api/incidents/live every 60s; fall back silently on empty / error
  useEffect(() => {
    async function fetchLive() {
      try {
        const r = await fetch('/api/incidents/live');
        const data = await r.json();
        if (data.incidents && data.incidents.length > 0) {
          setLiveIncidents(data.incidents);
          setDataSource('live');
        } else {
          // Empty response (no key, API error, zero ATL incidents) → stay simulated
          setDataSource('simulated');
        }
      } catch {
        setDataSource('simulated');
      }
    }

    fetchLive(); // immediate on mount
    const id = setInterval(fetchLive, 60_000);
    return () => clearInterval(id);
  }, []);

  // Auto-select first incident after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setSelectedInc((prev) => prev ?? liveIncidents[0] ?? null);
    }, 800);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Procedural incident injector — only fires when live feed is unavailable
  useEffect(() => {
    const id = setInterval(() => {
      if (dataSourceRef.current === 'simulated' && Math.random() < 0.35) {
        setLiveIncidents((prev) => [mkIncident(), ...prev.slice(0, 9)]);
      }
    }, 28_000);
    return () => clearInterval(id);
  }, []);

  const selectIncident = useCallback(
    (inc) => {
      setSelectedInc(inc);
      if (inc.isLive) setCurrentTab('LIVE');
      else setCurrentTab('HIST');
      if (mapFlyToRef.current) mapFlyToRef.current(inc.lat, inc.lng);
    },
    []
  );

  const logDecision = useCallback((id, action) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setDecisions((prev) => ({ ...prev, [id]: { action, time } }));
  }, []);

  const stats = {
    active: liveIncidents.length,
    critical: liveIncidents.filter((i) => i.severity === 'FATAL').length,
    resolved: Object.keys(decisions).length,
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#070B14',
        color: '#C0CFDF',
        fontFamily: "'Barlow', sans-serif",
        fontSize: 12,
        overflow: 'hidden',
      }}
    >
      <TopBar
        stats={stats}
        dataSource={dataSource}
        onShiftReport={() => setShowShiftReport(true)}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <IncidentFeed
          liveIncidents={liveIncidents}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          selectedInc={selectedInc}
          onSelect={selectIncident}
        />

        <MapView
          liveIncidents={liveIncidents}
          selectedInc={selectedInc}
          onSelect={selectIncident}
          mapFlyToRef={mapFlyToRef}
        />

        <AIPanel
          selectedInc={selectedInc}
          decisions={decisions}
          onDecision={logDecision}
        />
      </div>

      <QueryBar liveIncidents={liveIncidents} />

      {showShiftReport && (
        <ShiftReportModal
          incidents={liveIncidents}
          decisions={decisions}
          onClose={() => setShowShiftReport(false)}
        />
      )}
    </div>
  );
}
