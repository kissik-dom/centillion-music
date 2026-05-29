import { useMutation, useQuery } from "convex/react";
import {
  BookOpen,
  Calendar,
  Crown,
  Edit3,
  Music2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function SongCard({
  song,
  onDelete,
}: {
  song: any;
  onDelete: (id: Id<"songs">) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const genreColors: Record<string, string> = {
    "Hip-Hop": "bg-purple-500/10 text-purple-400",
    "R&B": "bg-pink-500/10 text-pink-400",
    Pop: "bg-blue-500/10 text-blue-400",
    Electronic: "bg-cyan-500/10 text-cyan-400",
    "Lo-Fi": "bg-emerald-500/10 text-emerald-400",
    Jazz: "bg-indigo-500/10 text-indigo-400",
    Afrobeats: "bg-orange-500/10 text-orange-400",
    Soul: "bg-amber-500/10 text-amber-400",
    Drill: "bg-red-500/10 text-red-400",
    Reggaeton: "bg-lime-500/10 text-lime-400",
    Gospel: "bg-sky-500/10 text-sky-400",
    Rock: "bg-rose-500/10 text-rose-400",
  };

  return (
    <div className="rounded-xl bg-[#0D1524] border border-[rgba(212,175,55,0.08)] hover:border-[rgba(212,175,55,0.2)] transition-all duration-300 gold-border-hover group">
      <Link to={`/song/${song._id}`} className="block p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#FFF8E7] truncate group-hover:text-[#E5C158] transition-colors">
              {song.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  genreColors[song.genre] ||
                  "bg-[rgba(212,175,55,0.1)] text-[#D4AF37]"
                }`}
              >
                {song.genre}
              </span>
              {song.mood && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A2540] text-[#8B9BB4] font-medium">
                  {song.mood}
                </span>
              )}
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  song.status === "complete"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-[rgba(212,175,55,0.08)] text-[#D4AF37]"
                }`}
              >
                {song.status === "complete" ? "Complete" : "Draft"}
              </span>
            </div>
          </div>
          <div className="size-10 rounded-lg bg-[rgba(212,175,55,0.06)] flex items-center justify-center shrink-0">
            <Music2 className="size-5 text-[#D4AF37]/40" />
          </div>
        </div>

        {/* Lyrics preview */}
        <p className="text-xs text-[#8B9BB4] line-clamp-3 leading-relaxed mb-3 font-mono">
          {song.lyrics.slice(0, 150)}...
        </p>

        <div className="flex items-center text-[10px] text-[#4A5568]">
          <Calendar className="size-3 mr-1" />
          {formatDate(song.createdAt)}
        </div>
      </Link>

      {/* Delete action */}
      <div className="px-5 py-2.5 border-t border-[rgba(212,175,55,0.05)] flex justify-end gap-2">
        {confirmDelete ? (
          <>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-[#8B9BB4] hover:text-[#E8E4DC] px-2 py-1"
            >
              Cancel
            </button>
            <button
              onClick={() => onDelete(song._id)}
              className="text-xs text-red-400 hover:text-red-300 px-2 py-1 font-medium"
            >
              Confirm Delete
            </button>
          </>
        ) : (
          <>
            <Link
              to={`/song/${song._id}`}
              className="p-1.5 rounded-md hover:bg-[rgba(212,175,55,0.08)] text-[#8B9BB4] hover:text-[#D4AF37] transition-colors"
            >
              <Edit3 className="size-3.5" />
            </Link>
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-md hover:bg-red-500/10 text-[#8B9BB4] hover:text-red-400 transition-colors"
            >
              <Trash2 className="size-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function LibraryPage() {
  const navigate = useNavigate();
  const songs = useQuery(api.songs.list, {}) || [];
  const deleteSong = useMutation(api.songs.remove);
  const [search, setSearch] = useState("");
  const [filterGenre, setFilterGenre] = useState<string | null>(null);

  const genres: string[] = Array.from(new Set(songs.map((s: { genre: string }) => s.genre))) as string[];

  const filtered = songs.filter((s: { genre: string; title: string; lyrics: string }) => {
    if (filterGenre && s.genre !== filterGenre) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.lyrics.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDelete = async (id: Id<"songs">) => {
    try {
      await deleteSong({ id });
      toast.success("Song deleted");
    } catch {
      toast.error("Failed to delete song");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8960F] flex items-center justify-center gold-glow-sm">
            <BookOpen className="size-5 text-[#070B14]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#FFF8E7]">My Library</h1>
            <p className="text-sm text-[#8B9BB4]">
              {songs.length} song{songs.length !== 1 ? "s" : ""} saved
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate("/studio")}
          className="bg-[#D4AF37] hover:bg-[#C9A82C] text-[#070B14] font-semibold"
        >
          <Plus className="size-4 mr-2" />
          New Song
        </Button>
      </div>

      {/* Search & Filter */}
      {songs.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search songs..."
              className="w-full h-10 pl-10 pr-4 bg-[#0D1524] border border-[rgba(212,175,55,0.1)] rounded-lg text-sm text-[#E8E4DC] placeholder:text-[#4A5568] focus:border-[#D4AF37]/30 transition-colors"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterGenre(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                !filterGenre
                  ? "bg-[#D4AF37] text-[#070B14]"
                  : "bg-[#1A2540] text-[#8B9BB4] hover:text-[#E5C158]"
              }`}
            >
              All
            </button>
            {genres.map((g: string) => (
              <button
                key={g}
                onClick={() =>
                  setFilterGenre(filterGenre === g ? null : g)
                }
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  filterGenre === g
                    ? "bg-[#D4AF37] text-[#070B14]"
                    : "bg-[#1A2540] text-[#8B9BB4] hover:text-[#E5C158]"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Song Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((song: any) => (
            <SongCard key={song._id} song={song} onDelete={handleDelete} />
          ))}
        </div>
      ) : songs.length > 0 ? (
        <div className="text-center py-16">
          <Search className="size-8 text-[#D4AF37]/20 mx-auto mb-3" />
          <p className="text-[#8B9BB4]">No songs match your search</p>
        </div>
      ) : (
        <div className="text-center py-24">
          <div className="size-20 rounded-2xl bg-[rgba(212,175,55,0.06)] flex items-center justify-center mx-auto mb-5">
            <Crown className="size-10 text-[#D4AF37]/25" />
          </div>
          <h3 className="text-lg font-semibold text-[#FFF8E7] mb-2">
            Your library is empty
          </h3>
          <p className="text-[#8B9BB4] mb-6 max-w-sm mx-auto">
            Head to the AI Lyrics Studio to create your first song
          </p>
          <Button
            onClick={() => navigate("/studio")}
            className="bg-[#D4AF37] hover:bg-[#C9A82C] text-[#070B14] font-semibold"
          >
            <Plus className="size-4 mr-2" />
            Create Your First Song
          </Button>
        </div>
      )}
    </div>
  );
}
