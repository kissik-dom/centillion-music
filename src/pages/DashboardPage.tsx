import { useMutation, useQuery } from "convex/react";
import { Heart, Music, Pause, Play, SkipBack, SkipForward, Sparkles, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatPlays(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function TrackRow({ track, index, isPlaying, onPlay }: { track: any; index: number; isPlaying: boolean; onPlay: () => void }) {
  const likeTrack = useMutation(api.tracks.like);
  const [liked, setLiked] = useState(track.isLiked);

  return (
    <div className={`flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-[#1A1A24] transition-colors group ${isPlaying ? "bg-[#1A1A24]" : ""}`}>
      <button onClick={onPlay} className="w-8 text-center text-sm text-muted-foreground group-hover:hidden">
        {index + 1}
      </button>
      <button onClick={onPlay} className="w-8 text-center hidden group-hover:block">
        {isPlaying ? <Pause className="size-4 text-[#FF8C42] mx-auto" /> : <Play className="size-4 text-[#FF8C42] mx-auto" />}
      </button>
      <div className="size-10 rounded-lg bg-gradient-to-br from-[#FF8C42]/20 to-[#E07030]/20 flex items-center justify-center shrink-0">
        <Music className="size-4 text-[#FF8C42]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isPlaying ? "text-[#FF8C42]" : ""}`}>{track.title}</p>
        <p className="text-xs text-muted-foreground truncate">{track.artist}{track.album ? ` · ${track.album}` : ""}</p>
      </div>
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF8C42]/10 text-[#FF8C42] font-medium hidden sm:block">{track.genre}</span>
      {track.isAIGenerated && (
        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#FF8C42]/10 text-[#FF8C42] font-medium hidden md:block">AI</span>
      )}
      <span className="text-xs text-muted-foreground hidden sm:block w-16 text-right">{formatPlays(track.plays)}</span>
      <button onClick={() => { setLiked(!liked); likeTrack({ trackId: track._id }); }} className="p-1.5">
        <Heart className={`size-4 ${liked ? "text-[#FF4D6A] fill-[#FF4D6A]" : "text-muted-foreground hover:text-[#FF4D6A]"} transition-colors`} />
      </button>
      <span className="text-xs text-muted-foreground w-10 text-right">{formatDuration(track.duration)}</span>
    </div>
  );
}

function NowPlaying({ track }: { track: any | null }) {
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing || !track) return;
    const iv = setInterval(() => setProgress((p) => Math.min(p + 1, track.duration)), 1000);
    return () => clearInterval(iv);
  }, [playing, track]);

  useEffect(() => { setProgress(0); setPlaying(true); }, [track]);

  if (!track) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#12121A] border-t border-[rgba(255,255,255,0.08)] px-4 py-3 z-50">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        <div className="size-12 rounded-lg bg-gradient-to-br from-[#FF8C42]/20 to-[#E07030]/20 flex items-center justify-center shrink-0">
          <Music className="size-5 text-[#FF8C42]" />
        </div>
        <div className="min-w-0 w-48">
          <p className="text-sm font-medium truncate text-[#FF8C42]">{track.title}</p>
          <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
        </div>
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-center gap-4">
            <button className="text-muted-foreground hover:text-foreground"><SkipBack className="size-4" /></button>
            <button onClick={() => setPlaying(!playing)} className="size-8 rounded-full bg-[#FF8C42] flex items-center justify-center hover:bg-[#E07030]">
              {playing ? <Pause className="size-4 text-white" /> : <Play className="size-4 text-white ml-0.5" />}
            </button>
            <button className="text-muted-foreground hover:text-foreground"><SkipForward className="size-4" /></button>
          </div>
          <div className="flex items-center gap-2 w-full max-w-md">
            <span className="text-[10px] text-muted-foreground w-8 text-right">{formatDuration(progress)}</span>
            <div className="flex-1 h-1 bg-[#1A1A24] rounded-full overflow-hidden">
              <div className="h-full bg-[#FF8C42] rounded-full transition-all" style={{ width: `${(progress / track.duration) * 100}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground w-8">{formatDuration(track.duration)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 hidden sm:flex">
          <Volume2 className="size-4 text-muted-foreground" />
          <div className="w-20 h-1 bg-[#1A1A24] rounded-full"><div className="h-full w-3/4 bg-[#FF8C42] rounded-full" /></div>
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const tracks = useQuery(api.tracks.list, {}) || [];
  const genreList = useQuery(api.tracks.genres) || [];
  const seedTracks = useMutation(api.tracks.seed);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  useEffect(() => { if (tracks.length === 0) seedTracks().catch(() => {}); }, [tracks.length, seedTracks]);

  const filtered = selectedGenre ? tracks.filter(t => t.genre === selectedGenre) : tracks;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <Music className="size-6 text-[#FF8C42]" /> Centillion Music
      </h1>
      <p className="text-muted-foreground text-sm mb-6">AI-generated music streaming & discovery</p>

      {/* Genre pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button onClick={() => setSelectedGenre(null)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${!selectedGenre ? "bg-[#FF8C42] text-white" : "bg-[#1A1A24] text-muted-foreground hover:text-foreground"}`}>
          All
        </button>
        {genreList.map((g) => (
          <button key={g.name} onClick={() => setSelectedGenre(selectedGenre === g.name ? null : g.name)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${selectedGenre === g.name ? "bg-[#FF8C42] text-white" : "bg-[#1A1A24] text-muted-foreground hover:text-foreground"}`}>
            {g.emoji} {g.name}
          </button>
        ))}
      </div>

      {/* Track List */}
      <div className="bg-[#12121A] rounded-xl border border-[rgba(255,255,255,0.06)]">
        <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
          <h2 className="text-sm font-semibold flex items-center gap-2"><Sparkles className="size-4 text-[#FF8C42]" /> {selectedGenre || "All Tracks"}</h2>
        </div>
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Sparkles className="size-8 text-[#FF8C42] mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading tracks...</p>
          </div>
        ) : (
          <div className="divide-y divide-[rgba(255,255,255,0.04)]">
            {filtered.map((track, i) => (
              <TrackRow key={track._id} track={track} index={i} isPlaying={currentTrack?._id === track._id} onPlay={() => setCurrentTrack(track)} />
            ))}
          </div>
        )}
      </div>

      <NowPlaying track={currentTrack} />
    </div>
  );
}
