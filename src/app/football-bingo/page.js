import FootballBingo from "@/components/games/FootballBingo";

export default function FootballBingoPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Football Bingo</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Get 3 in a row horizontally, vertically, or diagonally. Orange vs Blue!
          </p>
        </div>
        
        <FootballBingo />
        
      </main>
    </div>
  );
}
