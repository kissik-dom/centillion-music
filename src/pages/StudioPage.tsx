import { useMutation } from "convex/react";
import {
  Check,
  ChevronDown,
  Copy,
  Crown,
  Download,
  Loader2,
  Music2,
  PenLine,
  RotateCcw,
  Save,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { GENRES, MOODS } from "@/lib/beats";
import { toast } from "sonner";

const STYLES = [
  "Verse-Chorus-Verse",
  "Freestyle / Stream of Consciousness",
  "Storytelling / Narrative",
  "Hook-Heavy / Catchy",
  "Spoken Word / Poetry",
  "Battle Rap / Bars",
  "Ballad",
  "Anthem / Empowerment",
];

export function StudioPage() {
  const navigate = useNavigate();
  const createSong = useMutation(api.songs.create);

  const [topic, setTopic] = useState("");
  const [genre, setGenre] = useState("Hip-Hop");
  const [mood, setMood] = useState("Hype");
  const [style, setStyle] = useState("Verse-Chorus-Verse");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [showMoodDropdown, setShowMoodDropdown] = useState(false);
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);
  const [aiModel, setAiModel] = useState("");

  async function handleGenerate() {
    if (!topic.trim()) {
      toast.error("Enter a topic or idea for your lyrics");
      return;
    }
    setIsGenerating(true);
    setLyrics("");
    setAiModel("");

    try {
      const res = await fetch("/api/generate-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          genre,
          mood,
          style,
          additionalNotes: additionalNotes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setLyrics(data.lyrics);
      if (data.model) setAiModel(data.model);
      if (data.note) toast.info(data.note);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate lyrics");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSave() {
    if (!lyrics.trim()) {
      toast.error("Generate some lyrics first");
      return;
    }
    try {
      const title = topic.trim().slice(0, 60) || "Untitled Song";
      const id = await createSong({
        title,
        lyrics: lyrics.trim(),
        genre,
        mood,
        style,
        topic: topic.trim(),
        status: "draft",
      });
      toast.success("Song saved to your library!");
      navigate(`/song/${id}`);
    } catch (err: any) {
      toast.error("Failed to save: " + (err.message || "Unknown error"));
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(lyrics);
    setCopied(true);
    toast.success("Lyrics copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([lyrics], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic.trim().replace(/\s+/g, "-").toLowerCase() || "lyrics"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Lyrics downloaded");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="size-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8960F] flex items-center justify-center gold-glow-sm">
            <Wand2 className="size-5 text-[#070B14]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#FFF8E7]">
              AI Lyrics Studio
            </h1>
            <p className="text-sm text-[#8B9BB4]">
              Powered by open-source AI · No restrictions
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Panel */}
        <div className="space-y-5">
          {/* Topic Input */}
          <div className="rounded-xl bg-[#0D1524] border border-[rgba(212,175,55,0.1)] p-5">
            <label className="block text-sm font-semibold text-[#E5C158] mb-2 flex items-center gap-2">
              <PenLine className="size-4" />
              What's your song about?
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Rising from nothing to build an empire, losing someone you love, a summer night in the city..."
              className="w-full min-h-[100px] bg-[#0A1020] border border-[rgba(212,175,55,0.1)] rounded-lg px-4 py-3 text-[#E8E4DC] placeholder:text-[#4A5568] resize-none focus:border-[#D4AF37]/30 transition-colors"
            />
          </div>

          {/* Genre, Mood, Style Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Genre */}
            <div className="relative">
              <label className="block text-xs font-medium text-[#8B9BB4] mb-1.5 uppercase tracking-wider">
                Genre
              </label>
              <button
                onClick={() => {
                  setShowGenreDropdown(!showGenreDropdown);
                  setShowMoodDropdown(false);
                  setShowStyleDropdown(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-[#0D1524] border border-[rgba(212,175,55,0.1)] rounded-lg text-sm text-[#E8E4DC] hover:border-[rgba(212,175,55,0.25)] transition-colors"
              >
                {genre}
                <ChevronDown className="size-4 text-[#8B9BB4]" />
              </button>
              {showGenreDropdown && (
                <div className="absolute z-50 top-full mt-1 w-full bg-[#0F1D35] border border-[rgba(212,175,55,0.15)] rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {GENRES.map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        setGenre(g);
                        setShowGenreDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-[rgba(212,175,55,0.08)] transition-colors ${
                        genre === g
                          ? "text-[#D4AF37] bg-[rgba(212,175,55,0.05)]"
                          : "text-[#C4BFB3]"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mood */}
            <div className="relative">
              <label className="block text-xs font-medium text-[#8B9BB4] mb-1.5 uppercase tracking-wider">
                Mood
              </label>
              <button
                onClick={() => {
                  setShowMoodDropdown(!showMoodDropdown);
                  setShowGenreDropdown(false);
                  setShowStyleDropdown(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-[#0D1524] border border-[rgba(212,175,55,0.1)] rounded-lg text-sm text-[#E8E4DC] hover:border-[rgba(212,175,55,0.25)] transition-colors"
              >
                {mood}
                <ChevronDown className="size-4 text-[#8B9BB4]" />
              </button>
              {showMoodDropdown && (
                <div className="absolute z-50 top-full mt-1 w-full bg-[#0F1D35] border border-[rgba(212,175,55,0.15)] rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {MOODS.map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setMood(m);
                        setShowMoodDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-[rgba(212,175,55,0.08)] transition-colors ${
                        mood === m
                          ? "text-[#D4AF37] bg-[rgba(212,175,55,0.05)]"
                          : "text-[#C4BFB3]"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Style */}
            <div className="relative">
              <label className="block text-xs font-medium text-[#8B9BB4] mb-1.5 uppercase tracking-wider">
                Style
              </label>
              <button
                onClick={() => {
                  setShowStyleDropdown(!showStyleDropdown);
                  setShowGenreDropdown(false);
                  setShowMoodDropdown(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-[#0D1524] border border-[rgba(212,175,55,0.1)] rounded-lg text-sm text-[#E8E4DC] hover:border-[rgba(212,175,55,0.25)] transition-colors"
              >
                <span className="truncate">{style}</span>
                <ChevronDown className="size-4 text-[#8B9BB4] shrink-0 ml-1" />
              </button>
              {showStyleDropdown && (
                <div className="absolute z-50 top-full mt-1 w-full bg-[#0F1D35] border border-[rgba(212,175,55,0.15)] rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {STYLES.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setStyle(s);
                        setShowStyleDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-[rgba(212,175,55,0.08)] transition-colors ${
                        style === s
                          ? "text-[#D4AF37] bg-[rgba(212,175,55,0.05)]"
                          : "text-[#C4BFB3]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="rounded-xl bg-[#0D1524] border border-[rgba(212,175,55,0.1)] p-5">
            <label className="block text-sm font-medium text-[#8B9BB4] mb-2">
              Additional Notes{" "}
              <span className="text-[#4A5568]">(optional)</span>
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g. Include a Spanish verse, reference classic 90s hip-hop, make the chorus catchy and repetitive..."
              className="w-full min-h-[70px] bg-[#0A1020] border border-[rgba(212,175,55,0.1)] rounded-lg px-4 py-3 text-sm text-[#E8E4DC] placeholder:text-[#4A5568] resize-none focus:border-[#D4AF37]/30 transition-colors"
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="w-full h-12 bg-gradient-to-r from-[#D4AF37] to-[#C9A82C] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#070B14] font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              boxShadow: isGenerating
                ? "none"
                : "0 0 20px rgba(212,175,55,0.2)",
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-5 mr-2 animate-spin" />
                Generating lyrics...
              </>
            ) : (
              <>
                <Sparkles className="size-5 mr-2" />
                Generate Lyrics
              </>
            )}
          </Button>

          {aiModel && (
            <p className="text-xs text-[#4A5568] text-center">
              Generated with {aiModel}
            </p>
          )}
        </div>

        {/* Right: Output Panel */}
        <div className="rounded-xl bg-[#0D1524] border border-[rgba(212,175,55,0.1)] flex flex-col min-h-[500px]">
          {/* Output Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(212,175,55,0.08)]">
            <div className="flex items-center gap-2">
              <Music2 className="size-4 text-[#D4AF37]" />
              <span className="text-sm font-semibold text-[#FFF8E7]">
                Generated Lyrics
              </span>
            </div>
            {lyrics && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-md hover:bg-[rgba(212,175,55,0.08)] text-[#8B9BB4] hover:text-[#D4AF37] transition-colors"
                  title="Copy"
                >
                  {copied ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="p-1.5 rounded-md hover:bg-[rgba(212,175,55,0.08)] text-[#8B9BB4] hover:text-[#D4AF37] transition-colors"
                  title="Download"
                >
                  <Download className="size-4" />
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="p-1.5 rounded-md hover:bg-[rgba(212,175,55,0.08)] text-[#8B9BB4] hover:text-[#D4AF37] transition-colors disabled:opacity-50"
                  title="Regenerate"
                >
                  <RotateCcw className="size-4" />
                </button>
              </div>
            )}
          </div>

          {/* Lyrics Content */}
          <div className="flex-1 p-5">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="flex items-end gap-1 h-12">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-[#D4AF37] rounded-full waveform-bar"
                      style={{
                        animationDelay: `${i * 0.15}s`,
                        height: "30%",
                      }}
                    />
                  ))}
                </div>
                <p className="text-sm text-[#8B9BB4]">
                  AI is writing your lyrics...
                </p>
              </div>
            ) : lyrics ? (
              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                className="w-full h-full min-h-[400px] bg-transparent text-[#E8E4DC] text-sm leading-relaxed resize-none focus:outline-none font-mono"
                spellCheck={false}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="size-16 rounded-2xl bg-[rgba(212,175,55,0.06)] flex items-center justify-center mb-4">
                  <Crown className="size-8 text-[#D4AF37]/30" />
                </div>
                <p className="text-[#8B9BB4] mb-1">
                  Your lyrics will appear here
                </p>
                <p className="text-xs text-[#4A5568]">
                  Enter a topic and hit Generate to start creating
                </p>
              </div>
            )}
          </div>

          {/* Save Actions */}
          {lyrics && !isGenerating && (
            <div className="px-5 py-3 border-t border-[rgba(212,175,55,0.08)] flex gap-2">
              <Button
                onClick={handleSave}
                className="flex-1 bg-[#D4AF37] hover:bg-[#C9A82C] text-[#070B14] font-semibold"
              >
                <Save className="size-4 mr-2" />
                Save to Library
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Close any open dropdowns when clicking outside */}
      {(showGenreDropdown || showMoodDropdown || showStyleDropdown) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowGenreDropdown(false);
            setShowMoodDropdown(false);
            setShowStyleDropdown(false);
          }}
        />
      )}
    </div>
  );
}
