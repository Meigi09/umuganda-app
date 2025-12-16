/**
 * CREATIONAL DESIGN PATTERN: Factory Method
 *
 * Purpose: Create different types of posts (ImagePost, TextPost, Repost)
 * without exposing the creation logic to the client.
 *
 * Implementation follows the Factory Method pattern to ensure:
 * - Encapsulation of object creation
 * - Easy extension for new post types
 * - Consistent post creation across the application
 */

import { ActivityCategory, PostStatus } from "@prisma/client";

/**
 * Base interface for post creation arguments
 */
export interface IPostCreationArgs {
  content: string;
  authorId: string;
  cellId: string;
  sectorId: string;
  districtId: string;
  category: ActivityCategory;
  hashtags?: string[];
  status?: PostStatus;
}

/**
 * Image post specific arguments
 */
export interface IImagePostCreationArgs extends IPostCreationArgs {
  images: Array<{
    url: string;
    publicId?: string;
    caption?: string;
  }>;
}

/**
 * Repost specific arguments
 */
export interface IRepostCreationArgs {
  postId: string;
  authorId: string;
  caption?: string;
}

/**
 * Base Post type interface
 */
export interface IPost {
  id?: string;
  content: string;
  authorId: string;
  cellId: string;
  sectorId: string;
  districtId: string;
  category: ActivityCategory;
  status: PostStatus;
  hashtags: string[];
  createdAt?: Date;
}

/**
 * Image Post type
 */
export interface IImagePost extends IPost {
  images: Array<{
    url: string;
    publicId?: string;
    caption?: string;
  }>;
}

/**
 * Abstract Post Factory
 * Defines the interface for creating posts
 */
export abstract class PostFactory {
  abstract createPost(args: IPostCreationArgs): Promise<IPost>;
  abstract getPostType(): string;
}

/**
 * Concrete Factory: Text Post Factory
 * Creates simple text-based posts about Umuganda activities
 */
export class TextPostFactory extends PostFactory {
  async createPost(args: IPostCreationArgs): Promise<IPost> {
    // Validation
    if (!args.content.trim()) {
      throw new Error("Post content cannot be empty");
    }

    if (args.content.length > 5000) {
      throw new Error("Post content exceeds maximum length (5000 characters)");
    }

    return {
      content: args.content,
      authorId: args.authorId,
      cellId: args.cellId,
      sectorId: args.sectorId,
      districtId: args.districtId,
      category: args.category,
      status: args.status || PostStatus.PUBLISHED,
      hashtags: args.hashtags || [],
    };
  }

  getPostType(): string {
    return "TEXT_POST";
  }
}

/**
 * Concrete Factory: Image Post Factory
 * Creates posts with images about Umuganda activities
 */
export class ImagePostFactory extends PostFactory {
  private readonly MAX_IMAGES = 5;
  private readonly MIN_IMAGES = 1;

  async createPost(args: IImagePostCreationArgs): Promise<IImagePost> {
    // Validation
    if (!args.content.trim()) {
      throw new Error("Post content cannot be empty");
    }

    if (args.content.length > 5000) {
      throw new Error("Post content exceeds maximum length (5000 characters)");
    }

    if (!args.images || args.images.length === 0) {
      throw new Error(
        `Image post must have at least ${this.MIN_IMAGES} image(s)`
      );
    }

    if (args.images.length > this.MAX_IMAGES) {
      throw new Error(`Image post cannot exceed ${this.MAX_IMAGES} images`);
    }

    // Validate all images have URLs
    if (!args.images.every((img) => img.url)) {
      throw new Error("All images must have valid URLs");
    }

    return {
      content: args.content,
      authorId: args.authorId,
      cellId: args.cellId,
      sectorId: args.sectorId,
      districtId: args.districtId,
      category: args.category,
      status: args.status || PostStatus.PUBLISHED,
      hashtags: args.hashtags || [],
      images: args.images,
    };
  }

  getPostType(): string {
    return "IMAGE_POST";
  }
}

/**
 * Post Factory Creator
 * Responsible for selecting the appropriate factory based on post type
 */
export class PostFactoryCreator {
  private static factories: Map<string, PostFactory> = new Map([
    ["text", new TextPostFactory()],
    ["image", new ImagePostFactory()],
  ]);

  /**
   * Get the appropriate factory for the post type
   * @param postType - Type of post to create ('text' or 'image')
   * @returns The appropriate PostFactory instance
   */
  static getFactory(postType: "text" | "image"): PostFactory {
    const factory = this.factories.get(postType.toLowerCase());
    if (!factory) {
      throw new Error(`Unknown post type: ${postType}`);
    }
    return factory;
  }

  /**
   * Register a new post factory
   * @param postType - Unique identifier for the post type
   * @param factory - The factory instance
   */
  static registerFactory(postType: string, factory: PostFactory): void {
    this.factories.set(postType.toLowerCase(), factory);
  }
}
