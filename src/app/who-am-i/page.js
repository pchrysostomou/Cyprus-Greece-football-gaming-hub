import DailyWhoAmI from "@/components/games/DailyWhoAmI";

export default function WhoAmIPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Who Am I?</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            The Daily Global Player Challenge. You have exactly one attempt to guess the player.
          </p>
        </div>
        
        <DailyWhoAmI />
        
      </main>
    </div>
  );
}
