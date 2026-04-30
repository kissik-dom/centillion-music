import { Authenticated, Unauthenticated } from "convex/react";
import { ArrowRight, Headphones, Mic, Music, Radio, Sparkles, Wand2 } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Music, title: "AI Music Gen", desc: "Create original tracks with AI" },
  { icon: Headphones, title: "Streaming", desc: "Unlimited AI-generated music" },
  { icon: Mic, title: "AI Artists", desc: "Follow AI music personalities" },
  { icon: Radio, title: "Live Radio", desc: "24/7 AI-curated stations" },
  { icon: Wand2, title: "Smart Mix", desc: "Personalized playlists" },
  { icon: Sparkles, title: "Discover", desc: "Explore new genres and sounds" },
];

export function LandingPage() {
  return (
    <>
      <Authenticated><Navigate to="/dashboard" replace /></Authenticated>
      <Unauthenticated>
        <div className="min-h-screen flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
            <div className="relative mb-8">
              <div className="absolute inset-0 blur-3xl opacity-30 bg-[#FF8C42] rounded-full scale-150" />
              <div className="relative size-20 rounded-2xl bg-gradient-to-br from-[#FF8C42] to-[#E07030] flex items-center justify-center" style={{ boxShadow: '0 0 20px rgba(255,140,66,0.3)' }}>
                <Music className="size-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-center mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-[#FF8C42] via-[#FFA666] to-[#FFD700] bg-clip-text text-transparent">Centillion Music</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-center max-w-2xl mb-10">
              AI-powered music streaming, generation, and discovery. Create, listen, and explore an infinite universe of sound.
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg" className="bg-[#FF8C42] hover:bg-[#E07030] text-white px-8">
                <Link to="/signup">Start Listening <ArrowRight className="ml-2 size-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-[rgba(255,255,255,0.15)] hover:bg-[#1A1A24]">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
          <div className="px-4 pb-20">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((f) => (
                <div key={f.title} className="p-6 rounded-xl bg-[#12121A] border border-[rgba(255,255,255,0.06)] hover:border-[#FF8C42]/30 transition-colors">
                  <f.icon className="size-8 text-[#FF8C42] mb-3" />
                  <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <footer className="border-t border-[rgba(255,255,255,0.06)] py-6 text-center text-muted-foreground text-sm">Centillion OS · Part of the Centillion Ecosystem</footer>
        </div>
      </Unauthenticated>
    </>
  );
}
