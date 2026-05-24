import { useState } from 'react';
import { FARS, C } from '../data.js';

export default function QueryBar({ liveIncidents }) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submitQuery() {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          liveIncidents,
          farsCount: FARS.length,
          fatalCount: FARS.filter((f) => f.severity === 'FATAL').length,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResponse({ ok: true, text: data.answer });
    } catch (e) {
      setResponse({ ok: false, text: e.message || 'Query failed.' });
    } finally {
      setLoading(false);
      setQuery('');
    }
  }

  return (
    <div
      style={{
        borderTop: '1px solid #122030',
        background: '#090E1A',
        flexShrink: 0,
      }}
    >
      {/* Response area */}
      {(response || loading) && (
        <div
          style={{
            padding: '7px 12px',
            borderBottom: '1px solid #122030',
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
          }}
        >
          <span
            style={{
              color: C.cyan,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: '0.1em',
              flexShrink: 0,
              marginTop: 1,
            }}
          >
            ARIA ▶
          </span>
          {loading ? (
            <span
              className="blink"
              style={{
                color: C.text2,
                fontSize: 10,
                fontStyle: 'italic',
              }}
            >
              thinking...
            </span>
          ) : response?.ok ? (
            <span style={{ color: C.text2, fontSize: 10, lineHeight: 1.65 }}>
              {response.text}
            </span>
          ) : (
            <span
              style={{
                color: C.red,
                fontSize: 10,
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              {response.text}
            </span>
          )}
        </div>
      )}

      {/* Input row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '7px 12px',
        }}
      >
        <span
          style={{
            color: C.cyan,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 13,
            lineHeight: 1,
          }}
        >
          ⟩_
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && submitQuery()}
          placeholder='Ask ARIA: "Which corridor is highest risk?" or "Best units for I-285 rollover?"'
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#C0CFDF',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            caretColor: C.cyan,
          }}
        />
        <button
          onClick={submitQuery}
          disabled={loading}
          style={{
            padding: '4px 12px',
            background: 'rgba(0,210,224,0.1)',
            border: '1px solid rgba(0,210,224,0.3)',
            borderRadius: 3,
            color: C.cyan,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.08em',
            cursor: loading ? 'default' : 'pointer',
            flexShrink: 0,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '..' : 'SEND'}
        </button>
      </div>
    </div>
  );
}
