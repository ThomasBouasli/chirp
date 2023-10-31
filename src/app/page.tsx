"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { api } from "~/trpc/react";
import { CreatePost } from "./_components/create-post";
import type { RouterOutputs } from "~/trpc/shared";
import Image from "next/image";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type PostWithAuthor = RouterOutputs["post"]["getAll"][number];

const PostView = ({ author, post }: PostWithAuthor) => {
  return (
    <div className="flex gap-4 rounded-md p-4 shadow shadow-black">
      <Image
        src={author.profileImageUrl}
        alt="Profile Image"
        height={56}
        width={56}
        className="rounded-full"
      />
      <div className="flex flex-col gap-2">
        <div className="flex text-slate-300">
          <span className="">{`@${author.username}`}</span>
          &nbsp;·&nbsp;
          <span className="font-thin">{dayjs(post.createdAt).fromNow()}</span>
        </div>
        <span>{post.content}</span>
      </div>
    </div>
  );
};

export default function Home() {
  const user = useUser();

  const { data, isLoading } = api.post.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;

  if (!data) return <div>Something went wrong...</div>;

  return (
    <main className="flex h-screen justify-center">
      <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
        <div className="flex justify-end border-b border-slate-400 p-4">
          <UserButton afterSignOutUrl="/" />
        </div>
        <div className="flex flex-col">
          {user.isSignedIn && <CreatePost />}
          {data?.map(({ author, post }) => (
            <PostView key={post.id} author={author} post={post} />
          ))}
        </div>
      </div>
    </main>
  );
}
