"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, CheckCircle2, XCircle, Search, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function DailyWhoAmI() {
  const [gameState, setGameState] = useState("loading"); // loading, playing, correct, wrong, already_played
  const [targetPlayer, setTargetPlayer] = useState(null);
  const [cluesRevealed, setCluesRevealed] = useState(0);
  const [clues, setClues] = useState({});
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    async function loadDailyChallenge() {
      // 1. Check if user already played today
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const todayStr = new Date().toISOString().split('T')[0];
        const { data: existingScore } = await supabase.from('user_scores')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('game_type', `who_am_i_${todayStr}`);
          
        if (existingScore && existingScore.length > 0) {
          setGameState("already_played");
          return;
        }
      }

      // 2. Load Daily Challenge Target
      const today = new Date().toISOString().split('T')[0];
      const { data: challenge } = await supabase.from('daily_challenges').select('*').eq('challenge_date', today).single();
      
      if (!challenge) {
        setGameState("no_challenge");
        return;
      }

      const { data: players } = await supabase.from('players').select('*, teams(*)');
      const target = players.find(p => p.api_id === challenge.target_id);
      
      if (!target) return;

      // 3 random options
      const nonTargets = players.filter(p => p.id !== target.id).sort(() => 0.5 - Math.random()).slice(0, 3);
      const levelOptions = [...nonTargets, target].sort(() => 0.5 - Math.random());

      setTargetPlayer(target);
      setClues({
        position: target.position,
        nationality: target.nationality,
        age: target.age || "Unknown",
        club: target.teams?.name || "Unknown",
        number: target.shirt_number
      });
      setOptions(levelOptions.map(p => p.name));
      setGameState("playing");
      
      // Auto-reveal clues periodically
      let count = 0;
      const interval = setInterval(() => {
        count++;
        setCluesRevealed(count);
        if (count >= 5) clearInterval(interval);
      }, 2000);

      return () => clearInterval(interval);
    }
    
    loadDailyChallenge();
  }, []);

  const handleGuess = async (option) => {
    if (gameState !== "playing") return;
    
    setSelectedAnswer(option);
    
    if (option === targetPlayer.name) {
      setGameState("correct");
      // Give massive daily points
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const todayStr = new Date().toISOString().split('T')[0];
        await supabase.from('user_scores').insert([
          {
            user_id: session.user.id,
            game_type: `who_am_i_${todayStr}`,
            score: 200
          }
        ]);
      }
    } else {
      setGameState("wrong");
      // Record failure with 0 points
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const todayStr = new Date().toISOString().split('T')[0];
        await supabase.from('user_scores').insert([
          {
            user_id: session.user.id,
            game_type: `who_am_i_${todayStr}`,
            score: 0
          }
        ]);
      }
    }
  };

  if (gameState === "loading") {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-copper" />
        <p>Loading Daily Challenge...</p>
      </div>
    );
  }

  if (gameState === "already_played") {
    return (
      <div className="text-center p-12 max-w-xl mx-auto bg-hub-card border border-hub-border rounded-xl">
        <h2 className="text-3xl font-bold text-copper mb-4">You already played today!</h2>
        <p className="text-slate-400">The Daily Who Am I? challenge resets every 24 hours. Check back tomorrow for the next mystery player!</p>
      </div>
    );
  }

  if (gameState === "no_challenge") {
    return (
      <div className="text-center p-12 max-w-xl mx-auto bg-hub-card border border-hub-border rounded-xl">
        <h2 className="text-3xl font-bold text-slate-300 mb-4">No Challenge Available</h2>
        <p className="text-slate-500">The daily target hasn't been set yet.</p>
      </div>
    );
  }

  const CLUE_ORDER = [
    { key: 'position', label: 'Position' },
    { key: 'nationality', label: 'Nationality' },
    { key: 'age', label: 'Age' },
    { key: 'club', label: 'Club' },
    { key: 'number', label: 'Shirt Number' }
  ];

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="mb-6 flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="font-bold text-copper text-lg">Daily Challenge (+200 pts)</div>
        <div className="text-slate-400">1 Attempt Only</div>
      </div>

      <div className="bg-hub-card border border-hub-border rounded-3xl p-6 shadow-2xl mb-8">
        <div className="flex flex-col mb-8 gap-3">
          {CLUE_ORDER.map((clue, idx) => (
            <div key={clue.key} className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <span className="text-slate-400">{clue.label}</span>
              <span className="font-bold text-lg">
                {cluesRevealed > idx ? clues[clue.key] : <Loader2 className="w-5 h-5 animate-spin text-slate-600" />}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {options.map((opt, idx) => {
            let btnClass = "bg-slate-800 hover:bg-slate-700 hover:scale-[1.02] active:scale-95 border-slate-700";
            
            if (selectedAnswer !== null) {
              if (opt === targetPlayer.name) btnClass = "bg-green-500/20 border-green-500 text-green-400";
              else if (opt === selectedAnswer) btnClass = "bg-red-500/20 border-red-500 text-red-400";
              else btnClass = "bg-slate-800/50 opacity-50 border-slate-800";
            }

            return (
              <button
                key={idx}
                disabled={selectedAnswer !== null}
                onClick={() => handleGuess(opt)}
                className={`py-4 px-6 rounded-xl border font-bold transition-all duration-200 shadow-md ${btnClass}`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {(gameState === "correct" || gameState === "wrong") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-2xl border flex flex-col items-center text-center ${
              gameState === "correct" 
                ? "bg-green-500/10 border-green-500/30" 
                : "bg-red-500/10 border-red-500/30"
            }`}
          >
            {gameState === "correct" ? (
              <>
                <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-green-400 mb-2">Spot On!</h3>
                <p className="text-green-500/80">You nailed the Daily Challenge!</p>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
                <h3 className="text-2xl font-bold text-red-500 mb-2">Not quite...</h3>
                <p className="text-red-400/80 mb-2">The correct answer was {targetPlayer.name}</p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
