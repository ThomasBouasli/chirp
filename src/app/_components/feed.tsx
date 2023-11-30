"use client";

import { useEffect } from "react";
import { LoadingPage } from "./loading-spinner";
import PostView from "./post";
import { api } from "~/trpc/react";

const Feed = ({ parentId }: { parentId?: string }) => {
  const infiniteQuery = api.post.getAll.useInfiniteQuery(
    {
      limit: 10,
      parent_id: parentId,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextOffset
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

  if (postsLoading && parentId) return null;

  if (postsLoading && !parentId) return <LoadingPage />;

  if (!data) return <div>Something went wrong...</div>;

  return (
    <>
      {data.pages.map((page) => {
        return page.posts.map(({ author, post }) => {
          return (
            <PostView
              key={post.id}
              author={author}
              post={post}
              disableComments={!!parentId}
            />
          );
        });
      })}
      <div id="feed-bottom" />
    </>
  );
};

export default Feed;
