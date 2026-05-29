import {
  Disc3,
  Music,
  Pause,
  Play,
  Zap,
} from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { BEAT_PRESETS, type BeatPreset, playBeat, stopBeat } from "@/lib/beats";

const genreFilters = ["All", ...new Set(BEAT_PRESETS.map((b) => b.genre))];

function BeatCard({
  beat,
  isActive,
  activeStep,
  onToggle,
}: {
  beat: BeatPreset;
  isActive: boolean;
  activeStep: number;
  onToggle: () => void;
}) {
  const moodColors: Record<string, string> = {
    Hard: "text-red-400",
    Chill: "text-blue-400",
    Sensual: "text-pink-400",
    Energetic: "text-orange-400",
    Upbeat: "text-yellow-400",
    Relaxed: "text-emerald-400",
    Hype: "text-amber-400",
    Warm: "text-orange-300",
    Dark: "text-purple-400",
    Fiery: "text-red-500",
    Sophisticated: "text-indigo-400",
    Uplifting: "text-sky-400",
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-300 overflow-hidden ${
        isActive
          ? "bg-[#0D1524] border-[#D4AF37]/40 gold-glow-sm"
          : "bg-[#0D1524] border-[rgba(212,175,55,0.08)] hover:border-[rgba(212,175,55,0.2)]"
      }`}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-[#FFF8E7] text-base">
              {beat.name}
            </h3>
            <p className="text-xs text-[#8B9BB4] mt-0.5">{beat.description}</p>
          </div>
          <button
            onClick={onToggle}
            className={`size-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
              isActive
                ? "bg-[#D4AF37] text-[#070B14] shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                : "bg-[rgba(212,175,55,0.08)] text-[#D4AF37] hover:bg-[rgba(212,175,55,0.15)]"
            }`}
          >
            {isActive ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4 ml-0.5" />
            )}
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(212,175,55,0.1)] text-[#D4AF37] font-medium">
            {beat.genre}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A2540] text-[#8B9BB4] font-medium">
            {beat.bpm} BPM
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A2540] text-[#8B9BB4] font-medium">
            Key: {beat.key}
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full bg-[#1A2540] font-medium ${
              moodColors[beat.mood] || "text-[#8B9BB4]"
            }`}
          >
            {beat.mood}
          </span>
        </div>
      </div>

      {/* Pattern Visualizer */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-16 gap-[3px]">
          {Array.from({ length: 16 }).map((_, i) => {
            const hasKick = beat.pattern.kick[i];
            const hasSnare = beat.pattern.snare[i];
            const hasHihat = beat.pattern.hihat[i];
            const hasClap = beat.pattern.clap[i];
            const isCurrentStep = isActive && activeStep === i;

            return (
              <div
                key={i}
                className={`h-6 rounded-[3px] transition-all duration-100 ${
                  isCurrentStep
                    ? "bg-[#D4AF37] shadow-[0_0_6px_rgba(212,175,55,0.4)]"
                    : hasKick
                      ? "bg-[#D4AF37]/50"
                      : hasSnare || hasClap
                        ? "bg-[#D4AF37]/35"
                        : hasHihat
                          ? "bg-[#D4AF37]/15"
                          : "bg-[#1A2540]"
                }`}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[8px] text-[#4A5568]">1</span>
          <span className="text-[8px] text-[#4A5568]">5</span>
          <span className="text-[8px] text-[#4A5568]">9</span>
          <span className="text-[8px] text-[#4A5568]">13</span>
        </div>
      </div>
    </div>
  );
}

export function BeatsPage() {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const filtered =
    selectedGenre === "All"
      ? BEAT_PRESETS
      : BEAT_PRESETS.filter((b) => b.genre === selectedGenre);

  const handleToggle = useCallback(
    (beat: BeatPreset) => {
      if (activePreset === beat.id) {
        stopBeat();
        setActivePreset(null);
        setActiveStep(0);
      } else {
        stopBeat();
        setActivePreset(beat.id);
        playBeat(beat, (step) => setActiveStep(step));
      }
    },
    [activePreset]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => stopBeat();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="size-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8960F] flex items-center justify-center gold-glow-sm">
            <Disc3 className="size-5 text-[#070B14]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#FFF8E7]">Beat Browser</h1>
            <p className="text-sm text-[#8B9BB4]">
              Preview and select beats for your songs
            </p>
          </div>
        </div>
      </div>

      {/* Genre Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {genreFilters.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedGenre === g
                ? "bg-[#D4AF37] text-[#070B14] shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                : "bg-[#1A2540] text-[#8B9BB4] hover:text-[#E5C158] hover:bg-[rgba(212,175,55,0.08)]"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Now Playing Bar */}
      {activePreset && (
        <div className="mb-6 rounded-xl bg-[#0D1524] border border-[#D4AF37]/30 p-4 flex items-center gap-4 gold-glow-sm">
          <div className="size-10 rounded-lg bg-[rgba(212,175,55,0.15)] flex items-center justify-center">
            <Music className="size-5 text-[#D4AF37] animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#D4AF37]">
              Now Playing:{" "}
              {BEAT_PRESETS.find((b) => b.id === activePreset)?.name}
            </p>
            <p className="text-xs text-[#8B9BB4]">
              {BEAT_PRESETS.find((b) => b.id === activePreset)?.genre} ·{" "}
              {BEAT_PRESETS.find((b) => b.id === activePreset)?.bpm} BPM
            </p>
          </div>
          <div className="flex items-end gap-0.5 h-6">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1 bg-[#D4AF37] rounded-full waveform-bar"
                style={{
                  animationDelay: `${i * 0.12}s`,
                  height: "30%",
                }}
              />
            ))}
          </div>
          <button
            onClick={() => {
              stopBeat();
              setActivePreset(null);
              setActiveStep(0);
            }}
            className="p-2 rounded-lg hover:bg-[rgba(212,175,55,0.1)] text-[#D4AF37]"
          >
            <Pause className="size-5" />
          </button>
        </div>
      )}

      {/* Beat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((beat) => (
          <BeatCard
            key={beat.id}
            beat={beat}
            isActive={activePreset === beat.id}
            activeStep={activeStep}
            onToggle={() => handleToggle(beat)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Zap className="size-8 text-[#D4AF37]/30 mx-auto mb-3" />
          <p className="text-[#8B9BB4]">No beats found for this genre</p>
        </div>
      )}
    </div>
  );
}
