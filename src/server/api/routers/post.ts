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

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});
const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user?.username ?? `${user?.firstName ?? "Anon"} ${user.lastName}`,
    imageUrl: user.imageUrl,
  };
};

export const postRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(30).nullish(),
          cursor: z.string().nullish(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 30;
      const cursor = input?.cursor;

      const posts = await ctx.db.post.findMany({
        take: limit + 1,
        orderBy: { createdAt: "desc" },
        cursor: cursor ? { id: cursor } : undefined,
      });

      let nextCursor: typeof cursor | undefined = undefined;

      if (posts.length > limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem!.id;
      }

      const users = (
        await clerkClient.users.getUserList({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- typescript is being naughty
          userId: posts.map((post) => post.authorId),
          limit: 100,
        })
      ).map(filterUserForClient);

      const joined = posts.map((post) => {
        const author = users.find((user) => user.id === post.authorId);

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
      z
        .string()
        .emoji("Posts can only contain emojis 🤷‍♂️")
        .min(1, "Don't be shy 😳! Say something 💬! ")
        .max(255, "Calm down there, Buckaroo 🤠. That's a bit too much 😅"),
    )
    .mutation(async ({ ctx, input }) => {
      const { success } = await ratelimit.limit(ctx.userId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You are doing that too much",
        });
      }

      const post = await ctx.db.post.create({
        data: {
          authorId: ctx.userId,
          content: input,
        },
      });

      return post;
    }),
});
