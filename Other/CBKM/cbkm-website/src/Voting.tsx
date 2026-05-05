// ─────────────────────────────────────────────────────
// CBKM — Public Audience Voting Page
// Route: /vote
// ─────────────────────────────────────────────────────

import { useState } from "react";
import { useVoting } from "./hooks/useVoting";
import { ContestantCard } from "./components/ContestantCard";
import { ResultsPanel } from "./components/ResultsPanel";

export default function VotePage() {
  const { contestants, votingOpen, hasVoted, castVote, getResults } = useVoting();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const enabledContestants = contestants.filter((c) => c.enabled);
  const alreadyVoted = !!hasVoted;
  const results = getResults();
  const hasResults = results.some((r) => r.votes > 0);

  const handleSubmit = () => {
    if (!selectedId || alreadyVoted) return;
    castVote(selectedId);
    setSelectedId(null);
  };

  return (
    <div style={{ background: "#0D0D0D", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#F5EDD8" }}>
      {/* ── Header ── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 28px",
        borderBottom: "1px solid rgba(201,148,58,0.2)",
        background: "rgba(13,13,13,0.96)",
        position: "sticky", top: 0, zIndex: 50,
        backdropFilter: "blur(8px)",
      }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 900, color: "#C9943A", letterSpacing: "0.05em" }}>
          CBKM <span style={{ color: "#F5EDD8", fontWeight: 700 }}>·</span> Dance
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 12, fontWeight: 600,
            color: votingOpen ? "#4CAF7D" : "#888",
            background: votingOpen ? "rgba(76,175,61,0.1)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${votingOpen ? "rgba(76,175,125,0.3)" : "rgba(255,255,255,0.1)"}`,
            padding: "5px 14px", borderRadius: 100,
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: votingOpen ? "#4CAF7D" : "#555",
              display: "inline-block",
              animation: votingOpen ? "cbkmPulse 1.5s infinite" : "none",
            }} />
            {votingOpen ? "Voting Open" : "Voting Closed"}
          </div>
          <div style={{
            fontSize: 11, color: "#C9943A",
            background: "rgba(201,148,58,0.1)",
            border: "1px solid rgba(201,148,58,0.25)",
            padding: "5px 14px", borderRadius: 100,
            letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500,
          }}>
            May 24, 2025
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px 60px" }}>

        {/* ── Title ── */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(28px, 6vw, 44px)",
            fontWeight: 900, color: "#F5EDD8",
            lineHeight: 1.1, marginBottom: 8,
          }}>
            CBKM Dance Competition
          </h1>
          <p style={{ fontSize: 15, color: "#888", fontWeight: 300 }}>
            {votingOpen && !alreadyVoted
              ? "Select a performer and cast your vote."
              : votingOpen && alreadyVoted
              ? "Your vote has been submitted."
              : "Voting will open when the emcee announces a program."}
          </p>
        </div>

        {/* ── VOTING CLOSED ── */}
        {!votingOpen && (
          <div style={{
            textAlign: "center", padding: "48px 20px",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 20, background: "#1A1A1A", marginBottom: 28,
          }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.35 }}>🔒</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#F5EDD8", marginBottom: 10, fontWeight: 700 }}>
              Voting is not open yet
            </h2>
            <p style={{ color: "#888", fontSize: 15 }}>
              The emcee will announce each team when it's time to vote.
            </p>
          </div>
        )}

        {/* ── ALREADY VOTED ── */}
        {votingOpen && alreadyVoted && (
          <div style={{
            textAlign: "center", padding: "48px 24px",
            background: "#1A1A1A",
            borderRadius: 20, border: "1px solid rgba(201,148,58,0.2)",
            marginBottom: 28,
            animation: "cbkmFadeIn 0.4s ease",
          }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>✨</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: "#C9943A", marginBottom: 10 }}>
              Vote Received!
            </h2>
            <p style={{ color: "#888", fontSize: 15 }}>
              Thank you for participating. Your vote counts for 30% of the final score.
            </p>
          </div>
        )}

        {/* ── VOTING OPEN ── */}
        {votingOpen && !alreadyVoted && (
          <>
            {enabledContestants.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "40px 20px",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 20, background: "#1A1A1A", marginBottom: 28,
              }}>
                <p style={{ color: "#888", fontSize: 15 }}>
                  Waiting for the emcee to announce the next team...
                </p>
              </div>
            ) : (
              <>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: 14,
                  marginBottom: 20,
                }}>
                  {enabledContestants.map((c) => (
                    <ContestantCard
                      key={c.id}
                      contestant={c}
                      isSelected={selectedId === c.id}
                      isDisabled={alreadyVoted}
                      onSelect={(id) => !alreadyVoted && setSelectedId(id)}
                    />
                  ))}
                </div>

                <div style={{
                  textAlign: "center", padding: 24,
                  background: "#1A1A1A",
                  borderRadius: 20,
                  border: "1px solid rgba(255,255,255,0.06)",
                  marginBottom: 28,
                }}>
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedId}
                    style={{
                      background: selectedId ? "linear-gradient(135deg, #C9943A, #E8C07A)" : "rgba(255,255,255,0.08)",
                      color: selectedId ? "#0D0D0D" : "#555",
                      border: "none",
                      padding: "16px 48px",
                      borderRadius: 100,
                      fontFamily: "inherit",
                      fontSize: 16,
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      cursor: selectedId ? "pointer" : "not-allowed",
                      width: "100%",
                      maxWidth: 320,
                      transition: "opacity 0.2s",
                    }}
                  >
                    Cast Your Vote
                  </button>
                  <p style={{ fontSize: 13, color: "#666", marginTop: 10 }}>
                    {selectedId ? "Tap to confirm your selection" : "Select a performer above"}
                  </p>
                </div>
              </>
            )}
          </>
        )}

        {/* ── Live Results (visible when there are votes) ── */}
        {hasResults && <ResultsPanel results={results} />}
      </main>

      <style>{`
        @keyframes cbkmPulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes cbkmFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @media (max-width: 540px) {
          main { padding: 20px 12px 40px !important; }
        }
      `}</style>
    </div>
  );
}
