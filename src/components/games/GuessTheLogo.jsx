"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, Play, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function GuessTheLogo() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentRound, setCurrentRound] = useState(1);
  const [levelData, setLevelData] = useState(null);
  const [pastTargets, setPastTargets] = useState([]);
  
  const [blurLevel, setBlurLevel] = useState(25);
  const [gameState, setGameState] = useState("playing");
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);

  const TOTAL_ROUNDS = 5;

  useEffect(() => {
    async function fetchTeams() {
      const { data, error } = await supabase
        .from('teams')
        .select('api_id, name, logo_url, country');
      if (data) setTeams(data);
      setLoading(false);
    }
    fetchTeams();
  }, []);

  useEffect(() => {
    if (teams.length > 0 && gameState === "playing" && !levelData) {
      generateLevel();
    }
  }, [teams, currentRound, gameState, levelData]);

  useEffect(() => {
    if (gameState !== "playing" || !levelData) return;
    const interval = setInterval(() => {
      setBlurLevel(prev => (prev <= 5 ? 5 : prev - 4));
    }, 2000);
    return () => clearInterval(interval);
  }, [gameState, levelData]);

  const generateLevel = () => {
    const availableTargets = teams.filter(t => !pastTargets.includes(t.name));
    const targetPool = availableTargets.length > 0 ? availableTargets : teams;
    
    const shuffled = [...targetPool].sort(() => 0.5 - Math.random());
    const target = shuffled[0];
    
    setPastTargets(prev => [...prev, target.name]);
    
    const otherTeams = teams.filter(t => t.name !== target.name).sort(() => 0.5 - Math.random());
    const wrongOptions = otherTeams.slice(0, 3).map(t => t.name);
    
    const options = [target.name, ...wrongOptions].sort(() => 0.5 - Math.random());

    setLevelData({
      id: currentRound,
      name: target.name,
      logoUrl: target.logo_url,
      country: target.country,
      options
    });
    setBlurLevel(25);
  };

  const handleGuess = (option) => {
    if (gameState !== "playing" || !levelData) return;
    
    setSelectedAnswer(option);
    
    if (option === levelData.name) {
      setGameState("correct");
      setBlurLevel(0);
      setScore(s => s + Math.max(10, blurLevel * 2)); // Dynamic points
    } else {
      setGameState("wrong");
      setTimeout(() => {
        setGameState("playing");
        setSelectedAnswer(null);
      }, 1500);
    }
  };

  const nextLevel = () => {
    if (currentRound < TOTAL_ROUNDS) {
      setCurrentRound(c => c + 1);
      setGameState("playing");
      setLevelData(null); // Will trigger generation
      setSelectedAnswer(null);
    } else {
      setGameState("finished");
      saveScore(score);
    }
  };

  const saveScore = async (finalScore) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return; // Only save if logged in

    const { error } = await supabase.from('user_scores').insert([
      {
        user_id: session.user.id,
        game_type: 'guess_logo',
        score: finalScore
      }
    ]);

    if (error) {
      console.error("Failed to save score:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-copper" />
        <p>Loading database assets...</p>
      </div>
    );
  }

  if (!teams || teams.length < 4) {
    return (
      <div className="text-center text-red-400 p-8">
        Not enough teams in database! Run the API synchronization.
      </div>
    );
  }

  if (gameState === "finished") {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
        <TrophyIcon className="w-24 h-24 text-copper mb-4" />
        <h2 className="text-4xl font-bold">Game Complete!</h2>
        <p className="text-xl text-slate-400">Your score: <span className="text-white font-bold">{score}</span> / {TOTAL_ROUNDS * 50}</p>
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

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col items-center">
      
      {/* Header Info */}
      <div className="w-full flex justify-between items-center mb-8 px-4">
        <div className="flex flex-col">
          <span className="text-sm text-slate-400 font-medium">Score</span>
          <span className="text-2xl font-bold text-copper">{score}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm text-slate-400 font-medium">Round</span>
          <span className="text-xl font-bold">{currentRound} / {TOTAL_ROUNDS}</span>
        </div>
      </div>

      {/* Logo Container */}
      <div className="relative w-72 h-72 rounded-3xl bg-hub-card border border-hub-border flex items-center justify-center mb-12 shadow-2xl overflow-hidden">
        
        <div className={`absolute inset-0 opacity-20 blur-3xl ${levelData.country === "Cyprus" ? 'bg-copper' : 'bg-greece'}`} />
        
        <AnimatePresence mode="popLayout">
          <motion.img
            key={`img-${currentRound}`}
            src={levelData.logoUrl}
            alt="Guess the logo"
            className="w-48 h-48 object-contain drop-shadow-2xl z-10"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              filter: gameState !== 'playing' ? 'blur(0px)' : `blur(${blurLevel}px)` 
            }}
            transition={{ duration: 0.5 }}
          />

          {gameState === "correct" && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 bg-green-500/20 z-20 flex items-center justify-center backdrop-blur-sm"
            >
              <CheckCircle2 className="w-24 h-24 text-green-400" />
            </motion.div>
          )}

          {gameState === "wrong" && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-red-500/20 z-20 flex items-center justify-center"
            >
              <XCircle className="w-24 h-24 text-red-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Options Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
        {levelData.options.map((option) => {
          
          let btnStyle = "bg-hub-card border-hub-border hover:border-slate-500 hover:bg-slate-800";
          if (gameState === "correct") {
            if (option === levelData.name) {
              btnStyle = "bg-green-500/20 border-green-500 text-green-400";
            } else {
              btnStyle = "bg-hub-card border-hub-border opacity-50";
            }
          } else if (gameState === "wrong" && selectedAnswer === option) {
            btnStyle = "bg-red-500/20 border-red-500 text-red-400 shake";
          }

          return (
            <button
              key={option}
              onClick={() => handleGuess(option)}
              disabled={gameState === "correct" || (gameState === "wrong" && selectedAnswer === option)}
              className={`relative border rounded-xl py-4 px-6 text-lg font-medium transition-all duration-200 focus:outline-none ${btnStyle}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* Next Level Button */}
      <AnimatePresence>
        {gameState === "correct" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <button 
              onClick={nextLevel}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white transition-all hover:scale-105 active:scale-95 ${levelData.country === "Cyprus" ? 'bg-copper border border-copper' : 'bg-greece border border-greece'}`}
            >
              Next Logo <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
