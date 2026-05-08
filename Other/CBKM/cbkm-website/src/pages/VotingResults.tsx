import React, { useState, useEffect } from 'react';
import { useEvents } from '../context/EventsContext';
import { fetchVotingParticipants } from '../lib/db/registrations';
import { fetchVotes, computeResults, VoteResult } from '../lib/db/votes';
import { formatEventDate } from '../lib/dateUtils';

export default function VotingResultsPage() {
  const { events } = useEvents();
  const publicEvents = events.filter(e => e.resultsPublic && !e.hidden);

  const [selectedEventId, setSelectedEventId] = useState<string>(publicEvents[0]?.id || '');
  const [results, setResults] = useState<VoteResult[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedEventId) return;
    setLoading(true);
    const event = events.find(e => e.id === selectedEventId);
    Promise.all([
      fetchVotingParticipants(selectedEventId),
      fetchVotes(selectedEventId),
    ]).then(([participants, votes]) => {
      const computed = computeResults(votes, participants.map(p => ({
        id: p.id, name: p.name, category: p.category || '', participantNumber: p.participantNumber || '',
      })), event?.votingType || 'choice');
      setResults(computed);
      setTotalVotes(votes.length);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [selectedEventId, events]);

  useEffect(() => {
    if (publicEvents.length > 0 && !selectedEventId) setSelectedEventId(publicEvents[0].id);
  }, [publicEvents, selectedEventId]);

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const votingType = selectedEvent?.votingType || 'choice';

  const s: Record<string, React.CSSProperties> = {
    page: { background: '#0D0D0D', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#F5EDD8' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(201,148,58,0.2)', background: 'rgba(13,13,13,0.96)', position: 'sticky', top: 0, zIndex: 50 },
    logo: { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 900, color: '#C9943A', letterSpacing: '0.05em' },
    main: { maxWidth: 720, margin: '0 auto', padding: '32px 20px 60px' },
    card: { background: '#1A1A1A', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', padding: '24px 20px', marginBottom: 20 },
  };

  if (publicEvents.length === 0) {
    return (
      <div style={s.page}>
        <header style={s.header}>
          <div style={s.logo}>CBKM <span style={{ color: '#F5EDD8' }}>·</span> Results</div>
        </header>
        <main style={s.main}>
          <div style={{ ...s.card, textAlign: 'center', padding: '56px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>📊</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#F5EDD8', marginBottom: 8 }}>Results Not Published</h2>
            <p style={{ color: '#777', fontSize: 14 }}>Results will be published after the event.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.logo}>CBKM <span style={{ color: '#F5EDD8' }}>·</span> Results</div>
        <span style={{ fontSize: 12, color: '#888' }}>{totalVotes} vote{totalVotes !== 1 ? 's' : ''} cast</span>
      </header>

      <main style={s.main}>
        {/* Event hero */}
        {selectedEvent && (
          <div style={{ ...s.card, padding: 0, overflow: 'hidden', marginBottom: 24 }}>
            {selectedEvent.image && (
              <div style={{ height: 140, overflow: 'hidden', position: 'relative' }}>
                <img src={selectedEvent.image} alt={selectedEvent.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #1A1A1A 0%, transparent 60%)' }} />
              </div>
            )}
            <div style={{ padding: '16px 24px' }}>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px,4vw,32px)', fontWeight: 900, color: '#F5EDD8', marginBottom: 4 }}>{selectedEvent.name}</h1>
              <p style={{ color: '#888', fontSize: 13 }}>{formatEventDate(selectedEvent.date)}</p>
            </div>
          </div>
        )}

        {publicEvents.length > 1 && (
          <div style={{ marginBottom: 20 }}>
            <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}
              style={{ background: '#252525', border: '1px solid rgba(201,148,58,0.3)', borderRadius: 10, padding: '8px 14px', color: '#F5EDD8', fontSize: 14, width: '100%', outline: 'none' }}>
              {publicEvents.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
        )}

        {loading ? (
          <div style={{ ...s.card, textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#888' }}>Loading results...</p>
          </div>
        ) : results.length === 0 ? (
          <div style={{ ...s.card, textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#888', fontSize: 14 }}>No votes recorded yet.</p>
          </div>
        ) : (
          <div style={s.card}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#C9943A', marginBottom: 20, textAlign: 'center' }}>
              Live Results
            </div>
            {results.map((r, i) => (
              <div key={r.registration.id} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? '#C9943A' : '#F5EDD8' }}>
                      {i === 0 ? '🏆 ' : `${i + 1}. `}{r.registration.name}
                    </span>
                    {r.registration.participantNumber && (
                      <span style={{ fontSize: 11, color: '#C9943A', marginLeft: 8 }}>#{r.registration.participantNumber}</span>
                    )}
                    {r.registration.category && (
                      <span style={{ fontSize: 11, color: '#666', marginLeft: 6 }}>{r.registration.category}</span>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 13, color: '#888' }}>
                    {votingType === 'choice' ? `${r.totalVotes} vote${r.totalVotes !== 1 ? 's' : ''} · ${r.percent}%`
                     : `avg ${r.avgScore}${votingType === 'stars' ? '★' : '/10'} · ${r.totalVotes} vote${r.totalVotes !== 1 ? 's' : ''}`}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 100, height: 8, overflow: 'hidden' }}>
                  <div style={{
                    width: `${votingType === 'choice' ? r.percent : (r.avgScore / (votingType === 'stars' ? 5 : 10)) * 100}%`,
                    height: '100%',
                    background: i === 0 ? 'linear-gradient(90deg,#C9943A,#E8C07A)' : 'rgba(201,148,58,0.35)',
                    borderRadius: 100, transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
