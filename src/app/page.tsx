"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { CreatePost } from "./_components/create-post";

import { useMediaQuery } from "react-responsive";
import { dark } from "@clerk/themes";
import Feed from "./_components/feed";
import Image from "next/image";

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
          <div className="flex items-center">
            <Image src="/logo.svg" alt="Chirp Logo" width={64} height={64} />
            <span className="text-2xl font-bold">Chirp</span>
          </div>
          <UserButton
            appearance={{ baseTheme: dark }}
            showName={!isMobile}
            afterSignOutUrl="/"
          />
        </header>
        <div className="flex h-fit border-b border-zinc-700 p-4">
          <CreatePost />
        </div>
        <Feed />
      </div>
    </main>
  );
}
