import { VoteResult } from "../hooks/useVoting";

interface Props {
  results: VoteResult[];
}

export function ResultsPanel({ results }: Props) {
  const sorted = [...results].sort((a, b) => b.votes - a.votes);

  return (
    <div style={{
      background: "#1A1A1A",
      border: "1px solid rgba(201,148,58,0.2)",
      borderRadius: 20,
      padding: "24px 20px",
    }}>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 18, fontWeight: 700,
        color: "#C9943A", marginBottom: 18,
        textAlign: "center",
      }}>
        Live Results
      </div>
      {sorted.map((r, i) => (
        <div key={r.contestantId} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 14, color: i === 0 ? "#C9943A" : "#F5EDD8", fontWeight: i === 0 ? 700 : 400 }}>
              {i === 0 ? "🏆 " : ""}{r.contestantName}
            </span>
            <span style={{ fontSize: 13, color: "#888" }}>{r.percent}% ({r.votes})</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 100, height: 6, overflow: "hidden" }}>
            <div style={{
              width: `${r.percent}%`,
              height: "100%",
              background: i === 0 ? "linear-gradient(90deg, #C9943A, #E8C07A)" : "rgba(201,148,58,0.4)",
              borderRadius: 100,
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}
