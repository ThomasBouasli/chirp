"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import { api } from "~/trpc/react";

export function CreatePost() {
  const { user } = useUser();

  const [error, setError] = useState("");
  const [input, setInput] = useState("");

  if (!user) return null;

  const { post } = api.useUtils();

  const { mutate } = api.post.create.useMutation({
    onSuccess: () => {
      void post.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.formErrors?.[0] ?? e.message;

      console.log(e);

      toast.error(errorMessage ?? "Something went wrong");
    },
  });

  return (
    <div className="flex w-full gap-4">
      <UserButton appearance={{ baseTheme: dark }} />
      <div className="flex w-full grow flex-col">
        <textarea
          placeholder="What's on your mind?"
          className="grow resize-none bg-transparent outline-none"
          value={input}
          onChange={(e) => {
            if (e.target.value.length > 0) {
              try {
                z.string().emoji().parse(e.target.value);
              } catch (e) {
                setError("Please only use emojis");
                return;
              }
            }

            console.log("valid");
            setError("");
            setInput(e.target.value);
          }}
        />
        {error && (
          <div className="text-sm font-light text-red-500">{error}</div>
        )}
      </div>
      <PostButton
        show={input.length > 0}
        onClick={() => {
          mutate(input);
          setInput("");
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

    if (show) {
      buttonReference.current?.classList.add("pop_in");
      buttonReference.current?.classList.remove("pop_out");
    } else {
      buttonReference.current?.classList.remove("pop_in");
      buttonReference.current?.classList.add("pop_out");
    }
  }, [show]);

  return (
    <button
      ref={buttonReference}
      className="rounded-md bg-blue-500 px-4 py-2 text-white opacity-0 hover:bg-blue-600"
      onClick={onClick}
    >
      Post
    </button>
  );
};
