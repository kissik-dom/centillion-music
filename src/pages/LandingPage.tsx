import { Authenticated, Unauthenticated } from "convex/react";
import {
  ArrowRight,
  Crown,
  Disc3,
  Headphones,
  Mic2,
  Music2,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Sparkles,
    title: "Full Song Creation",
    desc: "Describe your song and AI creates lyrics, beats, and vocals — all in one flow.",
  },
  {
    icon: Wand2,
    title: "AI Lyrics Studio",
    desc: "Generate complete song lyrics with AI — any genre, any topic, no limits.",
  },
  {
    icon: Disc3,
    title: "Beat Upload & Generation",
    desc: "Upload your own beats or let AI generate unique instrumentals from a prompt.",
  },
  {
    icon: Mic2,
    title: "AI Voice Selection",
    desc: "Choose male, female, or ensemble voices. Configure duets, trios, or choirs.",
  },
  {
    icon: Music2,
    title: "40+ Genres & Styles",
    desc: "From trap to orchestra, trance to gospel — every genre and mood you can imagine.",
  },
  {
    icon: Headphones,
    title: "Unrestricted & Open Source",
    desc: "Powered by open-source AI models with zero content restrictions.",
  },
];

export function LandingPage() {
  return (
    <>
      <Authenticated>
        <Navigate to="/dashboard" replace />
      </Authenticated>
      <Unauthenticated>
        <div className="min-h-screen flex flex-col bg-[#070B14]">
          {/* Nav */}
          <nav className="flex items-center justify-between px-6 py-4 border-b border-[rgba(212,175,55,0.08)]">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#B8960F] flex items-center justify-center">
                <Crown className="size-4 text-[#070B14]" />
              </div>
              <span className="font-bold text-lg tracking-tight text-[#FFF8E7]">
                Centillion Music
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="ghost"
                className="text-[#C4BFB3] hover:text-[#FFF8E7] hover:bg-[rgba(212,175,55,0.08)]"
              >
                <Link to="/login">Sign In</Link>
              </Button>
              <Button
                asChild
                className="bg-[#D4AF37] hover:bg-[#C9A82C] text-[#070B14] font-semibold"
              >
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          </nav>

          {/* Hero */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-24 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37] opacity-[0.04] rounded-full blur-[120px]" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#D4AF37] opacity-[0.02] rounded-full blur-[80px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              {/* Icon */}
              <div className="relative mb-8">
                <div className="absolute inset-0 blur-3xl opacity-20 bg-[#D4AF37] rounded-full scale-[2]" />
                <div
                  className="relative size-24 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#E5C158] to-[#B8960F] flex items-center justify-center"
                  style={{
                    boxShadow:
                      "0 0 40px rgba(212,175,55,0.25), 0 0 80px rgba(212,175,55,0.1)",
                  }}
                >
                  <Crown className="size-12 text-[#070B14]" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-5xl md:text-7xl font-extrabold text-center mb-3 tracking-tight">
                <span className="gold-text">Centillion Music</span>
              </h1>
              <p className="text-sm font-medium tracking-[0.3em] uppercase text-[#D4AF37]/60 mb-6">
                Royal Kissi Kingdom
              </p>
              <p className="text-lg md:text-xl text-[#8B9BB4] text-center max-w-2xl mb-10 leading-relaxed">
                Create full songs with the power of AI. Generate lyrics,
                beats, and vocals — upload your own sounds, choose voices,
                pick from 40+ genres. Unrestricted, open-source, built for
                creators who refuse limits.
              </p>

              {/* CTA */}
              <div className="flex gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#D4AF37] hover:bg-[#C9A82C] text-[#070B14] font-bold px-8 h-12 text-base"
                  style={{
                    boxShadow: "0 0 20px rgba(212,175,55,0.2)",
                  }}
                >
                  <Link to="/signup">
                    Start Creating{" "}
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-[rgba(212,175,55,0.2)] hover:bg-[rgba(212,175,55,0.08)] text-[#E5C158] h-12 text-base"
                >
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="px-4 pb-24">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(212,175,55,0.15)] bg-[rgba(212,175,55,0.05)] mb-4">
                  <Sparkles className="size-3.5 text-[#D4AF37]" />
                  <span className="text-xs font-medium text-[#D4AF37] tracking-wide uppercase">
                    Features
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-[#FFF8E7] mb-3">
                  Everything You Need to Create
                </h2>
                <p className="text-[#8B9BB4] max-w-lg mx-auto">
                  A complete music creation suite powered by unrestricted
                  open-source AI.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((f) => (
                  <div
                    key={f.title}
                    className="p-6 rounded-xl bg-[#0D1524] border border-[rgba(212,175,55,0.08)] hover:border-[rgba(212,175,55,0.2)] transition-all duration-300 gold-border-hover group"
                  >
                    <div className="size-10 rounded-lg bg-[rgba(212,175,55,0.1)] flex items-center justify-center mb-4 group-hover:bg-[rgba(212,175,55,0.15)] transition-colors">
                      <f.icon className="size-5 text-[#D4AF37]" />
                    </div>
                    <h3 className="font-semibold text-[#FFF8E7] text-lg mb-1.5">
                      {f.title}
                    </h3>
                    <p className="text-[#8B9BB4] text-sm leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t border-[rgba(212,175,55,0.08)] py-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="size-4 text-[#D4AF37]" />
              <span className="text-sm font-medium text-[#C4BFB3]">
                Centillion Music
              </span>
            </div>
            <p className="text-xs text-[#8B9BB4]">
              Part of the Kissi Kingdom Digital Ecosystem ·{" "}
              <span className="italic">
                Omnividens, Omnipotens, Omniaeternus
              </span>
            </p>
          </footer>
        </div>
      </Unauthenticated>
    </>
  );
}
