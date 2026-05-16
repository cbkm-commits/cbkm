import React, { useState, useEffect, useCallback } from 'react';
import { useEvents } from '../context/EventsContext';
import { fetchVotingParticipants } from '../lib/db/registrations';
import { castVote, getVotedPerformers } from '../lib/db/votes';
import { validateEventCode, fetchEventCodesCount } from '../lib/db/eventCodes';
import { Registration } from '../types';
import { formatEventDate } from '../lib/dateUtils';

const Star = ({ filled, onClick }: { filled: boolean; onClick: () => void }) => (
  <button type="button" onClick={onClick}
    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 3px', fontSize: 26, color: filled ? '#C9943A' : '#333', transition: 'color 0.15s' }}>★</button>
);

export default function VotePage() {
  const { events } = useEvents();
  const activeEvent = events.find(e => e.votingEnabled && !e.hidden);

  // Code gate
  const [codesRequired, setCodesRequired] = useState<boolean | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [voterToken, setVoterToken] = useState<string | null>(null);
  const [codeValidating, setCodeValidating] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Voting state
  const [participants, setParticipants] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [scores, setScores] = useState<Record<string, number>>({});
  const [submittingFor, setSubmittingFor] = useState<string | null>(null);
  // choice: selected performer per category { [category]: registrationId }
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (!activeEvent) return;
    fetchEventCodesCount(activeEvent.id).then(count => {
      setCodesRequired(count > 0);
      // Restore saved token for this event
      if (count > 0) {
        const saved = sessionStorage.getItem(`cbkm_voter_${activeEvent.id}`);
        if (saved) setVoterToken(saved);
      }
    }).catch(() => setCodesRequired(false));
  }, [activeEvent?.id]);

  const loadVoting = useCallback(async (eventId: string, token: string) => {
    setLoading(true);
    try {
      const [parts, voted] = await Promise.all([
        fetchVotingParticipants(eventId),
        getVotedPerformers(eventId, token),
      ]);
      setParticipants(parts);
      setVotedIds(new Set(voted));
      setError('');
    } catch { setError('Failed to load performers.'); }
    setLoading(false);
  }, []);

  const handleRefresh = async () => {
    if (!activeEvent || !voterToken || refreshing) return;
    setRefreshing(true);
    await loadVoting(activeEvent.id, voterToken);
    setRefreshing(false);
  };

  useEffect(() => {
    if (activeEvent && voterToken) loadVoting(activeEvent.id, voterToken);
  }, [activeEvent, voterToken, loadVoting]);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent) return;
    const code = codeInput.trim().toUpperCase();
    if (!code) { setCodeError('Please enter your code.'); return; }
    setCodeValidating(true);
    setCodeError('');
    const valid = await validateEventCode(activeEvent.id, code);
    if (valid) {
      sessionStorage.setItem(`cbkm_voter_${activeEvent.id}`, code);
      setVoterToken(code);
    } else {
      setCodeError('Invalid code. Please check and try again.');
    }
    setCodeValidating(false);
  };

  // Choice: one vote per category
  const handleCategoryVote = async (category: string) => {
    if (!activeEvent || !voterToken || submittingFor) return;
    const performerId = selections[category];
    if (!performerId) { setError(`Please select a performer in the "${category}" category first.`); return; }
    setSubmittingFor(category);
    setError('');
    try {
      await castVote(activeEvent.id, performerId, voterToken, JSON.stringify(performerId));
      setVotedIds(prev => { const s = new Set(Array.from(prev)); s.add(performerId); return s; });
    } catch (err: any) {
      console.error('castVote error (choice):', err);
      if (err?.code === '23505') {
        setVotedIds(prev => { const s = new Set(Array.from(prev)); s.add(performerId); return s; });
      } else if (err?.code === '42501' || err?.message?.includes('policy')) {
        setError('This performance is no longer accepting votes. Please refresh to see the latest lineup.');
      } else {
        setError(`Failed to submit vote: ${err?.message || err?.code || 'unknown error'}`);
      }
    }
    setSubmittingFor(null);
  };

  // Stars/score: one rating per performer
  const handleSubmitPerformer = async (performerId: string) => {
    if (!activeEvent || !voterToken || submittingFor) return;
    const score = scores[performerId];
    if (!score) { setError('Please rate this performer first.'); return; }
    setSubmittingFor(performerId);
    setError('');
    try {
      await castVote(activeEvent.id, performerId, voterToken, JSON.stringify(score));
      setVotedIds(prev => { const s = new Set(Array.from(prev)); s.add(performerId); return s; });
    } catch (err: any) {
      console.error('castVote error (stars/score):', err);
      if (err?.code === '23505') {
        setVotedIds(prev => { const s = new Set(Array.from(prev)); s.add(performerId); return s; });
      } else if (err?.code === '42501' || err?.message?.includes('policy')) {
        setError('This performance is no longer accepting votes. Please refresh to see the latest lineup.');
      } else {
        setError(`Failed to submit: ${err?.message || err?.code || 'unknown error'}`);
      }
    }
    setSubmittingFor(null);
  };

  const s = {
    page: { background: '#0D0D0D', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#F5EDD8' } as React.CSSProperties,
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(201,148,58,0.2)', background: 'rgba(13,13,13,0.96)', position: 'sticky', top: 0, zIndex: 50 } as React.CSSProperties,
    logo: { fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 900, color: '#C9943A', letterSpacing: '0.05em' } as React.CSSProperties,
    main: { maxWidth: 860, margin: '0 auto', padding: '32px 20px 60px' } as React.CSSProperties,
    card: { background: '#1A1A1A', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', padding: '24px 20px', marginBottom: 20 } as React.CSSProperties,
    title: { fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px,4vw,34px)', fontWeight: 900, color: '#F5EDD8', lineHeight: 1.15, marginBottom: 6 } as React.CSSProperties,
    goldBtn: { background: 'linear-gradient(135deg,#C9943A,#E8C07A)', color: '#0D0D0D', border: 'none', padding: '11px 30px', borderRadius: 100, fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.2s' } as React.CSSProperties,
  };

  const EventHero = () => (
    <div style={{ ...s.card, padding: 0, overflow: 'hidden', marginBottom: 24 }}>
      {activeEvent!.image && (
        <div style={{ height: 130, overflow: 'hidden', position: 'relative' }}>
          <img src={activeEvent!.image} alt={activeEvent!.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #1A1A1A 0%, transparent 60%)' }} />
        </div>
      )}
      <div style={{ padding: '16px 24px' }}>
        <h1 style={s.title}>{activeEvent!.name}</h1>
        <p style={{ color: '#888', fontSize: 13 }}>{formatEventDate(activeEvent!.date)}{activeEvent!.location ? ` · ${activeEvent!.location}` : ''}</p>
      </div>
    </div>
  );

  const LiveBadge = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#4CAF7D' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4CAF7D', display: 'inline-block', animation: 'cbkmPulse 1.5s infinite' }} />
      Voting Open
    </div>
  );

  // ── No active event ────────────────────────────────────────────────────────
  if (!activeEvent) {
    return (
      <div style={s.page}>
        <header style={s.header}><div style={s.logo}>CBKM <span style={{ color: '#F5EDD8' }}>·</span> Vote</div></header>
        <main style={s.main}>
          <div style={{ ...s.card, textAlign: 'center', padding: '56px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🗳</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#F5EDD8', marginBottom: 10 }}>No Active Voting</h2>
            <p style={{ color: '#777', fontSize: 14 }}>No voting session is currently open. Check back during the event.</p>
          </div>
        </main>
        <style>{`@keyframes cbkmPulse { 0%,100%{opacity:1} 50%{opacity:0.35} }`}</style>
      </div>
    );
  }

  const votingType = activeEvent.votingType || 'choice';
  const df = activeEvent.votingDisplayFields ?? {};
  const showName = df.name !== false;
  const showNumber = df.number !== false;
  const showGroupCategory = df.groupCategory !== false;
  const showPerformanceCategory = df.performanceCategory !== false;

  // ── Codes loading ──────────────────────────────────────────────────────────
  if (codesRequired === null) {
    return (
      <div style={s.page}>
        <header style={s.header}><div style={s.logo}>CBKM <span style={{ color: '#F5EDD8' }}>·</span> Vote</div></header>
        <main style={s.main}><EventHero /><div style={{ ...s.card, textAlign: 'center', padding: '40px' }}><p style={{ color: '#888' }}>Loading...</p></div></main>
        <style>{`@keyframes cbkmPulse { 0%,100%{opacity:1} 50%{opacity:0.35} }`}</style>
      </div>
    );
  }

  // ── No codes generated for this event ─────────────────────────────────────
  if (codesRequired === false) {
    return (
      <div style={s.page}>
        <header style={s.header}><div style={s.logo}>CBKM <span style={{ color: '#F5EDD8' }}>·</span> Vote</div></header>
        <main style={s.main}>
          <EventHero />
          <div style={{ ...s.card, textAlign: 'center', padding: '56px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🎟</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#F5EDD8', marginBottom: 8 }}>Attendee Codes Required</h2>
            <p style={{ color: '#777', fontSize: 14 }}>Voting codes have not been issued for this event yet. Please check with the organizer.</p>
          </div>
        </main>
        <style>{`@keyframes cbkmPulse { 0%,100%{opacity:1} 50%{opacity:0.35} }`}</style>
      </div>
    );
  }

  // ── Attendee code gate ─────────────────────────────────────────────────────
  if (!voterToken) {
    return (
      <div style={s.page}>
        <header style={s.header}>
          <div style={s.logo}>CBKM <span style={{ color: '#F5EDD8' }}>·</span> Vote</div>
          <LiveBadge />
        </header>
        <main style={s.main}>
          <EventHero />
          <div style={{ ...s.card, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🎟</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#F5EDD8', marginBottom: 6 }}>Enter Your Attendee Code</h2>
            <p style={{ color: '#777', fontSize: 13, marginBottom: 20 }}>Enter the unique code from your ticket or provided by the organizer.</p>
            <form onSubmit={handleCodeSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <input
                value={codeInput}
                onChange={e => setCodeInput(e.target.value.toUpperCase())}
                placeholder="XXXXXX"
                maxLength={10}
                style={{ background: '#252525', border: '2px solid rgba(201,148,58,0.3)', borderRadius: 12, padding: '12px 20px', fontSize: 22, color: '#F5EDD8', textAlign: 'center', letterSpacing: '0.3em', width: '100%', maxWidth: 220, outline: 'none', fontFamily: 'monospace' }}
                autoFocus
              />
              {codeError && <p style={{ color: '#ff6b6b', fontSize: 13, margin: 0 }}>{codeError}</p>}
              <button type="submit" disabled={codeValidating} style={{ ...s.goldBtn, padding: '13px 40px', fontSize: 15, opacity: codeValidating ? 0.6 : 1 }}>
                {codeValidating ? 'Checking...' : 'Enter'}
              </button>
            </form>
          </div>
        </main>
        <style>{`@keyframes cbkmPulse { 0%,100%{opacity:1} 50%{opacity:0.35} }`}</style>
      </div>
    );
  }

  // ── Loading performers ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={s.page}>
        <header style={s.header}><div style={s.logo}>CBKM <span style={{ color: '#F5EDD8' }}>·</span> Vote</div></header>
        <main style={s.main}><EventHero /><div style={{ ...s.card, textAlign: 'center', padding: '40px' }}><p style={{ color: '#888' }}>Loading performers...</p></div></main>
        <style>{`@keyframes cbkmPulse { 0%,100%{opacity:1} 50%{opacity:0.35} }`}</style>
      </div>
    );
  }

  // ── No performers yet ──────────────────────────────────────────────────────
  if (participants.length === 0) {
    return (
      <div style={s.page}>
        <header style={s.header}><div style={s.logo}>CBKM <span style={{ color: '#F5EDD8' }}>·</span> Vote</div><LiveBadge /></header>
        <main style={s.main}>
          <EventHero />
          <div style={{ ...s.card, textAlign: 'center', padding: '48px 24px' }}>
            <p style={{ color: '#888', fontSize: 14 }}>Waiting for performances to be announced...</p>
          </div>
        </main>
        <style>{`@keyframes cbkmPulse { 0%,100%{opacity:1} 50%{opacity:0.35} }`}</style>
      </div>
    );
  }

  // ── Group performers by category (for choice voting) ───────────────────────
  const categories = Array.from(new Set(participants.map(p => p.category || 'General'))).sort();
  const byCategory: Record<string, Registration[]> = {};
  categories.forEach(cat => { byCategory[cat] = participants.filter(p => (p.category || 'General') === cat); });

  // For stars/score: did they rate all?
  const allRated = votingType !== 'choice' && participants.every(p => votedIds.has(p.id));
  // For choice: which categories are fully voted?
  const votedCategories = new Set(
    participants.filter(p => votedIds.has(p.id)).map(p => p.category || 'General')
  );
  const allCategoriesVoted = categories.every(c => votedCategories.has(c));

  const RefreshBtn = () => (
    <button onClick={handleRefresh} disabled={refreshing}
      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 100, padding: '5px 14px', fontSize: 12, fontWeight: 600, color: '#C9943A', cursor: refreshing ? 'default' : 'pointer', opacity: refreshing ? 0.5 : 1, fontFamily: 'inherit' }}>
      {refreshing ? '↻ Refreshing...' : '↻ Refresh'}
    </button>
  );

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.logo}>CBKM <span style={{ color: '#F5EDD8' }}>·</span> Vote</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <RefreshBtn />
          <LiveBadge />
        </div>
      </header>

      <main style={s.main}>
        <EventHero />

        {/* All done banner */}
        {(allRated || allCategoriesVoted) && (
          <div style={{ ...s.card, textAlign: 'center', padding: '40px 24px', marginBottom: 20 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#C9943A', marginBottom: 6 }}>
              {votingType === 'choice' ? 'All Votes Submitted!' : 'All Ratings Submitted!'}
            </h2>
            <p style={{ color: '#888', fontSize: 14 }}>Thank you for participating. Your votes have been recorded.</p>
          </div>
        )}

        {error && <p style={{ color: '#ff6b6b', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{error}</p>}

        {/* Progress for choice */}
        {votingType === 'choice' && categories.length > 1 && (
          <div style={{ marginBottom: 20, textAlign: 'center', color: '#888', fontSize: 13 }}>
            {votedCategories.size} of {categories.length} categories voted
          </div>
        )}

        {/* Stars/score progress */}
        {votingType !== 'choice' && (
          <div style={{ marginBottom: 20, textAlign: 'center', color: '#888', fontSize: 13 }}>
            {votedIds.size} of {participants.length} rated ·{' '}
            {votingType === 'stars' ? 'Rate each performance from 1 to 5 stars.' : 'Give each performance a score from 1 to 10.'}
          </div>
        )}

        {/* ── CHOICE: grouped by category ─────────────────────────────── */}
        {votingType === 'choice' && categories.map(cat => {
          const perfs = byCategory[cat];
          const catVoted = votedCategories.has(cat);
          const catSubmitting = submittingFor === cat;

          return (
            <div key={cat} style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {showGroupCategory && <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: catVoted ? '#4CAF7D' : '#C9943A' }}>{cat}</span>}
                  {catVoted && <span style={{ fontSize: 12, color: '#4CAF7D', background: 'rgba(76,175,61,0.1)', border: '1px solid rgba(76,175,61,0.3)', borderRadius: 100, padding: '2px 10px' }}>✓ Voted</span>}
                </div>
                {!catVoted && (
                  <button onClick={() => handleCategoryVote(cat)} disabled={!selections[cat] || catSubmitting}
                    style={{ ...s.goldBtn, opacity: (!selections[cat] || catSubmitting) ? 0.4 : 1, cursor: (!selections[cat] || catSubmitting) ? 'not-allowed' : 'pointer' }}>
                    {catSubmitting ? 'Submitting...' : 'Submit Vote'}
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {perfs.map(p => {
                  const isVoted = votedIds.has(p.id);
                  const isSelected = selections[cat] === p.id;
                  return (
                    <div key={p.id}
                      onClick={() => !catVoted && setSelections(prev => ({ ...prev, [cat]: p.id }))}
                      style={{
                        background: isVoted ? 'rgba(76,175,61,0.08)' : isSelected ? 'rgba(201,148,58,0.12)' : '#1A1A1A',
                        border: `2px solid ${isVoted ? 'rgba(76,175,61,0.4)' : isSelected ? '#C9943A' : 'rgba(255,255,255,0.07)'}`,
                        borderRadius: 14, padding: '16px 14px', textAlign: 'center',
                        cursor: catVoted ? 'default' : 'pointer', transition: 'all 0.2s',
                        opacity: catVoted && !isVoted ? 0.5 : 1,
                      }}>
                      <div style={{ width: 42, height: 42, borderRadius: '50%', background: isVoted ? 'rgba(76,175,61,0.3)' : 'linear-gradient(135deg,#C9943A,#E8C07A)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: 16, fontWeight: 700, color: isVoted ? '#4CAF7D' : '#0D0D0D' }}>
                        {isVoted ? '✓' : (showNumber && p.participantNumber ? p.participantNumber : showName ? p.name.charAt(0) : '?')}
                      </div>
                      {showName && <div style={{ fontWeight: 700, fontSize: 14, color: '#F5EDD8', marginBottom: 2 }}>{p.name}</div>}
                      {showNumber && p.participantNumber && <div style={{ fontSize: 11, color: '#C9943A' }}>#{p.participantNumber}</div>}
                      {isSelected && !isVoted && <div style={{ marginTop: 6, fontSize: 11, color: '#C9943A', fontWeight: 600 }}>✓ Selected</div>}
                      {isVoted && <div style={{ marginTop: 6, fontSize: 11, color: '#4CAF7D', fontWeight: 600 }}>Voted</div>}
                    </div>
                  );
                })}
              </div>

              {!catVoted && !selections[cat] && (
                <p style={{ textAlign: 'center', color: '#555', fontSize: 12, marginTop: 8 }}>Select a performer above, then click Submit Vote</p>
              )}
            </div>
          );
        })}

        {/* ── STARS / SCORE: flat list with per-performer submit ─────────── */}
        {votingType !== 'choice' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 14 }}>
            {participants.map(p => {
              const isVoted = votedIds.has(p.id);
              const isSubmitting = submittingFor === p.id;
              return (
                <div key={p.id} style={{
                  background: isVoted ? 'rgba(76,175,61,0.08)' : '#1A1A1A',
                  border: `2px solid ${isVoted ? 'rgba(76,175,61,0.4)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 16, padding: '20px 16px', textAlign: 'center', opacity: isVoted ? 0.8 : 1,
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: isVoted ? 'rgba(76,175,61,0.3)' : 'linear-gradient(135deg,#C9943A,#E8C07A)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: 16, fontWeight: 700, color: isVoted ? '#4CAF7D' : '#0D0D0D' }}>
                    {isVoted ? '✓' : (showNumber && p.participantNumber ? p.participantNumber : showName ? p.name.charAt(0) : '?')}
                  </div>
                  {showName && <div style={{ fontWeight: 700, fontSize: 14, color: '#F5EDD8', marginBottom: 2 }}>{p.name}</div>}
                  {showPerformanceCategory && p.category && <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>{p.category}</div>}
                  {showNumber && p.participantNumber && <div style={{ fontSize: 11, color: '#C9943A', marginBottom: 10 }}>#{p.participantNumber}</div>}

                  {votingType === 'stars' && !isVoted && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginBottom: 10 }}>
                        {[1,2,3,4,5].map(star => (
                          <Star key={star} filled={(scores[p.id] ?? 0) >= star} onClick={() => setScores(prev => ({ ...prev, [p.id]: star }))} />
                        ))}
                      </div>
                      <button onClick={() => handleSubmitPerformer(p.id)} disabled={isSubmitting || !scores[p.id]}
                        style={{ ...s.goldBtn, opacity: (!scores[p.id] || isSubmitting) ? 0.4 : 1, cursor: (!scores[p.id] || isSubmitting) ? 'not-allowed' : 'pointer' }}>
                        {isSubmitting ? '...' : 'Submit'}
                      </button>
                    </>
                  )}
                  {votingType === 'stars' && isVoted && (
                    <div style={{ fontSize: 13, color: '#4CAF7D', fontWeight: 600 }}>
                      {'★'.repeat(scores[p.id] || 0)}{'☆'.repeat(5 - (scores[p.id] || 0))} Submitted
                    </div>
                  )}

                  {votingType === 'score' && !isVoted && (
                    <>
                      <input type="number" min={1} max={10} value={scores[p.id] ?? ''}
                        onChange={e => { const v = Math.min(10, Math.max(1, Number(e.target.value))); setScores(prev => ({ ...prev, [p.id]: v })); }}
                        style={{ background: '#252525', border: '1px solid rgba(201,148,58,0.4)', borderRadius: 8, padding: '6px 10px', color: '#F5EDD8', fontSize: 18, width: 70, textAlign: 'center', outline: 'none', marginBottom: 10 }}
                        placeholder="1-10"
                      />
                      <br />
                      <button onClick={() => handleSubmitPerformer(p.id)} disabled={isSubmitting || !scores[p.id]}
                        style={{ ...s.goldBtn, opacity: (!scores[p.id] || isSubmitting) ? 0.4 : 1, cursor: (!scores[p.id] || isSubmitting) ? 'not-allowed' : 'pointer' }}>
                        {isSubmitting ? '...' : 'Submit'}
                      </button>
                    </>
                  )}
                  {votingType === 'score' && isVoted && (
                    <div style={{ fontSize: 13, color: '#4CAF7D', fontWeight: 600 }}>{scores[p.id]}/10 Submitted</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <style>{`
        @keyframes cbkmPulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        input[type=number]::-webkit-inner-spin-button { opacity: 1; }
      `}</style>
    </div>
  );
}
