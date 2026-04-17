import Link from "next/link";
import { Search, MapPin, Target, CalendarDays, Grid3X3 } from "lucide-react";

export default function Home() {
  const games = [
    {
      title: "Guess the Logo",
      description: "Identify the team from a blurred or cropped badge.",
      href: "/guess-the-logo",
      icon: Search,
      color: "greece",
      status: "Play Now"
    },
    {
      title: "Player ID",
      description: "Guess the player from a silhouette and progressive clues.",
      href: "/player-id",
      icon: Target,
      color: "copper",
      status: "Play Now"
    },
    {
      title: "Football Bingo",
      description: "Get 3 in a row in the Grid challenge! Orange vs Blue.",
      href: "/football-bingo",
      icon: Grid3X3,
      color: "greece",
      status: "Play Now"
    },
    {
      title: "Who Am I?",
      description: "Daily challenge: unlock clues to find the player.",
      href: "/who-am-i",
      icon: CalendarDays,
      color: "copper",
      status: "Play Now"
    },
    {
      title: "Stadium Guesser",
      description: "Identify the stadium from a single photo.",
      href: "/stadium-guesser",
      icon: MapPin,
      color: "greece",
      status: "Play Now"
    }
  ];

  return (
    <div className="flex flex-col gap-12 py-8">
      <section className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter">
          The Home of <span className="text-copper">Cyprus</span> & <span className="text-greece">Greek</span> Football
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Test your knowledge of the Super League and First Division with daily mini-games and challenges.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game, idx) => (
          <Link
            key={idx}
            href={game.href}
            className={`group relative overflow-hidden rounded-2xl border border-hub-border bg-hub-card p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-${game.color}/50`}
          >
            <div className={`absolute -right-12 -top-12 h-32 w-32 rounded-full bg-${game.color}/10 blur-3xl transition-all group-hover:bg-${game.color}/20`} />
            <div className="relative z-10 flex flex-col h-full space-y-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${game.color}/10 text-${game.color}`}>
                <game.icon className="h-6 w-6" />
              </div>
              <div className="space-y-2 flex-grow">
                <h2 className="text-2xl font-bold tracking-tight">{game.title}</h2>
                <p className="text-slate-400 text-sm leading-relaxed">{game.description}</p>
              </div>
              <div className="pt-4">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  game.status === 'Play Now' 
                    ? 'bg-copper/20 text-copper ring-1 ring-inset ring-copper/30' 
                    : 'bg-slate-800 text-slate-400 ring-1 ring-inset ring-slate-700'
                }`}>
                  {game.status}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
