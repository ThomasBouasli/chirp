"use client";

import { useUser } from "@clerk/nextjs";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import Image from "next/image";
import toast from "react-hot-toast";
import { useMediaQuery } from "react-responsive";
import { api } from "~/trpc/react";
import type { RouterOutputs } from "~/trpc/shared";
import { MoreVertical, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

dayjs.extend(relativeTime);

type PostWithAuthor = RouterOutputs["post"]["getAll"]["posts"][number];

const PostView = ({ author, post }: PostWithAuthor) => {
  const apiUtils = api.useUtils();
  const { isSignedIn, user } = useUser();

  const { mutate: deleteMutate } = api.post.delete.useMutation({
    onSuccess: () => {
      void apiUtils.post.getAll.invalidate();
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  const isMobile = useMediaQuery({
    query: "(max-width: 640px)",
  });

  return (
    <div className="pop_in flex justify-between gap-2 rounded-md p-2 shadow shadow-black">
      <div className="flex gap-2">
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
            <span className="text-xs">
              {dayjs(post.createdAt).fromNow(isMobile)}
            </span>
          </div>
          <span>{post.content}</span>
        </div>
      </div>
      {isSignedIn && user.id == author.id && (
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <MoreVertical
                className="flex-shrink-0 cursor-pointer"
                size={20}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => deleteMutate(post.id)}>
                <Trash className="mr-2 flex-shrink-0" size={16} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};

export default PostView;
