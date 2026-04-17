import PlayerId from "@/components/games/PlayerId";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Player ID - CY & GR Hub",
  description: "Guess the hidden player based on clues and silhouettes.",
};

export default function PlayerIdPage() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/" className="p-2 bg-hub-card border border-hub-border rounded-full hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Player ID</h1>
          <p className="text-slate-400">Guess the player before all clues are revealed!</p>
        </div>
      </div>
      
      <div className="py-6 border-t border-hub-border">
        <PlayerId />
      </div>
    </div>
  );
}
