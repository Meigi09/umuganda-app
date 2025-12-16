/**
 * PostCard Component
 * Displays a single post with content, images, and engagement metrics
 */

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import clsx from "clsx";

interface PostCardProps {
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
  reactions?: any[];
  comments?: any[];
  reposts?: any[];
  createdAt: string;
  onReact?: (type: string) => void;
  onComment?: () => void;
  onRepost?: () => void;
}

export function PostCard({
  id,
  content,
  author,
  cell,
  category,
  images,
  reactions = [],
  comments = [],
  reposts = [],
  createdAt,
  onReact,
  onComment,
  onRepost,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const likeCount = reactions.filter((r) => r.type === "LIKE").length;

  const handleLike = () => {
    setIsLiked(!isLiked);
    onReact?.("LIKE");
  };

  return (
    <article
      className={clsx(
        "border border-gray-200 rounded-lg p-4 mb-4",
        "bg-white shadow-sm hover:shadow-md transition-shadow"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{author.name}</h3>
          <p className="text-sm text-gray-500">
            {cell.name} •{" "}
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </p>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-lime-100 text-lime-800">
          {category}
        </span>
      </div>

      {/* Content */}
      <p className="text-gray-700 mb-3 leading-relaxed">{content}</p>

      {/* Images */}
      {images && images.length > 0 && (
        <div
          className={clsx(
            "mb-4 grid gap-2",
            images.length === 1 ? "grid-cols-1" : "grid-cols-2"
          )}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
            >
              <Image
                src={image.url}
                alt={image.caption || `Post image ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Engagement Stats */}
      <div className="flex gap-4 text-sm text-gray-600 py-2 border-y border-gray-100 mb-3">
        <button
          onClick={handleLike}
          className={clsx(
            "hover:text-lime-moss transition-colors flex items-center gap-1",
            isLiked && "text-lime-moss font-medium"
          )}
        >
          <span>❤️</span>
          <span>{likeCount}</span>
        </button>
        <button
          onClick={onComment}
          className="hover:text-blue-600 transition-colors flex items-center gap-1"
        >
          <span>💬</span>
          <span>{comments.length}</span>
        </button>
        <button
          onClick={onRepost}
          className="hover:text-green-600 transition-colors flex items-center gap-1"
        >
          <span>🔄</span>
          <span>{reposts.length}</span>
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleLike}
          className={clsx(
            "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
            isLiked
              ? "bg-lime-100 text-lime-800 hover:bg-lime-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {isLiked ? "Unlike" : "Like"}
        </button>
        <button
          onClick={onComment}
          className="flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Comment
        </button>
        <button
          onClick={onRepost}
          className="flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Share
        </button>
      </div>
    </article>
  );
}
