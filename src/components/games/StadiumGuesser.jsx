"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, CheckCircle2, XCircle, RefreshCcw } from "lucide-react";
import { supabase } from "@/lib/supabase";

const STADIUMS = [
  { name: "GSP Stadium", team: "APOEL / Omonia", url: "https://upload.wikimedia.org/wikipedia/commons/e/ec/GSP_Stadium_Pano.jpg" },
  { name: "Karaiskakis Stadium", team: "Olympiacos", url: "https://upload.wikimedia.org/wikipedia/commons/3/37/Karaiskakis_Piraeus.jpg" },
  { name: "Toumba Stadium", team: "PAOK FC", url: "https://upload.wikimedia.org/wikipedia/commons/d/df/Toumba_1.jpg" },
  { name: "OPAP Arena", team: "AEK Athens", url: "https://upload.wikimedia.org/wikipedia/commons/e/e0/OPAP_Arena_%282023%29.jpg" },
  { name: "Alphamega Stadium", team: "Apollon / AEL", url: "https://upload.wikimedia.org/wikipedia/commons/4/46/Limassol_Arena_at_night.jpg" },
  { name: "Antonis Papadopoulos", team: "Anorthosis", url: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Antonis_Papadopoulos_stadium_2011.jpg" }
];

export default function StadiumGuesser() {
  const [gameState, setGameState] = useState("playing"); // playing, correct, wrong
  const [targetStadium, setTargetStadium] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const initGame = () => {
    // Pick random target
    const targetInfo = STADIUMS[Math.floor(Math.random() * STADIUMS.length)];
    
    // Pick 3 random wrong options
    const wrongs = STADIUMS.filter(s => s.name !== targetInfo.name).sort(() => 0.5 - Math.random()).slice(0, 3);
    const levelOptions = [...wrongs, targetInfo].sort(() => 0.5 - Math.random());

    setTargetStadium(targetInfo);
    setOptions(levelOptions);
    setSelectedAnswer(null);
    setGameState("playing");
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleGuess = async (option) => {
    if (gameState !== "playing" || !targetStadium) return;
    
    setSelectedAnswer(option);
    
    if (option.name === targetStadium.name) {
      setGameState("correct");
      // Grant Points
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('user_scores').insert([{
          user_id: session.user.id,
          game_type: 'stadium_guesser',
          score: 50
        }]);
      }
    } else {
      setGameState("wrong");
    }
  };

  if (!targetStadium) return null;

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col items-center">
      
      <div className="w-full bg-hub-card border border-hub-border rounded-3xl overflow-hidden shadow-2xl mb-8">
        {/* The Photo */}
        <div className="relative h-64 md:h-96 w-full cursor-pointer overflow-hidden group">
          <img 
            src={targetStadium.url} 
            className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110"
            referrerPolicy="no-referrer"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
          <div className="absolute bottom-4 left-6">
             <h3 className="text-white font-bold text-xl drop-shadow-md">Identify This Stadium</h3>
          </div>
        </div>

        {/* The Options */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((opt, idx) => {
            let btnClass = "bg-slate-800 hover:bg-slate-700 hover:scale-[1.02] active:scale-95 border-slate-700";
            
            if (selectedAnswer !== null) {
              if (opt.name === targetStadium.name) btnClass = "bg-green-500/20 border-green-500 text-green-400";
              else if (opt.name === selectedAnswer.name) btnClass = "bg-red-500/20 border-red-500 text-red-400";
              else btnClass = "bg-slate-800/50 opacity-50 border-slate-800";
            }

            return (
              <button
                key={idx}
                disabled={selectedAnswer !== null}
                onClick={() => handleGuess(opt)}
                className={`py-6 px-6 rounded-xl border text-lg font-bold transition-all duration-200 shadow-md ${btnClass}`}
              >
                {opt.name}
              </button>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {(gameState === "correct" || gameState === "wrong") && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full p-6 mx-4 rounded-2xl border flex flex-col items-center text-center ${
              gameState === "correct" 
                ? "bg-green-500/10 border-green-500/30" 
                : "bg-red-500/10 border-red-500/30"
            }`}
          >
            {gameState === "correct" ? (
              <>
                <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-green-400 mb-2">Spot On!</h3>
                <p className="text-green-500/80 mb-6">That is exactly {targetStadium.name}! (+50 Points)</p>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
                <h3 className="text-2xl font-bold text-red-500 mb-2">Not quite...</h3>
                <p className="text-red-400/80 mb-6">That was {targetStadium.name}.</p>
              </>
            )}

            <button
               onClick={initGame}
               className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-slate-200 transition-all hover:scale-105 active:scale-95"
            >
               <RefreshCcw className="w-5 h-5" /> Play Next
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
