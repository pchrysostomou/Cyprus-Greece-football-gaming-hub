import GuessTheLogo from "@/components/games/GuessTheLogo";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Guess the Logo - CY & GR Hub",
  description: "Test your knowledge of Cyprus and Greek football club badges.",
};

export default function GuessTheLogoPage() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/" className="p-2 bg-hub-card border border-hub-border rounded-full hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Guess the Logo</h1>
          <p className="text-slate-400">Can you identify the club before the blur fades?</p>
        </div>
      </div>
      
      <div className="py-6 border-t border-hub-border">
        <GuessTheLogo />
      </div>
    </div>
  );
}
