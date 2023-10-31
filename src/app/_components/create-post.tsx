"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";

export function CreatePost() {
  const { user } = useUser();

  console.log(user);

  if (!user) return null;

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
      />
    </div>
  );
}
