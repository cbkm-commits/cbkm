import { supabase } from '../supabase';
import { Vote } from '../../types';

const toVote = (r: any): Vote => ({
  id: r.id, eventId: r.event_id, registrationId: r.registration_id,
  voterToken: r.voter_token, voteValue: r.vote_value, createdAt: r.created_at,
});

export const fetchVotes = async (eventId: string): Promise<Vote[]> => {
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('event_id', eventId);
  if (error) throw error;
  return (data || []).map(toVote);
};

export const castVote = async (
  eventId: string,
  registrationId: string,
  voterToken: string,
  voteValue: string
): Promise<void> => {
  const { error } = await supabase.from('votes').insert({
    event_id: eventId,
    registration_id: registrationId,
    voter_token: voterToken,
    vote_value: voteValue,
  });
  if (error) throw error;
};

// Check if voter has ANY vote for this event (used for choice voting)
export const checkVotedAny = async (eventId: string, voterToken: string): Promise<boolean> => {
  const { data } = await supabase
    .from('votes')
    .select('id')
    .eq('event_id', eventId)
    .eq('voter_token', voterToken)
    .limit(1)
    .maybeSingle();
  return !!data;
};

// Get all performer IDs this voter has already rated (for stars/score)
export const getVotedPerformers = async (eventId: string, voterToken: string): Promise<string[]> => {
  const { data } = await supabase
    .from('votes')
    .select('registration_id')
    .eq('event_id', eventId)
    .eq('voter_token', voterToken);
  return (data || []).map((r: any) => r.registration_id).filter(Boolean);
};

// Legacy — kept for backward compat
export const checkVoted = checkVotedAny;

export const deleteVotes = async (eventId: string): Promise<void> => {
  const { error } = await supabase.from('votes').delete().eq('event_id', eventId);
  if (error) throw error;
};

export interface VoteResult {
  registration: { id: string; name: string; category: string; participantNumber: string };
  totalVotes: number;
  avgScore: number;
  percent: number;
}

export function computeResults(
  votes: Vote[],
  participants: { id: string; name: string; category: string; participantNumber: string }[],
  votingType: string
): VoteResult[] {
  const totals: Record<string, number[]> = {};
  participants.forEach(p => { totals[p.id] = []; });

  votes.forEach(v => {
    try {
      if (votingType === 'choice') {
        const val = JSON.parse(v.voteValue);
        if (typeof val === 'string' && totals[val] !== undefined) totals[val].push(1);
      } else {
        // New per-performer model: registration_id = performer, vote_value = numeric score
        const parsed = JSON.parse(v.voteValue);
        if (typeof parsed === 'number' && v.registrationId && totals[v.registrationId] !== undefined) {
          totals[v.registrationId].push(parsed);
        } else if (typeof parsed === 'object' && parsed !== null) {
          // Legacy batch format: {regId: score}
          Object.entries(parsed as Record<string, number>).forEach(([rid, score]) => {
            if (totals[rid] !== undefined) totals[rid].push(score);
          });
        }
      }
    } catch { /* ignore malformed */ }
  });

  const totalVoteCount = votes.length;

  return participants.map(p => {
    const scores = totals[p.id] || [];
    const count = scores.length;
    const sum = scores.reduce((a, b) => a + b, 0);
    return {
      registration: p,
      totalVotes: count,
      avgScore: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
      percent: votingType === 'choice' && totalVoteCount > 0 ? Math.round((count / totalVoteCount) * 100) : 0,
    };
  }).sort((a, b) => {
    if (votingType === 'choice') return b.totalVotes - a.totalVotes;
    return b.avgScore - a.avgScore || b.totalVotes - a.totalVotes;
  });
}
