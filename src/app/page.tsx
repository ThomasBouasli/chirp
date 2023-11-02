"use client";

import { CreatePost } from "./_components/create-post";

import Feed from "./_components/feed";
import Image from "next/image";
import Footer from "./_components/footer";
import UserButton from "./_components/user-button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex h-full w-full grow flex-col border-x border-zinc-700 md:max-w-2xl">
        <header className="flex h-20 items-center justify-between border-b border-zinc-700 p-4">
          <div className="flex items-center gap-4">
            <Image src="/logo.svg" alt="Chirp Logo" width={70} height={70} />
            <h1 className="text-3xl font-bold">Chirp</h1>
          </div>
          <UserButton />
        </header>
        <div className="flex h-fit border-b border-zinc-700 p-4">
          <CreatePost />
        </div>
        <div className="flex grow flex-col gap-4 p-4">
          <Feed />
        </div>
        <Footer />
      </div>
    </main>
  );
}
