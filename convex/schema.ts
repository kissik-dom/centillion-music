import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  tracks: defineTable({
    title: v.string(),
    artist: v.string(),
    album: v.optional(v.string()),
    genre: v.string(),
    duration: v.number(),
    coverUrl: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    plays: v.number(),
    isAIGenerated: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_genre", ["genre"])
    .index("by_plays", ["plays"]),
  playlists: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.string(),
    trackIds: v.array(v.id("tracks")),
    isPublic: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"]),
  likedTracks: defineTable({
    userId: v.id("users"),
    trackId: v.id("tracks"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_track", ["userId", "trackId"]),
});

export default schema;
