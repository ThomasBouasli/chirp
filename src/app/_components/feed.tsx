"use client";

import { useEffect } from "react";
import { LoadingPage } from "./loading-spinner";
import PostView from "./post";
import { api } from "~/trpc/react";

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

export default Feed;
