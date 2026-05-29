import { useQuery } from "convex/react";
import {
  ArrowRight,
  BookOpen,
  Crown,
  Disc3,
  FileText,
  Music2,
  PenLine,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../convex/_generated/api";

export function DashboardPage() {
  const stats = useQuery(api.songs.stats) || {
    total: 0,
    drafts: 0,
    complete: 0,
  };
  const recentSongs = useQuery(api.songs.list, {}) || [];

  const quickActions = [
    {
      icon: Wand2,
      title: "AI Lyrics Studio",
      desc: "Generate lyrics with AI",
      href: "/studio",
      accent: true,
    },
    {
      icon: Disc3,
      title: "Browse Beats",
      desc: "Preview beat presets",
      href: "/beats",
      accent: false,
    },
    {
      icon: BookOpen,
      title: "My Library",
      desc: `${stats.total} song${stats.total !== 1 ? "s" : ""} saved`,
      href: "/library",
      accent: false,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="size-12 rounded-xl bg-gradient-to-br from-[#D4AF37] via-[#E5C158] to-[#B8960F] flex items-center justify-center"
            style={{
              boxShadow: "0 0 30px rgba(212,175,55,0.2)",
            }}
          >
            <Crown className="size-6 text-[#070B14]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#FFF8E7]">
              Welcome to Centillion Music
            </h1>
            <p className="text-sm text-[#8B9BB4]">
              Create, build, and own your music
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            to={action.href}
            className={`group rounded-xl border p-5 transition-all duration-300 gold-border-hover ${
              action.accent
                ? "bg-gradient-to-br from-[#D4AF37]/10 to-[#0D1524] border-[#D4AF37]/25 hover:border-[#D4AF37]/50"
                : "bg-[#0D1524] border-[rgba(212,175,55,0.08)] hover:border-[rgba(212,175,55,0.2)]"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`size-10 rounded-lg flex items-center justify-center ${
                  action.accent
                    ? "bg-[#D4AF37] text-[#070B14]"
                    : "bg-[rgba(212,175,55,0.1)] text-[#D4AF37]"
                }`}
              >
                <action.icon className="size-5" />
              </div>
              <ArrowRight className="size-4 text-[#4A5568] group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
            </div>
            <h3
              className={`font-semibold mb-0.5 ${
                action.accent ? "text-[#E5C158]" : "text-[#FFF8E7]"
              }`}
            >
              {action.title}
            </h3>
            <p className="text-sm text-[#8B9BB4]">{action.desc}</p>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            icon: Music2,
            label: "Total Songs",
            value: stats.total,
          },
          {
            icon: PenLine,
            label: "Drafts",
            value: stats.drafts,
          },
          {
            icon: Sparkles,
            label: "Complete",
            value: stats.complete,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-[#0D1524] border border-[rgba(212,175,55,0.08)] p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="size-4 text-[#D4AF37]" />
              <span className="text-xs text-[#8B9BB4] font-medium">
                {stat.label}
              </span>
            </div>
            <p className="text-2xl font-bold gold-text">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Songs */}
      <div className="rounded-xl bg-[#0D1524] border border-[rgba(212,175,55,0.08)]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(212,175,55,0.06)]">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-[#D4AF37]" />
            <span className="text-sm font-semibold text-[#FFF8E7]">
              Recent Songs
            </span>
          </div>
          {recentSongs.length > 0 && (
            <Link
              to="/library"
              className="text-xs text-[#D4AF37] hover:underline"
            >
              View all →
            </Link>
          )}
        </div>

        {recentSongs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="size-14 rounded-2xl bg-[rgba(212,175,55,0.06)] flex items-center justify-center mx-auto mb-4">
              <Music2 className="size-7 text-[#D4AF37]/25" />
            </div>
            <p className="text-[#8B9BB4] mb-1">No songs yet</p>
            <p className="text-xs text-[#4A5568]">
              Create your first song in the{" "}
              <Link to="/studio" className="text-[#D4AF37] hover:underline">
                AI Lyrics Studio
              </Link>
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[rgba(212,175,55,0.04)]">
            {recentSongs.slice(0, 5).map((song: any) => (
              <Link
                key={song._id}
                to={`/song/${song._id}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-[rgba(212,175,55,0.03)] transition-colors group"
              >
                <div className="size-9 rounded-lg bg-[rgba(212,175,55,0.06)] flex items-center justify-center shrink-0">
                  <Music2 className="size-4 text-[#D4AF37]/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#E8E4DC] truncate group-hover:text-[#E5C158] transition-colors">
                    {song.title}
                  </p>
                  <p className="text-xs text-[#4A5568] truncate">
                    {song.genre}
                    {song.mood ? ` · ${song.mood}` : ""}
                  </p>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    song.status === "complete"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-[rgba(212,175,55,0.08)] text-[#D4AF37]"
                  }`}
                >
                  {song.status === "complete" ? "Complete" : "Draft"}
                </span>
                <ArrowRight className="size-4 text-[#4A5568] group-hover:text-[#D4AF37] transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
