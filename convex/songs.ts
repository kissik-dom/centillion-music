import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    if (args.status) {
      return await ctx.db
        .query("songs")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", userId).eq("status", args.status!)
        )
        .order("desc")
        .take(100);
    }
    return await ctx.db
      .query("songs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100);
  },
});

export const get = query({
  args: { id: v.id("songs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const song = await ctx.db.get(args.id);
    if (!song || song.userId !== userId) return null;
    return song;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    lyrics: v.string(),
    genre: v.string(),
    mood: v.optional(v.string()),
    style: v.optional(v.string()),
    beatPreset: v.optional(v.string()),
    beatBpm: v.optional(v.number()),
    topic: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const now = Date.now();
    return await ctx.db.insert("songs", {
      userId,
      title: args.title,
      lyrics: args.lyrics,
      genre: args.genre,
      mood: args.mood,
      style: args.style,
      beatPreset: args.beatPreset,
      beatBpm: args.beatBpm,
      topic: args.topic,
      status: args.status || "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("songs"),
    title: v.optional(v.string()),
    lyrics: v.optional(v.string()),
    genre: v.optional(v.string()),
    mood: v.optional(v.string()),
    style: v.optional(v.string()),
    beatPreset: v.optional(v.string()),
    beatBpm: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const song = await ctx.db.get(args.id);
    if (!song || song.userId !== userId) throw new Error("Song not found");
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, { ...filtered, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("songs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const song = await ctx.db.get(args.id);
    if (!song || song.userId !== userId) throw new Error("Song not found");
    await ctx.db.delete(args.id);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { total: 0, drafts: 0, complete: 0 };
    const all = await ctx.db
      .query("songs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return {
      total: all.length,
      drafts: all.filter((s) => s.status === "draft").length,
      complete: all.filter((s) => s.status === "complete").length,
    };
  },
});
