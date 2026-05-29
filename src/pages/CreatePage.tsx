import { useMutation } from "convex/react";
import {
  Check,
  ChevronDown,
  Copy,
  Crown,
  Download,
  Loader2,
  Mic,
  MicOff,
  Music,
  Pause,
  Play,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Upload,
  Volume2,
  Wand2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ─── Constants ───────────────────────────────────────────────

type CreationMode = "full" | "instrumental" | "vocals";
type LyricsMode = "ai" | "custom" | "none";
type BeatMode = "ai" | "upload" | "preset";
type VoiceGender = "male" | "female" | "both";

interface VoiceSlot {
  id: string;
  gender: "male" | "female";
  label: string;
}

type GenStep = "idle" | "lyrics" | "music" | "vocals" | "mixing" | "done" | "error";

const GENRES = [
  "Hip-Hop", "Trap", "Boom Bap", "Drill", "R&B", "Pop", "Dark Pop",
  "EDM", "Trance", "Techno", "House", "Deep House", "Afrobeats",
  "Lo-Fi", "Soul", "Gospel", "Jazz", "Rock", "Alternative", "Indie",
  "Orchestra", "Symphony", "Classical", "Reggaeton", "Dancehall",
  "Latin", "Country", "Punk", "Ratchet", "Dark Underground",
  "Drum & Bass", "Ambient", "Blues", "Funk", "Metal", "K-Pop",
  "Reggae", "Disco", "Guitar", "Grunge",
];

const MOODS = [
  "Hype", "Chill", "Dark", "Romantic", "Energetic", "Melancholy",
  "Empowering", "Nostalgic", "Aggressive", "Dreamy", "Uplifting",
  "Raw", "Sensual", "Ethereal", "Gritty", "Triumphant", "Haunting",
  "Peaceful", "Intense", "Playful", "Spiritual", "Mysterious",
  "Confident", "Vulnerable", "Epic",
];

const BEAT_PRESETS = [
  { id: "trap", name: "Trap Bounce", bpm: 140, genre: "Trap" },
  { id: "boom-bap", name: "Boom Bap Classic", bpm: 90, genre: "Hip-Hop" },
  { id: "rnb", name: "Velvet Nights", bpm: 75, genre: "R&B" },
  { id: "afrobeats", name: "Lagos Groove", bpm: 108, genre: "Afrobeats" },
  { id: "pop", name: "Radio Ready", bpm: 120, genre: "Pop" },
  { id: "lofi", name: "Late Night Study", bpm: 82, genre: "Lo-Fi" },
  { id: "edm", name: "Festival Drop", bpm: 128, genre: "EDM" },
  { id: "drill", name: "London Drill", bpm: 142, genre: "Drill" },
  { id: "gospel", name: "Sunday Morning", bpm: 105, genre: "Gospel" },
  { id: "jazz", name: "Midnight Jazz", bpm: 115, genre: "Jazz" },
  { id: "reggaeton", name: "Dembow Flow", bpm: 96, genre: "Reggaeton" },
  { id: "soul", name: "Golden Soul", bpm: 95, genre: "Soul" },
  { id: "trance", name: "Euphoria", bpm: 138, genre: "Trance" },
  { id: "techno", name: "Warehouse", bpm: 130, genre: "Techno" },
  { id: "orchestral", name: "Epic Strings", bpm: 80, genre: "Orchestra" },
  { id: "ambient", name: "Dreamscape", bpm: 70, genre: "Ambient" },
];

// ─── Helper: Build music prompt ───────────────────────────────

function buildMusicPrompt(opts: {
  description: string;
  genre: string[];
  mood: string[];
  influences: string[];
  bpm: number;
  creationMode: CreationMode;
}): string {
  const parts: string[] = [];
  if (opts.description) parts.push(opts.description);
  if (opts.genre.length) parts.push(`Genre: ${opts.genre.join(", ")}`);
  if (opts.mood.length) parts.push(`Mood: ${opts.mood.join(", ")}`);
  if (opts.influences.length)
    parts.push(`Style inspired by: ${opts.influences.join(", ")}`);
  parts.push(`BPM: ${opts.bpm}`);
  if (opts.creationMode === "instrumental")
    parts.push("Instrumental only, no vocals");
  return parts.join(". ") + ".";
}

// ─── Component ───────────────────────────────────────────────

export function CreatePage() {
  const navigate = useNavigate();
  const createSong = useMutation(api.songs.create);

  // ── Creation mode
  const [mode, setMode] = useState<CreationMode>("full");

  // ── Song description
  const [description, setDescription] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // ── Lyrics
  const [lyricsMode, setLyricsMode] = useState<LyricsMode>("ai");
  const [lyricsDescription, setLyricsDescription] = useState("");
  const [customLyrics, setCustomLyrics] = useState("");
  const [generatedLyrics, setGeneratedLyrics] = useState("");

  // ── Beat
  const [beatMode, setBeatMode] = useState<BeatMode>("ai");
  const [uploadedBeat, setUploadedBeat] = useState<File | null>(null);
  const [uploadedBeatUrl, setUploadedBeatUrl] = useState<string>("");
  const [selectedPreset, setSelectedPreset] = useState("");
  const beatInputRef = useRef<HTMLInputElement>(null);

  // ── Voice
  const [voiceGender, setVoiceGender] = useState<VoiceGender>("male");
  const [voiceSlots, setVoiceSlots] = useState<VoiceSlot[]>([
    { id: "1", gender: "male", label: "Voice 1" },
  ]);
  const [uploadedVoice, setUploadedVoice] = useState<File | null>(null);
  const voiceInputRef = useRef<HTMLInputElement>(null);

  // ── Style
  const [selectedGenres, setSelectedGenres] = useState<string[]>(["Hip-Hop"]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>(["Hype"]);
  const [influences, setInfluences] = useState<string[]>([]);
  const [influenceInput, setInfluenceInput] = useState("");
  const [bpm, setBpm] = useState(120);
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [showAllMoods, setShowAllMoods] = useState(false);

  // ── Generation state
  const [genStep, setGenStep] = useState<GenStep>("idle");
  const [genProgress, setGenProgress] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [vocalUrl, setVocalUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // ── Dropdown states
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);

  // ── When creation mode changes, update lyrics mode
  useEffect(() => {
    if (mode === "instrumental") {
      setLyricsMode("none");
    } else if (lyricsMode === "none") {
      setLyricsMode("ai");
    }
  }, [mode, lyricsMode]);

  // ── Voice-to-text ──
  const toggleRecording = useCallback(() => {
    if (isRecording && recognitionRef.current) {
      (recognitionRef.current as { stop: () => void }).stop();
      setIsRecording(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SpeechRecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: { results: { length: number; [i: number]: { 0: { transcript: string } } } }) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setDescription(transcript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    toast.info("Listening... describe your song");
  }, [isRecording]);

  // ── Beat file upload ──
  const handleBeatUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      toast.error("Please upload an audio file");
      return;
    }
    setUploadedBeat(file);
    setUploadedBeatUrl(URL.createObjectURL(file));
    toast.success(`Beat uploaded: ${file.name}`);
  };

  // ── Voice file upload ──
  const handleVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      toast.error("Please upload an audio file");
      return;
    }
    setUploadedVoice(file);
    toast.success(`Voice uploaded: ${file.name}`);
  };

  // ── Genre/mood toggle ──
  const toggleGenre = (g: string) => {
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };
  const toggleMood = (m: string) => {
    setSelectedMoods((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  // ── Add influence ──
  const addInfluence = () => {
    const val = influenceInput.trim();
    if (!val || influences.includes(val)) return;
    setInfluences((prev) => [...prev, val]);
    setInfluenceInput("");
  };

  // ── Voice slots ──
  const addVoiceSlot = () => {
    if (voiceSlots.length >= 6) return;
    const newGender = voiceGender === "female" ? "female" : "male";
    setVoiceSlots((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        gender: newGender,
        label: `Voice ${prev.length + 1}`,
      },
    ]);
  };
  const removeVoiceSlot = (id: string) => {
    if (voiceSlots.length <= 1) return;
    setVoiceSlots((prev) => prev.filter((s) => s.id !== id));
  };
  const updateVoiceSlotGender = (id: string, gender: "male" | "female") => {
    setVoiceSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, gender } : s))
    );
  };

  // ── Audio playback ──
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // ── File to base64 ──
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // ── Poll prediction ──
  const pollPrediction = async (
    predictionId: string,
    maxWait = 300
  ): Promise<{ status: string; output?: string; error?: string }> => {
    const start = Date.now();
    while (Date.now() - start < maxWait * 1000) {
      await new Promise((r) => setTimeout(r, 3000));
      const res = await fetch(
        `/api/prediction-status?id=${predictionId}`
      );
      const data = await res.json();
      if (data.status === "succeeded") return data;
      if (data.status === "failed" || data.status === "canceled") {
        return { status: "failed", error: data.error || "Generation failed" };
      }
    }
    return { status: "failed", error: "Generation timed out" };
  };

  // ═══ MAIN GENERATE FUNCTION ═══
  const handleGenerate = async () => {
    if (!description.trim() && lyricsMode !== "custom") {
      toast.error("Describe what your song should be about");
      return;
    }

    setGenStep("lyrics");
    setGenProgress("");
    setAudioUrl(null);
    setVocalUrl(null);
    setErrorMsg("");

    try {
      // ── Step 1: Lyrics ──
      let finalLyrics = "";

      if (lyricsMode === "custom") {
        finalLyrics = customLyrics;
        setGeneratedLyrics(customLyrics);
      } else if (lyricsMode === "ai") {
        setGenProgress("Generating lyrics with AI...");
        const lyricsRes = await fetch("/api/generate-lyrics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: description.trim(),
            genre: selectedGenres[0] || "Hip-Hop",
            mood: selectedMoods[0] || "Hype",
            style: "Verse-Chorus-Verse",
            additionalNotes: influences.length
              ? `Inspired by: ${influences.join(", ")}`
              : undefined,
          }),
        });
        const lyricsData = await lyricsRes.json();
        if (lyricsData.error && !lyricsData.lyrics) {
          throw new Error(lyricsData.error);
        }
        finalLyrics = lyricsData.lyrics || "";
        setGeneratedLyrics(finalLyrics);
        if (lyricsData.note) toast.info(lyricsData.note);
      }
      // If lyricsMode === "none", no lyrics

      // ── Step 2: Music generation ──
      setGenStep("music");
      setGenProgress("Creating your beat & instrumental...");

      const musicPrompt = buildMusicPrompt({
        description: description.trim(),
        genre: selectedGenres,
        mood: selectedMoods,
        influences,
        bpm,
        creationMode: mode,
      });

      let inputAudioData: string | undefined;
      if (beatMode === "upload" && uploadedBeat) {
        setGenProgress("Processing uploaded beat...");
        inputAudioData = await fileToDataUrl(uploadedBeat);
      }

      const musicRes = await fetch("/api/generate-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: musicPrompt,
          duration: 30,
          inputAudio: inputAudioData,
          temperature: 1.0,
        }),
      });
      const musicData = await musicRes.json();

      if (musicData.demo) {
        // No API key — skip to done with a message
        toast.info(
          "Set REPLICATE_API_TOKEN in Vercel env vars for AI music generation"
        );
        setGenStep("done");
        setGenProgress("Lyrics generated! Add REPLICATE_API_TOKEN for full song creation.");
        return;
      }

      if (musicData.error && !musicData.predictionId) {
        throw new Error(musicData.error);
      }

      let musicUrl = musicData.audioUrl;

      // If we got a prediction ID, poll for completion
      if (!musicUrl && musicData.predictionId) {
        setGenProgress("AI is composing music... this may take 30-60 seconds");
        const result = await pollPrediction(musicData.predictionId);
        if (result.status !== "succeeded") {
          throw new Error(result.error || "Music generation failed");
        }
        musicUrl = result.output;
      }

      if (musicUrl) {
        setAudioUrl(musicUrl);
      }

      // ── Step 3: Vocals (if not instrumental) ──
      if (mode !== "instrumental" && finalLyrics && lyricsMode !== "none") {
        setGenStep("vocals");
        setGenProgress("Generating vocals...");

        // Generate vocals for each voice slot
        for (let i = 0; i < voiceSlots.length; i++) {
          const slot = voiceSlots[i];
          setGenProgress(
            `Generating ${slot.label} (${slot.gender})...`
          );

          const vocalRes = await fetch("/api/generate-vocals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: finalLyrics.slice(0, 800),
              voiceType: slot.gender,
              voiceIndex: i,
            }),
          });
          const vocalData = await vocalRes.json();

          if (vocalData.demo) {
            toast.info("Add REPLICATE_API_TOKEN for AI vocal generation");
            break;
          }

          let vUrl = vocalData.audioUrl;
          if (!vUrl && vocalData.predictionId) {
            setGenProgress(`Waiting for ${slot.label}...`);
            const vResult = await pollPrediction(vocalData.predictionId);
            if (vResult.status === "succeeded") {
              vUrl = vResult.output;
            }
          }

          if (vUrl && i === 0) {
            setVocalUrl(vUrl);
          }
        }
      }

      // ── Step 4: Done ──
      setGenStep("done");
      setGenProgress("Your song is ready!");
      toast.success("Song generated!");

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      setGenStep("error");
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  // ── Save to library ──
  const handleSave = async () => {
    const lyrics = generatedLyrics || customLyrics;
    try {
      const title = description.trim().slice(0, 60) || "Untitled Song";
      const id = await createSong({
        title,
        lyrics: lyrics || "(Instrumental)",
        genre: selectedGenres[0] || "Hip-Hop",
        mood: selectedMoods[0],
        style: influences.join(", ") || undefined,
        beatPreset: beatMode === "preset" ? selectedPreset : undefined,
        beatBpm: bpm,
        topic: description.trim(),
        status: audioUrl ? "complete" : "draft",
      });
      toast.success("Saved to library!");
      navigate(`/song/${id}`);
    } catch {
      toast.error("Failed to save");
    }
  };

  // ── Download audio ──
  const handleDownload = () => {
    const url = audioUrl || vocalUrl;
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${description.trim().replace(/\s+/g, "-").toLowerCase() || "song"}.mp3`;
    a.click();
    toast.success("Downloading...");
  };

  // ── Copy lyrics ──
  const [copied, setCopied] = useState(false);
  const handleCopyLyrics = () => {
    const lyrics = generatedLyrics || customLyrics;
    if (!lyrics) return;
    navigator.clipboard.writeText(lyrics);
    setCopied(true);
    toast.success("Lyrics copied");
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Visible genres/moods ──
  const visibleGenres = showAllGenres ? GENRES : GENRES.slice(0, 16);
  const visibleMoods = showAllMoods ? MOODS : MOODS.slice(0, 12);

  const isGenerating = genStep !== "idle" && genStep !== "done" && genStep !== "error";

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="size-11 rounded-xl bg-gradient-to-br from-[#D4AF37] via-[#E5C158] to-[#B8960F] flex items-center justify-center gold-glow">
            <Music className="size-5 text-[#070B14]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#FFF8E7]">
              Create a Song
            </h1>
            <p className="text-sm text-[#8B9BB4]">
              AI-powered music creation · No restrictions · Open source models
            </p>
          </div>
        </div>
      </div>

      {/* Creation Mode Tabs */}
      <div className="flex gap-2 mb-6">
        {(
          [
            { key: "full", label: "Full Song", icon: "🎵" },
            { key: "instrumental", label: "Instrumental", icon: "🎹" },
            { key: "vocals", label: "Vocals Only", icon: "🎤" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMode(tab.key)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === tab.key
                ? "bg-gradient-to-r from-[#D4AF37] to-[#C9A82C] text-[#070B14] shadow-lg shadow-[rgba(212,175,55,0.2)]"
                : "bg-[#0D1524] text-[#8B9BB4] border border-[rgba(212,175,55,0.1)] hover:border-[rgba(212,175,55,0.25)] hover:text-[#E5C158]"
            }`}
          >
            <span className="mr-1.5">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ═══ LEFT: Configuration (3 cols) ═══ */}
        <div className="lg:col-span-3 space-y-5">
          {/* ── Song Description ── */}
          <Section title="Describe Your Song" icon="🎯" subtitle="What should this song be about?">
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. A dark trap anthem about rising from nothing to build an empire. Hard 808s, aggressive flow, like Travis Scott meets Future..."
                className="w-full min-h-[100px] bg-[#0A1020] border border-[rgba(212,175,55,0.1)] rounded-lg px-4 py-3 text-[#E8E4DC] placeholder:text-[#4A5568] resize-none focus:border-[#D4AF37]/30 transition-colors pr-12"
              />
              <button
                onClick={toggleRecording}
                className={`absolute top-3 right-3 p-2 rounded-lg transition-all ${
                  isRecording
                    ? "bg-red-500/20 text-red-400 animate-pulse"
                    : "bg-[rgba(212,175,55,0.08)] text-[#8B9BB4] hover:text-[#D4AF37]"
                }`}
                title={isRecording ? "Stop recording" : "Voice-to-text"}
              >
                {isRecording ? (
                  <MicOff className="size-4" />
                ) : (
                  <Mic className="size-4" />
                )}
              </button>
            </div>
            {isRecording && (
              <p className="text-xs text-red-400 mt-1 animate-pulse">
                🎙 Listening... speak your description
              </p>
            )}
          </Section>

          {/* ── Lyrics ── */}
          {mode !== "instrumental" && (
            <Section title="Lyrics" icon="📝" subtitle="How do you want your lyrics?">
              <div className="flex gap-2 mb-3">
                {(
                  [
                    { key: "ai", label: "AI Generate" },
                    { key: "custom", label: "Write / Paste" },
                    { key: "none", label: "No Lyrics" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setLyricsMode(opt.key)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      lyricsMode === opt.key
                        ? "bg-[#D4AF37]/20 text-[#E5C158] border border-[#D4AF37]/40"
                        : "bg-[#0A1020] text-[#8B9BB4] border border-[rgba(212,175,55,0.08)] hover:text-[#E5C158]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {lyricsMode === "ai" && (
                <textarea
                  value={lyricsDescription}
                  onChange={(e) => setLyricsDescription(e.target.value)}
                  placeholder="(Optional) Add specific details about the lyrics... e.g. Include a Spanish verse, reference 90s hip-hop, make the hook catchy and repetitive"
                  className="w-full min-h-[70px] bg-[#0A1020] border border-[rgba(212,175,55,0.1)] rounded-lg px-4 py-3 text-sm text-[#E8E4DC] placeholder:text-[#4A5568] resize-none focus:border-[#D4AF37]/30 transition-colors"
                />
              )}

              {lyricsMode === "custom" && (
                <textarea
                  value={customLyrics}
                  onChange={(e) => setCustomLyrics(e.target.value)}
                  placeholder="Paste or type your lyrics here...

[Verse 1]
Your lyrics go here...

[Chorus]
Hook goes here..."
                  className="w-full min-h-[150px] bg-[#0A1020] border border-[rgba(212,175,55,0.1)] rounded-lg px-4 py-3 text-sm text-[#E8E4DC] placeholder:text-[#4A5568] resize-none focus:border-[#D4AF37]/30 transition-colors font-mono"
                />
              )}

              {lyricsMode === "none" && (
                <p className="text-xs text-[#4A5568] italic">
                  Instrumental mode — no lyrics will be generated
                </p>
              )}
            </Section>
          )}

          {/* ── Beat / Music ── */}
          <Section title="Beat & Music" icon="🥁" subtitle="Choose how to create the instrumental">
            <div className="flex gap-2 mb-3">
              {(
                [
                  { key: "ai", label: "AI Generate" },
                  { key: "upload", label: "Upload Beat" },
                  { key: "preset", label: "Choose Preset" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setBeatMode(opt.key)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    beatMode === opt.key
                      ? "bg-[#D4AF37]/20 text-[#E5C158] border border-[#D4AF37]/40"
                      : "bg-[#0A1020] text-[#8B9BB4] border border-[rgba(212,175,55,0.08)] hover:text-[#E5C158]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {beatMode === "ai" && (
              <p className="text-xs text-[#8B9BB4]">
                AI will generate a unique instrumental based on your description, genre, and style settings below.
              </p>
            )}

            {beatMode === "upload" && (
              <div>
                <input
                  ref={beatInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleBeatUpload}
                  className="hidden"
                />
                {uploadedBeat ? (
                  <div className="flex items-center gap-3 p-3 bg-[#0A1020] rounded-lg border border-[rgba(212,175,55,0.15)]">
                    <div className="size-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                      <Music className="size-5 text-[#D4AF37]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#E8E4DC] truncate">
                        {uploadedBeat.name}
                      </p>
                      <p className="text-xs text-[#4A5568]">
                        {(uploadedBeat.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setUploadedBeat(null);
                        setUploadedBeatUrl("");
                      }}
                      className="p-1.5 text-[#8B9BB4] hover:text-red-400 transition-colors"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => beatInputRef.current?.click()}
                    className="w-full p-6 border-2 border-dashed border-[rgba(212,175,55,0.15)] rounded-xl text-center hover:border-[rgba(212,175,55,0.3)] hover:bg-[rgba(212,175,55,0.02)] transition-all group"
                  >
                    <Upload className="size-8 text-[#4A5568] group-hover:text-[#D4AF37] mx-auto mb-2 transition-colors" />
                    <p className="text-sm text-[#8B9BB4] group-hover:text-[#E5C158] transition-colors">
                      Upload a beat file
                    </p>
                    <p className="text-xs text-[#4A5568] mt-1">
                      MP3, WAV, FLAC · AI will use this as the musical foundation
                    </p>
                  </button>
                )}
                {uploadedBeatUrl && (
                  <audio src={uploadedBeatUrl} controls className="w-full mt-2 h-8 opacity-70" />
                )}
              </div>
            )}

            {beatMode === "preset" && (
              <div className="relative">
                <button
                  onClick={() => setShowPresetDropdown(!showPresetDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-[#0A1020] border border-[rgba(212,175,55,0.1)] rounded-lg text-sm text-[#E8E4DC] hover:border-[rgba(212,175,55,0.25)] transition-colors"
                >
                  {selectedPreset
                    ? BEAT_PRESETS.find((p) => p.id === selectedPreset)?.name ||
                      "Select"
                    : "Choose a beat preset..."}
                  <ChevronDown className="size-4 text-[#8B9BB4]" />
                </button>
                {showPresetDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowPresetDropdown(false)}
                    />
                    <div className="absolute z-50 top-full mt-1 w-full bg-[#0F1D35] border border-[rgba(212,175,55,0.15)] rounded-lg shadow-xl max-h-60 overflow-y-auto">
                      {BEAT_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedPreset(p.id);
                            setBpm(p.bpm);
                            setShowPresetDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 text-sm hover:bg-[rgba(212,175,55,0.08)] transition-colors flex justify-between items-center ${
                            selectedPreset === p.id
                              ? "text-[#D4AF37] bg-[rgba(212,175,55,0.05)]"
                              : "text-[#C4BFB3]"
                          }`}
                        >
                          <span>{p.name}</span>
                          <span className="text-xs text-[#4A5568]">
                            {p.genre} · {p.bpm} BPM
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </Section>

          {/* ── Voice Configuration ── */}
          {mode !== "instrumental" && (
            <Section title="Voice Configuration" icon="🎙" subtitle="Configure AI singing voices">
              {/* Voice upload */}
              <div className="mb-4">
                <input
                  ref={voiceInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleVoiceUpload}
                  className="hidden"
                />
                {uploadedVoice ? (
                  <div className="flex items-center gap-3 p-3 bg-[#0A1020] rounded-lg border border-[rgba(212,175,55,0.15)] mb-3">
                    <div className="size-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                      <Mic className="size-4 text-[#D4AF37]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#E8E4DC] truncate">
                        {uploadedVoice.name}
                      </p>
                      <p className="text-[10px] text-[#4A5568]">Your voice reference</p>
                    </div>
                    <button
                      onClick={() => setUploadedVoice(null)}
                      className="p-1 text-[#8B9BB4] hover:text-red-400"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => voiceInputRef.current?.click()}
                    className="w-full p-3 border border-dashed border-[rgba(212,175,55,0.12)] rounded-lg text-center hover:border-[rgba(212,175,55,0.25)] transition-all group mb-3"
                  >
                    <p className="text-xs text-[#8B9BB4] group-hover:text-[#E5C158]">
                      <Upload className="size-3.5 inline mr-1 -mt-0.5" />
                      Upload your voice (optional) — or use AI voices below
                    </p>
                  </button>
                )}
              </div>

              {/* Gender selection */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs text-[#8B9BB4] font-medium">Default voice:</span>
                <div className="flex gap-1.5">
                  {(
                    [
                      { key: "male", label: "♂ Male" },
                      { key: "female", label: "♀ Female" },
                      { key: "both", label: "♂♀ Both" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setVoiceGender(opt.key)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        voiceGender === opt.key
                          ? "bg-[#D4AF37]/20 text-[#E5C158] border border-[#D4AF37]/40"
                          : "bg-[#0A1020] text-[#8B9BB4] border border-transparent hover:text-[#E5C158]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice slots */}
              <div className="space-y-2">
                {voiceSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center gap-2 p-2 bg-[#0A1020] rounded-lg border border-[rgba(212,175,55,0.06)]"
                  >
                    <div className="size-7 rounded bg-[rgba(212,175,55,0.06)] flex items-center justify-center text-xs text-[#D4AF37]">
                      {slot.gender === "male" ? "♂" : "♀"}
                    </div>
                    <span className="text-xs text-[#E8E4DC] flex-1">{slot.label}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => updateVoiceSlotGender(slot.id, "male")}
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          slot.gender === "male"
                            ? "bg-blue-500/20 text-blue-300"
                            : "text-[#4A5568] hover:text-[#8B9BB4]"
                        }`}
                      >
                        M
                      </button>
                      <button
                        onClick={() => updateVoiceSlotGender(slot.id, "female")}
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          slot.gender === "female"
                            ? "bg-pink-500/20 text-pink-300"
                            : "text-[#4A5568] hover:text-[#8B9BB4]"
                        }`}
                      >
                        F
                      </button>
                    </div>
                    {voiceSlots.length > 1 && (
                      <button
                        onClick={() => removeVoiceSlot(slot.id)}
                        className="p-0.5 text-[#4A5568] hover:text-red-400"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    )}
                  </div>
                ))}
                {voiceSlots.length < 6 && (
                  <button
                    onClick={addVoiceSlot}
                    className="w-full p-2 border border-dashed border-[rgba(212,175,55,0.1)] rounded-lg text-xs text-[#4A5568] hover:text-[#E5C158] hover:border-[rgba(212,175,55,0.25)] transition-all flex items-center justify-center gap-1"
                  >
                    <Plus className="size-3" />
                    Add Voice ({voiceSlots.length}/6)
                  </button>
                )}
              </div>
              <p className="text-[10px] text-[#4A5568] mt-2">
                Configure duets, trios, or ensemble. Each voice will be generated separately and mixed.
              </p>
            </Section>
          )}

          {/* ── Style & Influences ── */}
          <Section title="Style & Influences" icon="🎨" subtitle="Shape the sound and feel">
            {/* Genres */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-[#8B9BB4] mb-2 uppercase tracking-wider">
                Genre
              </label>
              <div className="flex flex-wrap gap-1.5">
                {visibleGenres.map((g) => (
                  <button
                    key={g}
                    onClick={() => toggleGenre(g)}
                    className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                      selectedGenres.includes(g)
                        ? "bg-[#D4AF37] text-[#070B14] font-semibold shadow-sm"
                        : "bg-[#0A1020] text-[#8B9BB4] border border-[rgba(212,175,55,0.06)] hover:border-[rgba(212,175,55,0.2)] hover:text-[#E5C158]"
                    }`}
                  >
                    {g}
                  </button>
                ))}
                {!showAllGenres && GENRES.length > 16 && (
                  <button
                    onClick={() => setShowAllGenres(true)}
                    className="px-2.5 py-1 rounded-full text-xs text-[#D4AF37] border border-[#D4AF37]/20 hover:bg-[#D4AF37]/10"
                  >
                    +{GENRES.length - 16} more
                  </button>
                )}
                {showAllGenres && (
                  <button
                    onClick={() => setShowAllGenres(false)}
                    className="px-2.5 py-1 rounded-full text-xs text-[#4A5568] hover:text-[#8B9BB4]"
                  >
                    Show less
                  </button>
                )}
              </div>
            </div>

            {/* Moods */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-[#8B9BB4] mb-2 uppercase tracking-wider">
                Mood
              </label>
              <div className="flex flex-wrap gap-1.5">
                {visibleMoods.map((m) => (
                  <button
                    key={m}
                    onClick={() => toggleMood(m)}
                    className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                      selectedMoods.includes(m)
                        ? "bg-[#E5C158]/20 text-[#E5C158] border border-[#E5C158]/40 font-semibold"
                        : "bg-[#0A1020] text-[#8B9BB4] border border-[rgba(212,175,55,0.06)] hover:border-[rgba(212,175,55,0.2)] hover:text-[#E5C158]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
                {!showAllMoods && MOODS.length > 12 && (
                  <button
                    onClick={() => setShowAllMoods(true)}
                    className="px-2.5 py-1 rounded-full text-xs text-[#D4AF37] border border-[#D4AF37]/20 hover:bg-[#D4AF37]/10"
                  >
                    +{MOODS.length - 12} more
                  </button>
                )}
                {showAllMoods && (
                  <button
                    onClick={() => setShowAllMoods(false)}
                    className="px-2.5 py-1 rounded-full text-xs text-[#4A5568] hover:text-[#8B9BB4]"
                  >
                    Show less
                  </button>
                )}
              </div>
            </div>

            {/* Artist Influences */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-[#8B9BB4] mb-2 uppercase tracking-wider">
                Artist Influences
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  value={influenceInput}
                  onChange={(e) => setInfluenceInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addInfluence()}
                  placeholder="e.g. Travis Scott, Adele, Drake..."
                  className="flex-1 bg-[#0A1020] border border-[rgba(212,175,55,0.1)] rounded-lg px-3 py-2 text-sm text-[#E8E4DC] placeholder:text-[#4A5568] focus:border-[#D4AF37]/30 transition-colors"
                />
                <Button
                  onClick={addInfluence}
                  disabled={!influenceInput.trim()}
                  size="sm"
                  className="bg-[#D4AF37]/20 text-[#E5C158] hover:bg-[#D4AF37]/30 border border-[#D4AF37]/30"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              {influences.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {influences.map((inf) => (
                    <span
                      key={inf}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0F1D35] text-xs text-[#E5C158] border border-[#D4AF37]/20"
                    >
                      {inf}
                      <button
                        onClick={() =>
                          setInfluences((prev) => prev.filter((i) => i !== inf))
                        }
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* BPM Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-[#8B9BB4] uppercase tracking-wider">
                  Tempo (BPM)
                </label>
                <span className="text-sm font-mono text-[#E5C158]">{bpm}</span>
              </div>
              <input
                type="range"
                min={40}
                max={220}
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-full h-1.5 bg-[#1A2540] rounded-full appearance-none cursor-pointer accent-[#D4AF37]"
                style={{
                  background: `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${((bpm - 40) / 180) * 100}%, #1A2540 ${((bpm - 40) / 180) * 100}%, #1A2540 100%)`,
                }}
              />
              <div className="flex justify-between text-[10px] text-[#4A5568] mt-1">
                <span>40</span>
                <span>Slow</span>
                <span>Mid</span>
                <span>Fast</span>
                <span>220</span>
              </div>
            </div>
          </Section>

          {/* ── Generate Button ── */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || (!description.trim() && lyricsMode !== "custom")}
            className="w-full h-14 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#D4AF37] hover:from-[#E5C158] hover:via-[#D4AF37] hover:to-[#E5C158] text-[#070B14] font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
            style={{
              boxShadow: isGenerating
                ? "none"
                : "0 0 30px rgba(212,175,55,0.25), 0 0 60px rgba(212,175,55,0.1)",
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-5 mr-2 animate-spin" />
                Creating your song...
              </>
            ) : (
              <>
                <Sparkles className="size-5 mr-2" />
                Create Song
              </>
            )}
          </Button>
        </div>

        {/* ═══ RIGHT: Output Panel (2 cols) - sticky ═══ */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-6 space-y-4">
            {/* Generation Progress */}
            <div className="rounded-xl bg-[#0D1524] border border-[rgba(212,175,55,0.1)] overflow-hidden">
              <div className="px-4 py-3 border-b border-[rgba(212,175,55,0.06)] flex items-center gap-2">
                <Crown className="size-4 text-[#D4AF37]" />
                <span className="text-sm font-semibold text-[#FFF8E7]">
                  Generation
                </span>
              </div>

              <div className="p-4 space-y-2.5">
                {(
                  [
                    { step: "lyrics", label: "Lyrics", icon: "📝" },
                    { step: "music", label: "Music / Beat", icon: "🎵" },
                    { step: "vocals", label: "Vocals", icon: "🎤" },
                    { step: "mixing", label: "Final Mix", icon: "🎛" },
                  ] as const
                ).map((s) => {
                  const stepOrder = ["idle", "lyrics", "music", "vocals", "mixing", "done", "error"];
                  const currentIdx = stepOrder.indexOf(genStep);
                  const thisIdx = stepOrder.indexOf(s.step);
                  const isActive = genStep === s.step;
                  const isDone = currentIdx > thisIdx && genStep !== "error";
                  const isPending = currentIdx < thisIdx;
                  const skip =
                    (s.step === "lyrics" && lyricsMode === "none") ||
                    (s.step === "vocals" && mode === "instrumental");

                  if (skip) return null;

                  return (
                    <div
                      key={s.step}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                        isActive
                          ? "bg-[rgba(212,175,55,0.08)]"
                          : ""
                      }`}
                    >
                      <div className="size-6 rounded-full flex items-center justify-center text-xs">
                        {isDone ? (
                          <div className="size-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Check className="size-3.5 text-emerald-400" />
                          </div>
                        ) : isActive ? (
                          <Loader2 className="size-4 text-[#D4AF37] animate-spin" />
                        ) : (
                          <span className="text-[#4A5568]">{s.icon}</span>
                        )}
                      </div>
                      <span
                        className={`text-sm ${
                          isDone
                            ? "text-emerald-400"
                            : isActive
                              ? "text-[#E5C158] font-medium"
                              : isPending
                                ? "text-[#4A5568]"
                                : "text-[#8B9BB4]"
                        }`}
                      >
                        {s.label}
                      </span>
                      {isActive && (
                        <div className="flex-1 flex justify-end">
                          <div className="flex gap-0.5">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="w-1 h-3 bg-[#D4AF37] rounded-full waveform-bar"
                                style={{ animationDelay: `${i * 0.2}s` }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {genProgress && (
                  <p className="text-xs text-[#8B9BB4] px-2 pt-1">
                    {genProgress}
                  </p>
                )}

                {genStep === "error" && (
                  <div className="px-2 py-2 bg-red-500/10 rounded-lg">
                    <p className="text-xs text-red-400">{errorMsg}</p>
                  </div>
                )}

                {genStep === "idle" && (
                  <div className="text-center py-6">
                    <div className="size-14 rounded-2xl bg-[rgba(212,175,55,0.06)] flex items-center justify-center mx-auto mb-3">
                      <Wand2 className="size-7 text-[#D4AF37]/25" />
                    </div>
                    <p className="text-sm text-[#8B9BB4]">Ready to create</p>
                    <p className="text-xs text-[#4A5568] mt-0.5">
                      Configure your song and hit Create
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Audio Player */}
            {(audioUrl || vocalUrl) && (
              <div className="rounded-xl bg-[#0D1524] border border-[rgba(212,175,55,0.1)] overflow-hidden">
                <div className="px-4 py-3 border-b border-[rgba(212,175,55,0.06)] flex items-center gap-2">
                  <Volume2 className="size-4 text-[#D4AF37]" />
                  <span className="text-sm font-semibold text-[#FFF8E7]">
                    Audio Output
                  </span>
                </div>
                <div className="p-4">
                  {audioUrl && (
                    <div className="mb-3">
                      <p className="text-xs text-[#8B9BB4] mb-1.5">Instrumental</p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={togglePlay}
                          className="size-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8960F] flex items-center justify-center hover:shadow-lg hover:shadow-[rgba(212,175,55,0.2)] transition-all"
                        >
                          {isPlaying ? (
                            <Pause className="size-4 text-[#070B14]" />
                          ) : (
                            <Play className="size-4 text-[#070B14] ml-0.5" />
                          )}
                        </button>
                        <audio
                          ref={audioRef}
                          src={audioUrl}
                          onEnded={() => setIsPlaying(false)}
                          className="hidden"
                        />
                        <div className="flex-1 flex items-center gap-1 h-8">
                          {Array.from({ length: 30 }).map((_, i) => (
                            <div
                              key={i}
                              className="flex-1 rounded-full bg-[#D4AF37]/20"
                              style={{
                                height: `${20 + Math.random() * 80}%`,
                                opacity: isPlaying ? 1 : 0.4,
                                transition: "opacity 0.3s",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <audio src={audioUrl} controls className="w-full mt-2 h-8" />
                    </div>
                  )}

                  {vocalUrl && (
                    <div className="mb-3">
                      <p className="text-xs text-[#8B9BB4] mb-1.5">Vocals</p>
                      <audio src={vocalUrl} controls className="w-full h-8" />
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    <Button
                      onClick={handleDownload}
                      size="sm"
                      className="flex-1 bg-[rgba(212,175,55,0.1)] text-[#E5C158] hover:bg-[rgba(212,175,55,0.2)] border border-[#D4AF37]/20"
                    >
                      <Download className="size-3.5 mr-1.5" />
                      Download
                    </Button>
                    <Button
                      onClick={handleSave}
                      size="sm"
                      className="flex-1 bg-[#D4AF37] text-[#070B14] hover:bg-[#C9A82C] font-semibold"
                    >
                      <Save className="size-3.5 mr-1.5" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Generated Lyrics Preview */}
            {generatedLyrics && (
              <div className="rounded-xl bg-[#0D1524] border border-[rgba(212,175,55,0.1)] overflow-hidden">
                <div className="px-4 py-3 border-b border-[rgba(212,175,55,0.06)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📝</span>
                    <span className="text-sm font-semibold text-[#FFF8E7]">
                      Lyrics
                    </span>
                  </div>
                  <button
                    onClick={handleCopyLyrics}
                    className="p-1.5 rounded-md hover:bg-[rgba(212,175,55,0.08)] text-[#8B9BB4] hover:text-[#D4AF37] transition-colors"
                  >
                    {copied ? (
                      <Check className="size-3.5" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                </div>
                <div className="p-4 max-h-[300px] overflow-y-auto">
                  <pre className="text-xs text-[#C4BFB3] whitespace-pre-wrap font-mono leading-relaxed">
                    {generatedLyrics}
                  </pre>
                </div>
              </div>
            )}

            {/* Setup Notice */}
            <div className="rounded-xl bg-[#0D1524] border border-[rgba(212,175,55,0.06)] p-4">
              <p className="text-xs text-[#4A5568] leading-relaxed">
                <span className="text-[#D4AF37]">⚡ API Keys Needed:</span>{" "}
                Set <code className="text-[#8B9BB4]">GROQ_API_KEY</code> (lyrics) and{" "}
                <code className="text-[#8B9BB4]">REPLICATE_API_TOKEN</code> (music &amp; vocals) in Vercel → Settings → Environment Variables.
                Free tiers available at{" "}
                <a
                  href="https://console.groq.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#D4AF37] hover:underline"
                >
                  console.groq.com
                </a>{" "}
                and{" "}
                <a
                  href="https://replicate.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#D4AF37] hover:underline"
                >
                  replicate.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section Component ──────────────────────────────────────

function Section({
  title,
  icon,
  subtitle,
  children,
}: {
  title: string;
  icon: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-[#0D1524] border border-[rgba(212,175,55,0.1)] p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{icon}</span>
        <h3 className="text-sm font-semibold text-[#FFF8E7]">{title}</h3>
      </div>
      <p className="text-xs text-[#4A5568] mb-3">{subtitle}</p>
      {children}
    </div>
  );
}
