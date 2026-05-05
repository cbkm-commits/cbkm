import { useState, useEffect, useCallback } from "react";

export interface Contestant {
  id: string;
  name: string;
  group?: string;
  enabled: boolean;
}

export interface VoteResult {
  contestantId: string;
  contestantName: string;
  votes: number;
  percent: number;
}

const KEYS = {
  contestants: "cbkm_voting_contestants",
  open: "cbkm_voting_open",
  votes: "cbkm_votes",
};

function readContestants(): Contestant[] {
  try { return JSON.parse(localStorage.getItem(KEYS.contestants) ?? "[]"); } catch { return []; }
}

function readOpen(): boolean {
  return localStorage.getItem(KEYS.open) === "true";
}

function readVotes(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(KEYS.votes) ?? "{}"); } catch { return {}; }
}

export function useVoting() {
  const [contestants, setContestants] = useState<Contestant[]>(readContestants);
  const [votingOpen, setVotingOpen] = useState<boolean>(readOpen);
  const [votes, setVotes] = useState<Record<string, string>>(readVotes);

  // Sync across tabs (admin enabling a team reflects immediately on voting page)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEYS.contestants) setContestants(readContestants());
      if (e.key === KEYS.open) setVotingOpen(readOpen());
      if (e.key === KEYS.votes) setVotes(readVotes());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const castVote = useCallback((contestantId: string) => {
    const updated = { ...readVotes(), audience: contestantId };
    localStorage.setItem(KEYS.votes, JSON.stringify(updated));
    setVotes(updated);
  }, []);

  const hasVoted = votes["audience"] ?? null;

  const getResults = useCallback((): VoteResult[] => {
    const counts: Record<string, number> = {};
    const all = readVotes();
    Object.values(all).forEach((id) => { counts[id] = (counts[id] ?? 0) + 1; });
    const total = Object.values(counts).reduce((s, n) => s + n, 0);
    return contestants.map((c) => ({
      contestantId: c.id,
      contestantName: c.name,
      votes: counts[c.id] ?? 0,
      percent: total > 0 ? Math.round(((counts[c.id] ?? 0) / total) * 100) : 0,
    }));
  }, [contestants]);

  // Admin helpers — write to localStorage and update local state
  const adminSetOpen = useCallback((open: boolean) => {
    localStorage.setItem(KEYS.open, String(open));
    setVotingOpen(open);
  }, []);

  const adminSetContestants = useCallback((list: Contestant[]) => {
    localStorage.setItem(KEYS.contestants, JSON.stringify(list));
    setContestants(list);
  }, []);

  const adminToggleContestant = useCallback((id: string) => {
    const updated = readContestants().map((c) =>
      c.id === id ? { ...c, enabled: !c.enabled } : c
    );
    localStorage.setItem(KEYS.contestants, JSON.stringify(updated));
    setContestants(updated);
  }, []);

  const adminResetVotes = useCallback(() => {
    localStorage.removeItem(KEYS.votes);
    setVotes({});
  }, []);

  return {
    contestants,
    votingOpen,
    hasVoted,
    castVote,
    getResults,
    adminSetOpen,
    adminSetContestants,
    adminToggleContestant,
    adminResetVotes,
  };
}
