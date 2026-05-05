import React, { useState } from "react";
import { useVoting, Contestant } from "../hooks/useVoting";

export const VotingControl: React.FC = () => {
  const {
    contestants,
    votingOpen,
    getResults,
    adminSetOpen,
    adminSetContestants,
    adminToggleContestant,
    adminResetVotes,
  } = useVoting();

  const [newName, setNewName] = useState("");
  const [newGroup, setNewGroup] = useState("");

  const addContestant = () => {
    if (!newName.trim()) return;
    const updated: Contestant[] = [
      ...contestants,
      { id: Date.now().toString(), name: newName.trim(), group: newGroup.trim() || undefined, enabled: false },
    ];
    adminSetContestants(updated);
    setNewName("");
    setNewGroup("");
  };

  const removeContestant = (id: string) => {
    adminSetContestants(contestants.filter((c) => c.id !== id));
  };

  const results = getResults();
  const totalVotes = results.reduce((s, r) => s + r.votes, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Voting Control</h2>
        <div className="flex gap-3">
          <button
            onClick={() => { if (window.confirm("Reset all votes?")) adminResetVotes(); }}
            className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
          >
            Reset Votes
          </button>
          <button
            onClick={() => adminSetOpen(!votingOpen)}
            className={`px-5 py-2 text-sm font-semibold rounded-lg text-white ${
              votingOpen ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {votingOpen ? "Close Voting" : "Open Voting"}
          </button>
        </div>
      </div>

      {/* Status banner */}
      <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
        votingOpen
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-gray-50 border-gray-200 text-gray-600"
      }`}>
        <span className={`inline-block w-3 h-3 rounded-full ${votingOpen ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
        <span className="font-medium">
          {votingOpen ? "Voting is OPEN — audience can vote now" : "Voting is CLOSED"}
        </span>
        <span className="ml-auto text-sm">{totalVotes} vote{totalVotes !== 1 ? "s" : ""} cast</span>
      </div>

      {/* Add contestant */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Add Team / Contestant</h3>
        <div className="flex gap-3 flex-wrap">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addContestant()}
            placeholder="Team / Contestant name *"
            className="flex-1 min-w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
          <input
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            placeholder="Category (optional)"
            className="w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
          <button
            onClick={addContestant}
            disabled={!newName.trim()}
            className="px-5 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </div>

      {/* Contestant list */}
      {contestants.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          No teams added yet. Add teams above before opening voting.
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 mb-2">
            Toggle each team ON when the emcee announces them. Audience can only vote for <strong>enabled</strong> teams.
          </p>
          {contestants.map((c) => {
            const result = results.find((r) => r.contestantId === c.id);
            return (
              <div
                key={c.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  c.enabled
                    ? "bg-green-50 border-green-200"
                    : "bg-white border-gray-200"
                }`}
              >
                {/* Enable toggle */}
                <button
                  onClick={() => adminToggleContestant(c.id)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                    c.enabled ? "bg-green-500" : "bg-gray-300"
                  }`}
                  title={c.enabled ? "Disable team" : "Enable team"}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      c.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{c.name}</div>
                  {c.group && <div className="text-xs text-gray-500">{c.group}</div>}
                </div>

                {/* Vote count */}
                <div className="text-right min-w-16">
                  <div className="text-lg font-bold text-gray-800">{result?.votes ?? 0}</div>
                  <div className="text-xs text-gray-400">{result?.percent ?? 0}%</div>
                </div>

                {/* Status badge */}
                <div className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  c.enabled
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {c.enabled ? "LIVE" : "Off"}
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeContestant(c.id)}
                  className="text-gray-300 hover:text-red-400 text-lg font-bold px-1"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Results summary */}
      {totalVotes > 0 && (
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Current Results</h3>
          {[...results].sort((a, b) => b.votes - a.votes).map((r, i) => (
            <div key={r.contestantId} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className={i === 0 ? "font-bold text-yellow-600" : "text-gray-700"}>
                  {i === 0 ? "🏆 " : ""}{r.contestantName}
                </span>
                <span className="text-gray-500">{r.votes} vote{r.votes !== 1 ? "s" : ""} · {r.percent}%</span>
              </div>
              <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${i === 0 ? "bg-yellow-400" : "bg-gray-400"}`}
                  style={{ width: `${r.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
