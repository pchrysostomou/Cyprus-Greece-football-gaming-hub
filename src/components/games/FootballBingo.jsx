"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, RefreshCcw, Search, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

const COLS = ['APOEL', 'Olympiacos', 'Panathinaikos'];
const ROWS = ['Brazil', 'Midfielder', 'Attacker'];

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertical
  [0, 4, 8], [2, 4, 6]             // Diagonal
];

export default function FootballBingo() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isOrangeTurn, setIsOrangeTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  
  const [players, setPlayers] = useState([]);
  
  const [activeCell, setActiveCell] = useState(null); // index 0-8
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadPlayers() {
      const { data } = await supabase.from('players').select('*, teams(name, logo_url)');
      if (data) setPlayers(data);
    }
    loadPlayers();
  }, []);

  const checkWinner = (squares) => {
    for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
      const [a, b, c] = WINNING_COMBINATIONS[i];
      if (squares[a] && squares[b] && squares[c] && 
          squares[a].team === squares[b].team && squares[a].team === squares[c].team) {
        return { winner: squares[a].team, line: [a, b, c] };
      }
    }
    return null;
  };

  const getCol = (idx) => idx % 3;
  const getRow = (idx) => Math.floor(idx / 3);

  const handleCellClick = (index) => {
    if (board[index] || winner) return; // already taken
    setActiveCell(index);
    setSearchTerm("");
  };

  const verifyAnswer = (player) => {
    const colIndex = getCol(activeCell);
    const rowIndex = getRow(activeCell);
    
    const colConstraint = COLS[colIndex];
    const rowConstraint = ROWS[rowIndex];
    
    const matchesTeam = player.teams?.name.includes(colConstraint);
    
    let matchesRow = false;
    if (rowConstraint === 'Brazil' && player.nationality === 'Brazil') matchesRow = true;
    if (rowConstraint === 'Midfielder' && player.position === 'Midfielder') matchesRow = true;
    if (rowConstraint === 'Attacker' && player.position === 'Attacker') matchesRow = true;

    // Check if player already used on board
    const alreadyUsed = board.some(cell => cell && cell.player.id === player.id);

    if (matchesTeam && matchesRow && !alreadyUsed) {
      // CORRECT GUESS
      const newBoard = [...board];
      newBoard[activeCell] = {
        team: isOrangeTurn ? "Orange" : "Blue",
        player: player
      };
      setBoard(newBoard);
      
      setActiveCell(null);

      const winResult = checkWinner(newBoard);
      if (winResult) {
        setWinner(winResult.winner);
        setWinningLine(winResult.line);
        saveScore(100);
      } else if (!newBoard.includes(null)) {
        setWinner("Draw");
      } else {
        setIsOrangeTurn(!isOrangeTurn);
      }
    } else {
      // WRONG GUESS - LOSE TURN
      setActiveCell(null);
      setIsOrangeTurn(!isOrangeTurn);
      // Optional: Add a toast notification for "Wrong Guess! Turn lost"
    }
  };

  const saveScore = async (finalScore) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return; // User isn't logged in
    
    // Give points to the user who made the winning move
    await supabase.from('user_scores').insert([
      {
        user_id: session.user.id,
        game_type: 'football_bingo',
        score: finalScore
      }
    ]);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsOrangeTurn(true);
    setWinner(null);
    setWinningLine([]);
  };

  const searchResults = searchTerm.length > 1 
    ? players.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5)
    : [];

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
      {/* Header Info */}
      <div className="flex justify-between items-center w-full mb-8 px-6 py-4 bg-hub-card border border-hub-border rounded-xl shadow-lg">
        <div className={`flex items-center gap-3 font-bold text-lg md:text-2xl ${isOrangeTurn ? 'text-copper' : 'text-slate-500 opacity-50'}`}>
          <div className={`w-6 h-6 rounded-full bg-copper ${isOrangeTurn ? 'shadow-[0_0_15px_rgba(217,119,87,1)]' : ''}`} />
          Orange Player
        </div>
        
        <div className="font-mono text-slate-400 font-bold border border-slate-700 px-4 py-1 rounded-full">
          VS
        </div>

        <div className={`flex items-center gap-3 font-bold text-lg md:text-2xl ${!isOrangeTurn ? 'text-greece' : 'text-slate-500 opacity-50'}`}>
          Blue Player
          <div className={`w-6 h-6 rounded-full bg-greece ${!isOrangeTurn ? 'shadow-[0_0_15px_rgba(13,94,175,1)]' : ''}`} style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
        </div>
      </div>

      {/* Grid Contatiner */}
      <div className="flex items-start">
        
        {/* Row Headers (Left Axis) */}
        <div className="flex flex-col gap-2 mt-16 mr-4 font-bold text-slate-300 text-sm md:text-lg">
          {ROWS.map(r => (
            <div key={r} className="h-24 md:h-32 flex justify-end items-center pr-2">{r}</div>
          ))}
        </div>

        <div className="flex flex-col">
          {/* Column Headers (Top Axis) */}
          <div className="grid grid-cols-3 gap-2 mb-4 font-bold text-slate-300 text-sm md:text-lg text-center">
            {COLS.map(c => (
             <div key={c} className="w-24 md:w-32">{c}</div> 
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-3 gap-2 bg-slate-800 p-2 rounded-2xl shadow-2xl relative border border-hub-border">
            {board.map((cell, index) => {
              const isWinningCell = winningLine.includes(index);
              let cellStyle = "bg-slate-900 border border-hub-border hover:bg-slate-700 cursor-pointer w-24 h-24 md:w-32 md:h-32";
              
              if (cell && cell.team === "Orange") cellStyle = "bg-copper/20 border-copper shadow-[inset_0_0_20px_rgba(217,119,87,0.3)] w-24 h-24 md:w-32 md:h-32";
              if (cell && cell.team === "Blue") cellStyle = "bg-greece/20 border-greece shadow-[inset_0_0_20px_rgba(13,94,175,0.3)] w-24 h-24 md:w-32 md:h-32";
              
              if (isWinningCell && cell?.team === "Orange") cellStyle += " animate-pulse bg-copper/50 border-copper border-4";
              if (isWinningCell && cell?.team === "Blue") cellStyle += " animate-pulse bg-greece/50 border-greece border-4";

              return (
                <div
                  key={index}
                  onClick={() => handleCellClick(index)}
                  className={`rounded-xl flex flex-col items-center justify-center overflow-hidden transition-all duration-300 ${cellStyle}`}
                >
                  {cell ? (
                    <div className="flex flex-col items-center p-2 relative h-full w-full">
                      {/* Identity Token Box */}
                      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full ${cell.team === 'Orange' ? 'bg-copper' : 'bg-greece'}`} />
                      
                      <div className="w-10 h-10 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-white/10 mb-1">
                         <img 
                          src={cell.player.photo_url || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => { e.target.onerror = null; e.target.src = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"; }}
                         />
                      </div>
                      <span className="text-[10px] md:text-sm font-bold text-white text-center leading-tight">{cell.player.name}</span>
                    </div>
                  ) : (
                    <motion.div whileHover={{ scale: 1.1 }} className="w-full h-full flex items-center justify-center text-slate-700">
                      ?
                    </motion.div>
                  )}
                </div>
              );
            })}

            {/* Winner Overlay */}
            <AnimatePresence>
              {winner && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/85 rounded-2xl backdrop-blur-sm"
                >
                  <motion.div 
                    initial={{ scale: 0, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="flex flex-col items-center"
                  >
                    {winner === "Draw" ? (
                      <h2 className="text-4xl font-bold text-white mb-4">It's a Draw!</h2>
                    ) : (
                      <>
                        <Trophy className={`w-24 h-24 mb-4 ${winner === "Orange" ? "text-copper" : "text-greece"}`} />
                        <h2 className={`text-4xl font-bold mb-2 ${winner === "Orange" ? "text-copper" : "text-greece"}`}>
                          {winner} Wins!
                        </h2>
                      </>
                    )}
                    
                    <button
                      onClick={resetGame}
                      className="mt-6 flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-slate-200 transition-all hover:scale-105 active:scale-95"
                    >
                      <RefreshCcw className="w-5 h-5" /> Play Again
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <AnimatePresence>
        {activeCell !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-hub-card border border-hub-border rounded-2xl p-6 w-full max-w-lg shadow-2xl relative"
            >
              <button 
                onClick={() => setActiveCell(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-xl font-bold mb-2">Claim Square</h2>
              <p className="text-slate-400 text-sm mb-6">
                Requires: <span className="text-white font-bold">{ROWS[getRow(activeCell)]}</span> + <span className="text-white font-bold">{COLS[getCol(activeCell)]}</span>
              </p>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search player name..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-copper"
                  autoFocus
                />
              </div>

              <div className="max-h-60 overflow-y-auto flex flex-col gap-2">
                {searchResults.map(p => (
                  <button
                    key={p.id}
                    onClick={() => verifyAnswer(p)}
                    className="flex items-center gap-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
                  >
                    <img 
                      src={p.photo_url || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"} 
                      className="w-10 h-10 rounded-full object-cover" 
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"; }}
                    />
                    <div className="text-left flex-1">
                      <div className="font-bold">{p.name}</div>
                      <div className="text-xs text-slate-400">{p.teams?.name} • {p.position}</div>
                    </div>
                  </button>
                ))}
                {searchTerm.length > 1 && searchResults.length === 0 && (
                  <div className="text-center text-slate-500 p-4">No players found</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
