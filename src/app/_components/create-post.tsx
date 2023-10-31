"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useState } from "react";
import { api } from "~/trpc/react";

export function CreatePost() {
  const { user } = useUser();

  const [input, setInput] = useState("");

  if (!user) return null;

  const { post } = api.useUtils();

  const { mutate } = api.post.create.useMutation({
    onSuccess: () => {
      void post.getAll.invalidate();
    },
  });

  return (
    <div className="flex w-full gap-4">
      <Image
        src={user.imageUrl}
        alt="Profile Image"
        height={56}
        width={56}
        className="rounded-full"
      />
      <input
        placeholder="What's on your mind?"
        className="w-full grow bg-transparent outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        onClick={() => {
          mutate(input);
          setInput("");
        }}
      >
        Post
      </button>
    </div>
  );
}
