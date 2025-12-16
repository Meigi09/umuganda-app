/**
 * Feed Component
 * Displays a scrollable feed of posts with infinite loading capability
 */

"use client";

import React, { useEffect, useState } from "react";
import { PostCard } from "./PostCard";
import clsx from "clsx";

interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  cell: {
    name: string;
  };
  category: string;
  images?: Array<{
    url: string;
    caption?: string;
  }>;
  reactions: any[];
  comments: any[];
  reposts: any[];
  createdAt: string;
}

interface FeedProps {
  posts: Post[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  filters?: {
    cellId?: string;
    sectorId?: string;
    districtId?: string;
    category?: string;
  };
}

export function Feed({
  posts,
  isLoading = false,
  hasMore = true,
  onLoadMore,
  filters,
}: FeedProps) {
  const [displayPosts, setDisplayPosts] = useState(posts);

  useEffect(() => {
    setDisplayPosts(posts);
  }, [posts]);

  if (displayPosts.length === 0 && !isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <p className="text-gray-500 text-lg">
          No posts yet. Be the first to share your Umuganda work!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Filter Info */}
      {filters && Object.values(filters).some(Boolean) && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            Showing posts filtered by:{" "}
            {Object.entries(filters)
              .filter(([, value]) => value)
              .map(([key, value]) => `${key}: ${value}`)
              .join(", ")}
          </p>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {displayPosts.map((post) => (
          <PostCard
            key={post.id}
            {...post}
            onReact={(type) => {
              // Handle reaction
              console.log(`Reacted with ${type} to post ${post.id}`);
            }}
            onComment={() => {
              // Handle comment
              console.log(`Comment on post ${post.id}`);
            }}
            onRepost={() => {
              // Handle repost
              console.log(`Repost ${post.id}`);
            }}
          />
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-8 text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lime-moss"></div>
          </div>
          <p className="text-gray-500 mt-2">Loading more posts...</p>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !isLoading && displayPosts.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={onLoadMore}
            className={clsx(
              "px-6 py-3 rounded-lg font-medium transition-colors",
              "bg-lime-moss text-white hover:bg-green",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            disabled={isLoading}
          >
            Load More Posts
          </button>
        </div>
      )}

      {/* No More Posts */}
      {!hasMore && displayPosts.length > 0 && (
        <div className="py-8 text-center">
          <p className="text-gray-500">No more posts to load</p>
        </div>
      )}
    </div>
  );
}
