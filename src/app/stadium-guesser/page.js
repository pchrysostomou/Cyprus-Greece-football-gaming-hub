import StadiumGuesser from "@/components/games/StadiumGuesser";

export default function StadiumGuesserPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Stadium Guesser</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Identify the home ground from a single photograph!
          </p>
        </div>
        
        <StadiumGuesser />
        
      </main>
    </div>
  );
}
