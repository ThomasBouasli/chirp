"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { Tooltip, TooltipProvider } from "@radix-ui/react-tooltip";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import { TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { api } from "~/trpc/react";

export function CreatePost({ parentId }: { parentId?: string }) {
  const { user } = useUser();
  const { openSignIn } = useClerk();

  const [error, setError] = useState("");
  const [content, setContent] = useState("");
  const [characters, setCharacters] = useState(0);

  const { post } = api.useUtils();

  const { mutate } = api.post.create.useMutation({
    onSuccess: () => {
      void post.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.formErrors?.[0] ?? e.message;
      toast.error(errorMessage ?? "Something went wrong");
    },
    useErrorBoundary: false,
  });

  if (!user)
    return (
      <div className="flex grow items-center justify-center">
        <span>
          Please,&nbsp;
          <span
            className="cursor-pointer select-none font-bold"
            onClick={() => openSignIn()}
          >
            sign in
          </span>
          &nbsp;to post
        </span>
      </div>
    );

  return (
    <div className="flex w-full gap-4">
      <div className="flex-shrink-0">
        <Image
          src={user.imageUrl}
          alt="Profile Image"
          height={40}
          width={40}
          className="rounded-full"
        />
      </div>
      <div className="flex w-full grow flex-col">
        <textarea
          placeholder={
            parentId ? "Reply to this post..." : "What's on your mind?"
          }
          className="grow resize-none overflow-hidden bg-transparent outline-none"
          value={content}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (content.length > 0) {
                mutate({ content, parentId });
                setContent("");
                setCharacters(0);
              }
            }
          }}
          onChange={(e) => {
            if (e.target.value.length > 0) {
              try {
                z.string()
                  .emoji("Posts can only contain emojis 🤷‍♂️")
                  .min(1, "Don't be shy 😳! Say something 💬! ")
                  .max(
                    255,
                    "Calm down there, Buckaroo 🤠. That's a bit too much 😅",
                  )
                  .parse(e.target.value);
              } catch (e) {
                if (e instanceof z.ZodError) {
                  setError(e?.errors?.[0]?.message ?? "Something went wrong");
                  return;
                }
                return;
              }
            }

            setError("");
            setContent(e.target.value);
            setCharacters(e.target.value.length);

            //gambiarra monstra
            //nao sei porque mas no primeiro caractere, o scrollHeight vai para 40px
            //antes e depois disso ele eh 24px * linhas
            if (e.target.value.length != 2) {
              e.target.style.height = "24px";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }
          }}
        />
        {characters > 0 && (
          <div className="flex items-center justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="text-xs text-slate-300">{characters}</span>/
                  <span className="rounded bg-slate-200 text-xs text-zinc-800">
                    255
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <span>
                    Yes, emojis use more than 1 character! Brought to you by
                    unicode.
                  </span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        {error && (
          <div className="text-sm font-light text-red-500">{error}</div>
        )}
      </div>
      <PostButton
        show={content.length > 0}
        onClick={() => {
          mutate({ content, parentId });
          setContent("");
          setCharacters(0);
        }}
      />
    </div>
  );
}

type PostButtonProps = Pick<
  React.HtmlHTMLAttributes<HTMLButtonElement>,
  "onClick"
> & {
  show: boolean;
};

const PostButton = ({ onClick, show }: PostButtonProps) => {
  const buttonReference = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!buttonReference.current) return;

    const hasPopIn = buttonReference.current.classList.contains("pop_in");
    const hasPopOut = buttonReference.current.classList.contains("pop_out");

    // On first render, the button was popping in and out so this fixes that
    // Granted it is a pretty hacky fix
    // But... at the end of the day, it works
    if (show) {
      if (hasPopOut) {
        buttonReference.current?.classList.add("pop_in");
        buttonReference.current?.classList.remove("pop_out");
      }
      {
        buttonReference.current?.classList.add("pop_in");
      }
    } else {
      if (hasPopIn) {
        buttonReference.current?.classList.remove("pop_in");
        buttonReference.current?.classList.add("pop_out");
      }
    }
  }, [show]);

  return (
    <button
      ref={buttonReference}
      className="h-fit rounded-md bg-blue-500 px-4 py-2 text-white opacity-0 hover:bg-blue-600"
      onClick={onClick}
      type="button"
    >
      Post
    </button>
  );
};
