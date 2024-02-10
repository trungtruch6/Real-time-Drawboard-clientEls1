import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

const images = [
  "/placeholders/1.svg",
  "/placeholders/2.svg",
  "/placeholders/3.svg",
  "/placeholders/4.svg",
  "/placeholders/5.svg",
  "/placeholders/6.svg",
  "/placeholders/7.svg",
  "/placeholders/8.svg",
  "/placeholders/9.svg",
  "/placeholders/10.svg",
];

export const create = mutation({
  args: {
    orgId: v.string(),
    title: v.string(),
  },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const randomImage = images[Math.floor(Math.random() * images.length)];

    console.log(randomImage, "TEST");

    const board = await context.db.insert("boards", {
      title: args.title,
      orgId: args.orgId,
      authorId: identity.subject,
      authorName: identity.name!,
      imageUrl: randomImage,
    });

    return board;
  },
});

export const remove = mutation({
  args: {
    id: v.id("boards"),
  },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.subject;

    const existingFavorites = await context.db
      .query("userFavorites")
      .withIndex("by_user_board", (q) =>
        q.eq("userId", userId).eq("boardId", args.id)
      )
      .unique();

    if (existingFavorites) {
      await context.db.delete(existingFavorites._id);
    }

    await context.db.delete(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("boards"),
    title: v.string(),
  },
  handler: async (context, args) => {
    const title = args.title.trim();
    const identity = await context.auth.getUserIdentity();

    if (!title) {
      throw new Error("Title id required");
    }

    if (title?.length > 60) {
      throw new Error("Title cannot be longer than 60 characters");
    }

    if (!identity) {
      throw new Error("Unauthorized");
    }

    //TODO: Check to delete favorite from relation as well

    const board = await context.db.patch(args.id, { title: args.title });

    return board;
  },
});

export const favorites = mutation({
  args: { id: v.id("boards"), orgId: v.string() },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();

    if (!identity) throw new Error("Unauthorized");

    const board = await context.db.get(args.id);
    if (!board) throw new Error("Board not found");

    const userId = identity.subject;

    const existingFavorites = await context.db
      .query("userFavorites")
      .withIndex("by_user_board", (q) =>
        q.eq("userId", userId).eq("boardId", board._id)
      )
      .unique();

    if (existingFavorites) throw new Error("Board already favorited");

    await context.db.insert("userFavorites", {
      userId,
      boardId: board._id,
      orgId: args.orgId,
    });
    return board;
  },
});
export const unfavorite = mutation({
  args: { id: v.id("boards") },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();

    if (!identity) throw new Error("Unauthorized");

    const board = await context.db.get(args.id);

    if (!board) throw new Error("Board not found");

    const userId = identity.subject;

    const existingFavorites = await context.db
      .query("userFavorites")
      .withIndex("by_user_board", (q) =>
        q.eq("userId", userId).eq("boardId", board._id)
      )
      .unique();

    if (!existingFavorites) throw new Error("Favorited board not found!");

    await context.db.delete(existingFavorites._id);
    return board;
  },
});

export const get = query({
  args: { id: v.id("boards") },
  handler: async (context, args) => {
    const board = context.db.get(args.id);

    return board;
  },
});
