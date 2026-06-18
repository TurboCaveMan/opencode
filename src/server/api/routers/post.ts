import { z } from "zod";
import { eq, desc } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { posts } from "~/server/db/schema";

export const postRouter = createTRPCRouter({
  // Create a new post linked to the authenticated user's Clerk ID
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        content: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(posts).values({
        title: input.title,
        content: input.content ?? null,
        userId: ctx.session.userId,
      });
    }),

  // Get the single latest post created by the authenticated user
  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const latestPost = await ctx.db.query.posts.findFirst({
      where: eq(posts.userId, ctx.session.userId),
      orderBy: [desc(posts.createdAt)],
    });

    return latestPost ?? null;
  }),

  // List all posts created by the authenticated user
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.posts.findMany({
      where: eq(posts.userId, ctx.session.userId),
      orderBy: [desc(posts.createdAt)],
    });
  }),
});
