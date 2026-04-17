"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, Activity, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.push("/login");
        return;
      }
      
      setUser(session.user);

      // Fetch user's score history
      const { data } = await supabase
        .from('user_scores')
        .select('*')
        .eq('user_id', session.user.id)
        .order('played_at', { ascending: false });
        
      if (data) setHistory(data);
      setLoading(false);
    }
    
    loadProfile();
  }, [router]);

  if (loading) return null;

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col gap-8">
      
      <div className="bg-hub-card border border-hub-border rounded-3xl p-8 flex items-center gap-6 shadow-xl">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center border-4 border-greece border-opacity-50">
          <User className="w-10 h-10 text-slate-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Player Profile</h1>
          <p className="text-slate-400 font-mono text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-copper" /> Score History
        </h2>
        
        {history.length === 0 ? (
          <div className="bg-slate-900 border border-hub-border rounded-xl p-8 text-center text-slate-500">
            You haven't played any games yet. Head to the games hub to start!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {history.map(record => (
              <div key={record.id} className="bg-slate-900 border border-hub-border rounded-xl p-4 flex justify-between items-center transition-colors hover:border-slate-700">
                <div className="flex flex-col">
                  <span className="font-bold capitalize">{record.game_type.replace('_', ' ')}</span>
                  <span className="text-xs text-slate-500">{new Date(record.played_at).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-copper" />
                  <span className="text-xl font-bold">{record.score}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
