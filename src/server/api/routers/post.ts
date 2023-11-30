import { clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { db } from "~/server/db";
import { posts as posts_table } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});
const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username!,
    imageUrl: user.imageUrl,
  };
};

export const postRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(30).optional(),
          cursor: z.number().min(0).optional(),
          parent_id: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const limit = input?.limit ?? 30;
      const cursor = input?.cursor;
      const parent_id = input?.parent_id;

      const posts = await db.query.posts.findMany({
        limit: limit + 1,
        offset: cursor ?? 0,
        where: (posts_table, { eq }) => parent_id ? eq(posts_table.parent_id, parent_id) : undefined,
        orderBy: (posts_table) => posts_table.created_at,
        with: {
          children: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;

      if (posts.length > limit) {
        nextCursor = cursor ? cursor + limit : limit;
        posts.pop();
      }

      const users = (
        await clerkClient.users.getUserList({
          userId: posts.map((post) => post.author_id),
          limit: 100,
        })
      ).map(filterUserForClient);

      const joined = posts.map((post) => {
        const author = users.find((user) => user.id === post.author_id);

        if (!author?.username) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Author not found",
          });
        }

        return {
          post,
          author: {
            //because typescript is dumb
            ...author,
            username: author.username,
          },
        };
      });

      return {
        posts: joined,
        nextCursor,
      };
    }),
  create: privateProcedure
    .input(
      z.object({
        content: z
          .string()
          .emoji("Posts can only contain emojis 🤷‍♂️")
          .min(1, "Don't be shy 😳! Say something 💬! ")
          .max(255, "Calm down there, Buckaroo 🤠. That's a bit too much 😅"),
        parentId: z.string().nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { content, parentId } = input;

      const { success } = await ratelimit.limit(ctx.userId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You are doing that too much",
        });
      }

      const post = await db.insert(posts_table).values({
        id: randomUUID(),
        parent_id: parentId,
        author_id: ctx.userId,
        content,
        created_at: new Date(),
      });

      return post;
    }),

  delete: privateProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const post = await db.query.posts.findFirst({
        where: (posts_table, { eq }) => eq(posts_table.id, input),
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      if (post.author_id !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own posts",
        });
      }

      await db.transaction(async (trx) => {
        await trx.delete(posts_table).where(eq(posts_table.parent_id, input));

        await trx.delete(posts_table).where(eq(posts_table.id, input));
      });

      return true;
    }),
  edit: privateProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const post = await db.query.posts.findFirst({
        where: (posts_table, { eq }) => eq(posts_table.id, input.id),
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      if (post.author_id !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own posts",
        });
      }

      await db
        .update(posts_table)
        .set({
          content: input.content,
        })
        .where(eq(posts_table.id, input.id));

      return true;
    }),
});
