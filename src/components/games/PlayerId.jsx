"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, Play, Loader2, HelpCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Removed duplicate ClueRow

export default function PlayerId() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentRound, setCurrentRound] = useState(1);
  const [levelData, setLevelData] = useState(null);
  const [pastTargets, setPastTargets] = useState([]); // Track played players
  
  // 0 = none, 1 = position, 2 = nationality, 3 = age, 4 = club, 5 = shirt
  const [cluesRevealed, setCluesRevealed] = useState(5); 
  
  const [gameState, setGameState] = useState("playing"); 
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);

  const TOTAL_ROUNDS = 5;

  useEffect(() => {
    async function fetchPlayers() {
      // Fetch players dynamically and embed the joined team data
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          teams!inner (
            name, country
          )
        `);
      
      if (error) {
        console.error("Error fetching players:", error);
      } else if (data) {
        setPlayers(data);
      }
      setLoading(false);
    }
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (players.length >= 4 && gameState === "playing" && !levelData) {
      generateLevel();
    }
  }, [players, currentRound, gameState, levelData]);

  const generateLevel = () => {
    // Filter out previously used players from becoming the Target again
    const availableTargets = players.filter(p => !pastTargets.includes(p.name));
    
    // Fallback if we run out
    const targetPool = availableTargets.length > 0 ? availableTargets : players;
    
    const shuffled = [...targetPool].sort(() => 0.5 - Math.random());
    const target = shuffled[0];
    
    setPastTargets(prev => [...prev, target.name]);
    
    // Options must be randomized including the target, but pick from FULL list for wrong answers
    const otherPlayers = players.filter(p => p.name !== target.name).sort(() => 0.5 - Math.random());
    const wrongOptions = otherPlayers.slice(0, 3).map(p => p.name);
    
    const options = [target.name, ...wrongOptions].sort(() => 0.5 - Math.random());

    setLevelData({
      id: currentRound,
      name: target.name,
      photoUrl: target.photo_url || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg",
      position: target.position,
      nationality: target.nationality,
      age: target.age,
      club: target.teams?.name || "Unknown",
      number: target.shirt_number,
      country: target.teams?.country || "None",
      options
    });
    setCluesRevealed(5); // Open all clues by default as requested
  };

  const handleGuess = (option) => {
    if (gameState !== "playing" || !levelData) return;
    
    setSelectedAnswer(option);
    
    if (option === levelData.name) {
      setGameState("correct");
      // Give flat 50 points since all clues are open by default now
      setScore(s => s + 50);
    } else {
      setGameState("wrong");
    }
  };

  const nextLevel = () => {
    if (currentRound < TOTAL_ROUNDS) {
      setCurrentRound(c => c + 1);
      setGameState("playing");
      setLevelData(null); 
      setSelectedAnswer(null);
    } else {
      setGameState("finished");
      saveScore(score);
    }
  };

  const saveScore = async (finalScore) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return; 

    await supabase.from('user_scores').insert([
      {
        user_id: session.user.id,
        game_type: 'player_id',
        score: finalScore
      }
    ]);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-copper" />
        <p>Analyzing Player Database...</p>
      </div>
    );
  }

  if (!players || players.length < 4) {
    return (
      <div className="text-center text-red-400 p-8">
        Not enough players in database to generate 4 options.
      </div>
    );
  }

  if (gameState === "finished") {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
        <TrophyIcon className="w-24 h-24 text-copper mb-4" />
        <h2 className="text-4xl font-bold">Game Complete!</h2>
        <p className="text-xl text-slate-400">Your score: <span className="text-white font-bold">{score}</span></p>
        <button 
          onClick={() => {
            setCurrentRound(1);
            setScore(0);
            setGameState("playing");
            setLevelData(null);
            setSelectedAnswer(null);
          }}
          className="mt-8 flex items-center gap-2 bg-greece hover:bg-greece/80 text-white px-8 py-3 rounded-full font-bold transition-all hover:scale-105 active:scale-95"
        >
          <Play className="w-5 h-5" /> Play Again
        </button>
      </div>
    );
  }

  if (!levelData) return null;

  const isRevealed = gameState === "correct" || gameState === "wrong";
  
  // Calculate silhouette based on state
  const imageFilter = isRevealed ? "brightness(1) contrast(1) blur(0px)" : "brightness(0) contrast(2) drop-shadow(0 0 10px rgba(0,0,0,0.5))";

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col md:flex-row gap-8 items-start">
      
      {/* Left side: Photo & State */}
      <div className="w-full md:w-1/2 flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4 px-4 hidden md:flex">
          <div className="flex flex-col">
            <span className="text-sm text-slate-400 font-medium">Score</span>
            <span className="text-2xl font-bold text-copper">{score}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm text-slate-400 font-medium">Round</span>
            <span className="text-xl font-bold">{currentRound} / {TOTAL_ROUNDS}</span>
          </div>
        </div>

        <div className="relative w-64 h-80 rounded-2xl bg-slate-900 border border-hub-border flex items-center justify-center mb-6 shadow-2xl overflow-hidden">
          <div className={`absolute inset-0 opacity-20 blur-3xl ${levelData.country === "Cyprus" ? 'bg-copper' : 'bg-greece'}`} />
          
          <AnimatePresence mode="popLayout">
            <motion.img
              key={`img-${currentRound}`}
              src={levelData.photoUrl}
              alt="Guess the player"
              className="w-full h-full object-cover z-10 transition-all duration-700"
              style={{ filter: imageFilter }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            />

            {gameState === "correct" && (
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-x-0 bottom-0 top-auto h-24 bg-gradient-to-t from-green-500/80 to-transparent z-20 flex items-end justify-center pb-4"
              >
                <CheckCircle2 className="w-12 h-12 text-white" />
              </motion.div>
            )}

            {gameState === "wrong" && (
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-x-0 bottom-0 top-auto h-24 bg-gradient-to-t from-red-500/80 to-transparent z-20 flex items-end justify-center pb-4"
              >
                <XCircle className="w-12 h-12 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isRevealed && (
          <motion.button 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={nextLevel}
            className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white transition-all hover:scale-105 active:scale-95 ${levelData.country === "Cyprus" ? 'bg-copper border border-copper' : 'bg-greece border border-greece'}`}
          >
            Next Player <ChevronRight className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Right side: Clues & Options */}
      <div className="w-full md:w-1/2 flex flex-col gap-6 w-full">
        
        {/* Mobile Score Header */}
        <div className="w-full flex justify-between items-center mb-2 md:hidden">
          <div className="flex flex-col">
            <span className="text-sm text-slate-400 font-medium">Score: <span className="text-copper">{score}</span></span>
          </div>
          <div className="flex flex-col text-sm text-slate-400 font-medium items-end">
            <span>Round: {currentRound} / {TOTAL_ROUNDS}</span>
          </div>
        </div>

        {/* Clues Box */}
        <div className="bg-hub-card border border-hub-border rounded-xl p-5 space-y-4 shadow-lg w-full">
          <h3 className="font-bold flex items-center gap-2 text-slate-300 border-b border-hub-border pb-3">
            <HelpCircle className="w-5 h-5" /> Player Clues
          </h3>
          <ul className="space-y-3 font-mono text-sm">
            <ClueRow label="Position" value={levelData.position} revealed={cluesRevealed >= 1 || isRevealed} />
            <ClueRow label="Nationality" value={levelData.nationality} revealed={cluesRevealed >= 2 || isRevealed} />
            <ClueRow label="Age" value={levelData.age} revealed={cluesRevealed >= 3 || isRevealed} />
            <ClueRow label="Club" value={levelData.club} revealed={cluesRevealed >= 4 || isRevealed} />
            <ClueRow label="Number" value={`#${levelData.number}`} revealed={cluesRevealed >= 5 || isRevealed} />
          </ul>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {levelData.options.map((option) => {
            let btnStyle = "bg-hub-card border-hub-border hover:border-slate-500 hover:bg-slate-800";
            if (isRevealed) {
              if (option === levelData.name) {
                btnStyle = "bg-green-500/20 border-green-500 text-green-400";
              } else {
                btnStyle = "bg-slate-900 border-hub-border opacity-50";
              }
            }

            return (
              <button
                key={option}
                onClick={() => handleGuess(option)}
                disabled={isRevealed}
                className={`border rounded-xl py-3 px-4 text-sm md:text-base font-bold transition-all duration-200 focus:outline-none truncate ${btnStyle}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {!isRevealed && cluesRevealed < 5 && (
           <button 
             onClick={() => setCluesRevealed(c => c + 1)}
             className="text-xs text-center p-2 text-slate-400 hover:text-white underline mt-2"
           >
             Need a hint? Reveal next clue (-10 points)
           </button>
        )}

      </div>
    </div>
  );
}

function ClueRow({ label, value, revealed }) {
  return (
    <li className="flex justify-between items-center bg-slate-900/50 p-2 rounded">
      <span className="text-slate-500">{label}:</span>
      {revealed ? (
        <span className="text-white font-bold animate-in fade-in slide-in-from-right-4">{value}</span>
      ) : (
        <span className="text-slate-700 select-none blur-[4px]">Hidden</span>
      )}
    </li>
  );
}

function TrophyIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7c0 6 6 8 6 8s6-2 6-8z" />
    </svg>
  )
}
