"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Trophy, Medal } from "lucide-react";

export default function LeaderboardPage() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      // For leaderboard we ideally want grouped scores, but let's just get top 50 plays
      // Note: In a real environment you'd want RPC to join users.email or users.raw_user_meta_data
      // But standard user_scores queries only return user_id. We'll do our best with what we have!
      const { data, error } = await supabase
        .from('user_scores')
        .select('*')
        .order('score', { ascending: false })
        .limit(50);

      if (!error && data) {
        setScores(data);
      }
      setLoading(false);
    }
    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold flex items-center justify-center gap-3">
          <Trophy className="w-10 h-10 text-copper" /> Global Leaderboards
        </h1>
        <p className="text-slate-400">The top performances across all Hub challenges.</p>
      </div>

      <div className="bg-hub-card border border-hub-border rounded-3xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center p-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Loading ranking data...</p>
          </div>
        ) : scores.length === 0 ? (
          <div className="flex flex-col items-center p-20 text-slate-500">
            <p>No scores recorded yet! Be the first to play.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-900 border-b border-hub-border uppercase text-xs font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Player ID (UUID)</th>
                <th className="px-6 py-4">Game</th>
                <th className="px-6 py-4 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hub-border">
              {scores.map((s, idx) => (
                <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold flex items-center gap-2">
                    {idx === 0 ? <Medal className="w-5 h-5 text-yellow-400" /> : 
                     idx === 1 ? <Medal className="w-5 h-5 text-slate-300" /> : 
                     idx === 2 ? <Medal className="w-5 h-5 text-amber-600" /> : 
                     `#${idx + 1}`}
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-slate-400">
                    {s.user_id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 capitalize">
                    {s.game_type.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-copper text-lg">
                    {s.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
