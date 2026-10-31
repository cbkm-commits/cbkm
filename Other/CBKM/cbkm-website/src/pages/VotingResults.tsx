import React, { useState, useEffect } from 'react';
import { useEvents } from '../context/EventsContext';
import { fetchVotingParticipants } from '../lib/db/registrations';
import { fetchVotes, computeResults, VoteResult } from '../lib/db/votes';
import { formatEventDate } from '../lib/dateUtils';

const GOLD = '#C9943A';
const GOLD_LIGHT = '#E8C07A';
const BG = '#0D0D0D';
const SURFACE = '#161616';
const SURFACE2 = '#1E1E1E';
const TEXT = '#F5EDD8';
const MUTED = '#888';
const BORDER = 'rgba(255,255,255,0.07)';

function toRubric(r: VoteResult, votingType: string) {
  if (votingType === 'stars') return ((r.avgScore / 5) * 30).toFixed(1);
  if (votingType === 'score') return ((r.avgScore / 10) * 30).toFixed(1);
  return ((r.percent / 100) * 30).toFixed(1);
}

const MEDALS = ['🥇', '🥈', '🥉'];

function CategorySection({ category, items, votingType, showName, showNumber }: {
  category: string;
  items: VoteResult[];
  votingType: string;
  showName: boolean;
  showNumber: boolean;
}) {
  const sorted = [...items].sort((a, b) =>
    votingType === 'choice' ? b.totalVotes - a.totalVotes : b.avgScore - a.avgScore || b.totalVotes - a.totalVotes
  );
  const topValue = sorted[0]
    ? votingType === 'choice' ? sorted[0].percent : sorted[0].avgScore
    : 1;
  const totalCatVotes = votingType === 'choice'
    ? sorted.reduce((s, r) => s + r.totalVotes, 0)
    : sorted.length > 0 ? sorted[0].totalVotes : 0;

  return (
    <div style={{ marginBottom: 36 }}>
      {/* Category header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 3, height: 20, background: `linear-gradient(to bottom, ${GOLD}, ${GOLD_LIGHT})`, borderRadius: 2, flexShrink: 0 }} />
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(15px,3vw,19px)',
            fontWeight: 700,
            color: TEXT,
            margin: 0,
            letterSpacing: '0.01em',
          }}>{category}</h2>
        </div>
        <span style={{ fontSize: 12, color: MUTED, whiteSpace: 'nowrap', marginLeft: 12 }}>
          {sorted.length} performer{sorted.length !== 1 ? 's' : ''}
          {votingType === 'choice' && ` · ${totalCatVotes} vote${totalCatVotes !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Performer cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map((r, i) => {
          const isFirst = i === 0;
          const rawValue = votingType === 'choice' ? r.percent : r.avgScore;
          const barPct = topValue > 0 ? (rawValue / topValue) * 100 : 0;
          const rubric = toRubric(r, votingType);
          const medal = MEDALS[i];

          return (
            <div key={r.registration.id} style={{
              background: isFirst
                ? `linear-gradient(135deg, rgba(201,148,58,0.12) 0%, rgba(201,148,58,0.04) 100%)`
                : SURFACE2,
              border: `1px solid ${isFirst ? `rgba(201,148,58,0.35)` : BORDER}`,
              borderRadius: 14,
              padding: '14px 18px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Subtle glow for 1st place */}
              {isFirst && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
                }} />
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                {/* Rank */}
                <div style={{
                  width: 32, flexShrink: 0, textAlign: 'center',
                  fontSize: medal ? 20 : 13,
                  fontWeight: 700,
                  color: !medal ? MUTED : undefined,
                }}>
                  {medal || `${i + 1}`}
                </div>

                {/* Name + number */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {showName && (
                    <div style={{
                      fontSize: 'clamp(13px,2.5vw,15px)',
                      fontWeight: isFirst ? 700 : 500,
                      color: isFirst ? GOLD_LIGHT : TEXT,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {r.registration.name}
                    </div>
                  )}
                  {showNumber && r.registration.participantNumber && (
                    <div style={{ fontSize: 11, color: GOLD, marginTop: 1, fontWeight: 600 }}>
                      #{r.registration.participantNumber}
                    </div>
                  )}
                </div>

                {/* Score */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: isFirst ? GOLD : TEXT }}>
                    {votingType === 'choice'
                      ? `${r.percent}%`
                      : `${r.avgScore}${votingType === 'stars' ? '★' : '/10'}`}
                  </div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 1 }}>
                    {votingType === 'choice'
                      ? `${r.totalVotes} vote${r.totalVotes !== 1 ? 's' : ''}`
                      : `${r.totalVotes} vote${r.totalVotes !== 1 ? 's' : ''}`}
                    {' · '}<span style={{ color: isFirst ? GOLD : '#666' }}>{rubric}/30</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 100, height: 5, overflow: 'hidden', marginLeft: 44 }}>
                <div style={{
                  width: `${barPct}%`,
                  height: '100%',
                  background: isFirst
                    ? `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})`
                    : i === 1 ? 'rgba(192,192,192,0.45)'
                    : i === 2 ? 'rgba(180,120,60,0.45)'
                    : 'rgba(201,148,58,0.2)',
                  borderRadius: 100,
                  transition: 'width 0.8s ease',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
      const computed = computeResults(
        votes,
        participants.map(p => ({
          id: p.id, name: p.name,
          category: p.category || '',
          participantNumber: p.participantNumber || '',
        })),
        event?.votingType || 'choice'
      );
      setResults(computed);
      setTotalVotes(votes.length);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [selectedEventId, events]);

  useEffect(() => {
    if (publicEvents.length > 0 && !selectedEventId) setSelectedEventId(publicEvents[0].id);
  }, [publicEvents, selectedEventId]);

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const votingType = selectedEvent?.votingType || 'choice';
  const df = selectedEvent?.votingDisplayFields ?? {};
  const showName = df.name !== false;
  const showNumber = df.number !== false;

  // Group results by category, preserve alphabetical category order
  const grouped: Record<string, VoteResult[]> = {};
  results.forEach(r => {
    const cat = r.registration.category || 'General';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(r);
  });
  const categories = Object.keys(grouped).sort();

  if (publicEvents.length === 0) {
    return (
      <div style={{ background: BG, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: TEXT, display: 'flex', flexDirection: 'column' }}>
        <header style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', borderBottom: `1px solid ${BORDER}`, background: 'rgba(13,13,13,0.96)' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 900, color: GOLD, letterSpacing: '0.05em' }}>
            CBKM <span style={{ color: TEXT }}>·</span> Results
          </div>
        </header>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>📊</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: TEXT, marginBottom: 8 }}>Results Not Published</h2>
            <p style={{ color: MUTED, fontSize: 14 }}>Results will be published after the event.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: TEXT }}>
      {/* Sticky header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', borderBottom: `1px solid ${BORDER}`,
        background: 'rgba(13,13,13,0.97)', position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 900, color: GOLD, letterSpacing: '0.05em' }}>
          CBKM <span style={{ color: TEXT }}>·</span> Results
        </div>
        {totalVotes > 0 && (
          <span style={{ fontSize: 12, color: MUTED }}>
            {totalVotes} vote{totalVotes !== 1 ? 's' : ''} cast
          </span>
        )}
      </header>

      <main style={{ maxWidth: 700, margin: '0 auto', padding: '28px 16px 72px' }}>

        {/* Event hero card */}
        {selectedEvent && (
          <div style={{ borderRadius: 20, overflow: 'hidden', border: `1px solid ${BORDER}`, marginBottom: 20, background: SURFACE }}>
            {selectedEvent.image && (
              <div style={{ height: 130, overflow: 'hidden', position: 'relative' }}>
                <img src={selectedEvent.image} alt={selectedEvent.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #161616 0%, transparent 60%)' }} />
              </div>
            )}
            <div style={{ padding: '16px 22px' }}>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(20px,4vw,28px)',
                fontWeight: 900, color: TEXT, margin: '0 0 4px',
              }}>{selectedEvent.name}</h1>
              <p style={{ color: MUTED, fontSize: 13, margin: 0 }}>{formatEventDate(selectedEvent.date)}</p>
            </div>
          </div>
        )}

        {/* Event selector */}
        {publicEvents.length > 1 && (
          <div style={{ marginBottom: 24 }}>
            <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}
              style={{
                background: SURFACE2, border: `1px solid rgba(201,148,58,0.25)`,
                borderRadius: 10, padding: '9px 14px', color: TEXT, fontSize: 14,
                width: '100%', outline: 'none', cursor: 'pointer',
              }}>
              {publicEvents.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 13, color: MUTED }}>Loading results…</div>
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>🎭</div>
            <p style={{ color: MUTED, fontSize: 14 }}>No votes recorded yet.</p>
          </div>
        ) : (
          <>
            {/* Section label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{ flex: 1, height: 1, background: BORDER }} />
              <span style={{ fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>
                Live Results
              </span>
              <div style={{ flex: 1, height: 1, background: BORDER }} />
            </div>

            {categories.map(cat => (
              <CategorySection
                key={cat}
                category={cat}
                items={grouped[cat]}
                votingType={votingType}
                showName={showName}
                showNumber={showNumber}
              />
            ))}
          </>
        )}
      </main>
    </div>
  );
}
