import { Contestant } from "../hooks/useVoting";
// eslint-disable-next-line @typescript-eslint/no-unused-vars

interface Props {
  contestant: Contestant;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: (id: string) => void;
}

export function ContestantCard({ contestant, isSelected, isDisabled, onSelect }: Props) {
  return (
    <div
      onClick={() => !isDisabled && onSelect(contestant.id)}
      style={{
        background: isSelected ? "rgba(201,148,58,0.12)" : "#1A1A1A",
        border: isSelected
          ? "2px solid #C9943A"
          : "2px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: "20px 16px",
        textAlign: "center",
        cursor: isDisabled ? "default" : "pointer",
        transition: "all 0.2s",
        opacity: isDisabled && !isSelected ? 0.5 : 1,
      }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: "linear-gradient(135deg, #C9943A, #E8C07A)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 12px",
        fontSize: 22, fontWeight: 700, color: "#0D0D0D",
      }}>
        {contestant.name.charAt(0)}
      </div>
      <div style={{ fontWeight: 700, fontSize: 15, color: "#F5EDD8", marginBottom: 4 }}>
        {contestant.name}
      </div>
      {contestant.group && (
        <div style={{ fontSize: 12, color: "#888" }}>{contestant.group}</div>
      )}
      {isSelected && (
        <div style={{ marginTop: 10, fontSize: 12, color: "#C9943A", fontWeight: 600 }}>
          ✓ Selected
        </div>
      )}
    </div>
  );
}
