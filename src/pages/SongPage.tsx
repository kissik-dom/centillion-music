import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  Check,
  Copy,
  Crown,
  Disc3,
  Download,
  Edit3,
  Loader2,
  Music2,
  Pause,
  Play,
  Save,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { BEAT_PRESETS, playBeat, stopBeat } from "@/lib/beats";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

export function SongPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const song = useQuery(
    api.songs.get,
    id ? { id: id as Id<"songs"> } : "skip"
  );
  const updateSong = useMutation(api.songs.update);

  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [selectedBeat, setSelectedBeat] = useState<string | null>(null);
  const [playingBeat, setPlayingBeat] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (song) {
      setTitle(song.title);
      setLyrics(song.lyrics);
      setSelectedBeat(song.beatPreset || null);
    }
  }, [song]);

  useEffect(() => {
    return () => stopBeat();
  }, []);

  if (!id) return null;

  if (song === undefined) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-6 text-[#D4AF37] animate-spin" />
        </div>
      </div>
    );
  }

  if (song === null) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center py-24">
          <Crown className="size-8 text-[#D4AF37]/20 mx-auto mb-3" />
          <p className="text-[#8B9BB4]">Song not found</p>
          <Link
            to="/library"
            className="text-[#D4AF37] text-sm mt-2 inline-block hover:underline"
          >
            ← Back to Library
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSong({
        id: id as Id<"songs">,
        title: title.trim(),
        lyrics: lyrics.trim(),
        beatPreset: selectedBeat || undefined,
        beatBpm: selectedBeat
          ? BEAT_PRESETS.find((b) => b.id === selectedBeat)?.bpm
          : undefined,
      });
      setEditMode(false);
      toast.success("Song saved!");
    } catch (err: any) {
      toast.error("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      await updateSong({
        id: id as Id<"songs">,
        status: song.status === "complete" ? "draft" : "complete",
      });
      toast.success(
        song.status === "complete"
          ? "Moved back to drafts"
          : "Marked as complete!"
      );
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(lyrics);
    setCopied(true);
    toast.success("Lyrics copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = `${title}\n${"=".repeat(title.length)}\n\nGenre: ${song.genre}${song.mood ? ` | Mood: ${song.mood}` : ""}${selectedBeat ? ` | Beat: ${BEAT_PRESETS.find((b) => b.id === selectedBeat)?.name || selectedBeat}` : ""}\n\n${lyrics}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Song downloaded");
  };

  const toggleBeatPreview = (beatId: string) => {
    if (playingBeat === beatId) {
      stopBeat();
      setPlayingBeat(null);
    } else {
      stopBeat();
      const preset = BEAT_PRESETS.find((b) => b.id === beatId);
      if (preset) {
        playBeat(preset);
        setPlayingBeat(beatId);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back nav */}
      <button
        onClick={() => navigate("/library")}
        className="flex items-center gap-2 text-[#8B9BB4] hover:text-[#D4AF37] text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Library
      </button>

      {/* Song Header */}
      <div className="rounded-xl bg-[#0D1524] border border-[rgba(212,175,55,0.1)] p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {editMode ? (
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold bg-transparent text-[#FFF8E7] border-b border-[#D4AF37]/30 pb-1 w-full focus:outline-none focus:border-[#D4AF37]"
              />
            ) : (
              <h1 className="text-2xl font-bold text-[#FFF8E7]">{title}</h1>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(212,175,55,0.1)] text-[#D4AF37] font-medium">
                {song.genre}
              </span>
              {song.mood && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#1A2540] text-[#8B9BB4]">
                  {song.mood}
                </span>
              )}
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  song.status === "complete"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-[rgba(212,175,55,0.08)] text-[#D4AF37]"
                }`}
              >
                {song.status === "complete" ? "✓ Complete" : "Draft"}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {editMode ? (
              <>
                <Button
                  onClick={() => {
                    setEditMode(false);
                    setTitle(song.title);
                    setLyrics(song.lyrics);
                  }}
                  variant="ghost"
                  className="text-[#8B9BB4]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#D4AF37] hover:bg-[#C9A82C] text-[#070B14] font-semibold"
                >
                  {saving ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="size-4 mr-2" />
                  )}
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setEditMode(true)}
                  variant="outline"
                  className="border-[rgba(212,175,55,0.15)] text-[#E5C158] hover:bg-[rgba(212,175,55,0.08)]"
                >
                  <Edit3 className="size-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={handleMarkComplete}
                  variant="outline"
                  className="border-[rgba(212,175,55,0.15)] text-[#E5C158] hover:bg-[rgba(212,175,55,0.08)]"
                >
                  <Check className="size-4 mr-2" />
                  {song.status === "complete"
                    ? "Move to Draft"
                    : "Mark Complete"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A2540] text-xs text-[#8B9BB4] hover:text-[#D4AF37] hover:bg-[rgba(212,175,55,0.08)] transition-colors"
          >
            {copied ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
            Copy
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A2540] text-xs text-[#8B9BB4] hover:text-[#D4AF37] hover:bg-[rgba(212,175,55,0.08)] transition-colors"
          >
            <Download className="size-3.5" />
            Download
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lyrics */}
        <div className="lg:col-span-2 rounded-xl bg-[#0D1524] border border-[rgba(212,175,55,0.1)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Music2 className="size-4 text-[#D4AF37]" />
            <h2 className="text-sm font-semibold text-[#FFF8E7]">Lyrics</h2>
          </div>
          {editMode ? (
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              className="w-full min-h-[400px] bg-[#0A1020] border border-[rgba(212,175,55,0.1)] rounded-lg px-4 py-3 text-sm text-[#E8E4DC] leading-relaxed resize-none font-mono focus:border-[#D4AF37]/30 transition-colors"
            />
          ) : (
            <pre className="text-sm text-[#E8E4DC] leading-relaxed whitespace-pre-wrap font-mono">
              {lyrics}
            </pre>
          )}
        </div>

        {/* Beat Selector Sidebar */}
        <div className="rounded-xl bg-[#0D1524] border border-[rgba(212,175,55,0.1)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Disc3 className="size-4 text-[#D4AF37]" />
            <h2 className="text-sm font-semibold text-[#FFF8E7]">Beat</h2>
          </div>

          {selectedBeat ? (
            <div className="mb-4">
              {(() => {
                const beat = BEAT_PRESETS.find((b) => b.id === selectedBeat);
                if (!beat) return null;
                return (
                  <div className="rounded-lg bg-[rgba(212,175,55,0.06)] border border-[rgba(212,175,55,0.15)] p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-[#E5C158]">
                        {beat.name}
                      </span>
                      <button
                        onClick={() => toggleBeatPreview(beat.id)}
                        className={`size-7 rounded-full flex items-center justify-center ${
                          playingBeat === beat.id
                            ? "bg-[#D4AF37] text-[#070B14]"
                            : "bg-[rgba(212,175,55,0.1)] text-[#D4AF37]"
                        }`}
                      >
                        {playingBeat === beat.id ? (
                          <Pause className="size-3" />
                        ) : (
                          <Play className="size-3 ml-0.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-[#8B9BB4]">
                      {beat.genre} · {beat.bpm} BPM · {beat.key}
                    </p>
                    {editMode && (
                      <button
                        onClick={() => setSelectedBeat(null)}
                        className="text-xs text-red-400 mt-2 hover:underline"
                      >
                        Remove beat
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : (
            <p className="text-xs text-[#4A5568] mb-4">No beat selected</p>
          )}

          {editMode && (
            <>
              <p className="text-xs text-[#8B9BB4] mb-2 font-medium">
                Choose a beat:
              </p>
              <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
                {BEAT_PRESETS.map((beat) => (
                  <button
                    key={beat.id}
                    onClick={() => setSelectedBeat(beat.id)}
                    className={`w-full text-left p-2.5 rounded-lg transition-all text-sm ${
                      selectedBeat === beat.id
                        ? "bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.2)]"
                        : "bg-[#0A1020] border border-transparent hover:border-[rgba(212,175,55,0.1)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-medium text-xs ${
                          selectedBeat === beat.id
                            ? "text-[#D4AF37]"
                            : "text-[#C4BFB3]"
                        }`}
                      >
                        {beat.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBeatPreview(beat.id);
                        }}
                        className="p-1 rounded-md hover:bg-[rgba(212,175,55,0.1)] text-[#8B9BB4]"
                      >
                        {playingBeat === beat.id ? (
                          <Pause className="size-3" />
                        ) : (
                          <Play className="size-3" />
                        )}
                      </button>
                    </div>
                    <span className="text-[10px] text-[#4A5568]">
                      {beat.genre} · {beat.bpm} BPM
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {!editMode && !selectedBeat && (
            <Button
              onClick={() => setEditMode(true)}
              variant="outline"
              size="sm"
              className="w-full border-[rgba(212,175,55,0.15)] text-[#E5C158] hover:bg-[rgba(212,175,55,0.08)] mt-2"
            >
              <Sparkles className="size-3.5 mr-1.5" />
              Add a Beat
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
