import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { genre: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (args.genre) {
      const tracks = await ctx.db.query("tracks").withIndex("by_genre", (q) => q.eq("genre", args.genre!)).take(50);
      if (!userId) return tracks.map(t => ({ ...t, isLiked: false }));
      const enriched = await Promise.all(tracks.map(async (t) => {
        const liked = await ctx.db.query("likedTracks").withIndex("by_user_track", (q) => q.eq("userId", userId).eq("trackId", t._id)).first();
        return { ...t, isLiked: !!liked };
      }));
      return enriched;
    }
    const tracks = await ctx.db.query("tracks").order("desc").take(50);
    if (!userId) return tracks.map(t => ({ ...t, isLiked: false }));
    const enriched = await Promise.all(tracks.map(async (t) => {
      const liked = await ctx.db.query("likedTracks").withIndex("by_user_track", (q) => q.eq("userId", userId).eq("trackId", t._id)).first();
      return { ...t, isLiked: !!liked };
    }));
    return enriched;
  },
});

export const trending = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tracks").withIndex("by_plays").order("desc").take(10);
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db.query("tracks").first();
    if (existing) return "Already seeded";
    const genres = ["Hip-Hop", "R&B", "Pop", "Electronic", "Lo-Fi", "Jazz", "Afrobeats", "Soul"];
    const artists = ["AI Luna", "SynthWave", "Neural Beats", "DeepFlow", "PixelDream", "ByteRhythm", "CloudNine", "VoxAI"];
    const titles = [
      "Midnight Protocol", "Digital Dreams", "Neon Nights", "Cloud Walker", "Binary Sunset",
      "Electric Soul", "Quantum Groove", "Pixel Rain", "Neural Fire", "Data Stream",
      "Cosmic Drift", "Machine Heart", "Synth Horizon", "AI Love Song", "Virtual Paradise",
      "Chrome Feelings", "Deep Learning Blues", "Algorithm Dance", "Byte Me", "Future Nostalgia",
    ];
    for (let i = 0; i < 20; i++) {
      await ctx.db.insert("tracks", {
        title: titles[i],
        artist: artists[i % artists.length],
        album: `Vol. ${Math.floor(i / 4) + 1}`,
        genre: genres[i % genres.length],
        duration: 180 + Math.floor(Math.random() * 120),
        plays: Math.floor(1000 + Math.random() * 500000),
        isAIGenerated: true,
        createdAt: Date.now() - Math.floor(Math.random() * 30 * 86400000),
      });
    }
    return "Seeded 20 tracks";
  },
});

export const like = mutation({
  args: { trackId: v.id("tracks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db.query("likedTracks").withIndex("by_user_track", (q) => q.eq("userId", userId).eq("trackId", args.trackId)).first();
    if (existing) {
      await ctx.db.delete(existing._id);
    } else {
      await ctx.db.insert("likedTracks", { userId, trackId: args.trackId, createdAt: Date.now() });
    }
  },
});

export const genres = query({
  args: {},
  handler: async () => {
    return [
      { name: "Hip-Hop", emoji: "🎤" }, { name: "R&B", emoji: "🎵" },
      { name: "Pop", emoji: "🎶" }, { name: "Electronic", emoji: "🎧" },
      { name: "Lo-Fi", emoji: "🌙" }, { name: "Jazz", emoji: "🎷" },
      { name: "Afrobeats", emoji: "🥁" }, { name: "Soul", emoji: "💫" },
    ];
  },
});
