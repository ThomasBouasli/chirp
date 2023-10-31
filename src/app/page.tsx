"use client";

import { useUser } from "@clerk/nextjs";
import { api } from "~/trpc/react";
import { CreatePost } from "./_components/create-post";
import type { RouterOutputs } from "~/trpc/shared";
import Image from "next/image";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingPage } from "./_components/loading-spinner";
import { useMediaQuery } from "react-responsive";

dayjs.extend(relativeTime);

type PostWithAuthor = RouterOutputs["post"]["getAll"][number];

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
  const { data, isLoading: postsLoading } = api.post.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong...</div>;

  return (
    <div className="flex flex-col gap-2 p-4">
      {data?.map(({ author, post }) => (
        <PostView key={post.id} author={author} post={post} />
      ))}
    </div>
  );
};

export default function Home() {
  api.post.getAll.useQuery(); // prefetch
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return <div />;

  return (
    <main className="flex min-h-screen justify-center">
      <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
        <div className="flex h-20 border-b border-slate-400 px-4 py-2">
          {isSignedIn && <CreatePost />}
        </div>
        <Feed />
      </div>
    </main>
  );
}
