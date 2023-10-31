"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { api } from "~/trpc/react";
import { CreatePost } from "./_components/create-post";
import type { RouterOutputs } from "~/trpc/shared";
import Image from "next/image";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingPage } from "./_components/loading-spinner";
import { useMediaQuery } from "react-responsive";
import { useEffect } from "react";
import { dark } from "@clerk/themes";
import { Bug } from "lucide-react";

dayjs.extend(relativeTime);

type PostWithAuthor = RouterOutputs["post"]["getAll"]["posts"][number];

const PostView = ({ author, post }: PostWithAuthor) => {
  const isMobile = useMediaQuery({
    query: "(max-width: 640px)",
  });

  return (
    <div className="pop_in flex gap-2 rounded-md p-2 shadow shadow-black">
      <div className="flex-shrink-0">
        <Image
          src={author.imageUrl}
          alt="Profile Image"
          height={40}
          width={40}
          className="rounded-full"
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center text-slate-300">
          <span className="text-sm">{`@${author.username}`}</span>
          &nbsp;·&nbsp;
          <span className="text-xs font-thin">
            {dayjs(post.createdAt).fromNow(isMobile)}
          </span>
        </div>
        <span>{post.content}</span>
      </div>
    </div>
  );
};

const Feed = () => {
  const infiniteQuery = api.post.getAll.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const { data, isLoading: postsLoading } = infiniteQuery;

  useEffect(() => {
    const observer: IntersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries?.[0]?.isIntersecting) {
          void infiniteQuery.fetchNextPage();
        }
      },
    );

    const bottomElement = document.getElementById("feed-bottom");

    if (bottomElement) {
      observer.observe(bottomElement);
    }

    return () => {
      observer.disconnect();
    };
  }, [infiniteQuery]);

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong...</div>;

  return (
    <div className="flex grow flex-col gap-4 p-4">
      {data.pages.map((page) => {
        return page.posts.map(({ author, post }) => {
          return <PostView key={post.id} author={author} post={post} />;
        });
      })}
      <div id="feed-bottom" />
    </div>
  );
};

export default function Home() {
  const { isLoaded } = useUser();
  const isMobile = useMediaQuery({
    query: "(max-width: 640px)",
  });

  if (!isLoaded) return <div />;

  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex h-full w-full grow flex-col border-x border-zinc-700 md:max-w-2xl">
        <header className="flex h-20 items-center justify-between border-b border-zinc-700 p-4">
          <span className="text-2xl font-bold">Chirp</span>
          <UserButton appearance={{ baseTheme: dark }} showName={!isMobile} />
        </header>
        <div className="flex h-fit border-b border-zinc-700 p-4">
          <CreatePost />
        </div>
        <Feed />
      </div>
    </main>
  );
}
