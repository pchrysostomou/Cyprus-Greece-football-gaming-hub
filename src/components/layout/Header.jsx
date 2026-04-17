"use client";

import Link from "next/link";
import { Trophy, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Header() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (_event === 'SIGNED_OUT') {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-hub-border bg-hub-card/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Trophy className="h-6 w-6 text-copper" />
          <span className="font-bold tracking-tight text-foreground text-xl">
            <span className="text-copper">CY</span> & <span className="text-greece">GR</span> Hub
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-300">
          <Link href="/leaderboard" className="hover:text-foreground transition-colors">
            Leaderboards
          </Link>
          
          {user ? (
            <div className="flex items-center gap-3 ml-4 border-l border-hub-border pl-4">
              <Link href="/profile" className="flex items-center gap-1 hover:text-white transition-colors">
                <User className="h-4 w-4" /> Profile
              </Link>
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="ml-2 bg-copper/10 text-copper hover:bg-copper/20 px-4 py-2 rounded-full transition-colors">
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
