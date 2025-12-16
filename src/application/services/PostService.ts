/**
 * Post Service
 * Handles all post-related business logic using Factory and Builder patterns
 */

import { PrismaClient, ActivityCategory, PostStatus } from "@prisma/client";
import {
  PostFactoryCreator,
  IImagePostCreationArgs,
} from "@/domain/factories/PostFactory";
import { PostBuilder } from "@/domain/builders/PostBuilder";

export class PostService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a text post using the Factory and Builder patterns
   */
  async createTextPost(input: {
    content: string;
    authorId: string;
    cellId: string;
    sectorId: string;
    districtId: string;
    category: ActivityCategory;
    hashtags?: string[];
  }) {
    // Use Factory Method pattern to create appropriate post type
    const factory = PostFactoryCreator.getFactory("text");
    const textPost = await factory.createPost(input);

    // Use Builder pattern to construct the complete post object
    const builtPost = new PostBuilder()
      .setContent(textPost.content)
      .setAuthorId(textPost.authorId)
      .setLocation(textPost.cellId, textPost.sectorId, textPost.districtId)
      .setCategory(textPost.category)
      .setStatus(textPost.status);

    if (input.hashtags) {
      builtPost.addHashtags(input.hashtags);
    }

    const postObject = builtPost.build();

    // Save to database
    return await this.prisma.post.create({
      data: {
        content: postObject.content,
        authorId: postObject.authorId,
        cellId: postObject.location.cellId,
        sectorId: postObject.location.sectorId,
        districtId: postObject.location.districtId,
        category: postObject.category,
        status: postObject.status,
        hashtags: postObject.hashtags,
      },
      include: {
        author: true,
        cell: true,
        sector: true,
        district: true,
      },
    });
  }

  /**
   * Create an image post using the Factory and Builder patterns
   */
  async createImagePost(input: {
    content: string;
    authorId: string;
    cellId: string;
    sectorId: string;
    districtId: string;
    category: ActivityCategory;
    images: Array<{
      url: string;
      publicId?: string;
      caption?: string;
    }>;
    hashtags?: string[];
  }) {
    // Use Factory Method pattern to create appropriate post type
    const factory = PostFactoryCreator.getFactory("image");
    const imagePost = await factory.createPost(input as IImagePostCreationArgs);

    // Use Builder pattern to construct the complete post object
    const builtPost = new PostBuilder()
      .setContent(imagePost.content)
      .setAuthorId(imagePost.authorId)
      .setLocation(imagePost.cellId, imagePost.sectorId, imagePost.districtId)
      .setCategory(imagePost.category)
      .setStatus(imagePost.status)
      .addImages(imagePost.images);

    if (input.hashtags) {
      builtPost.addHashtags(input.hashtags);
    }

    const postObject = builtPost.build();

    // Save to database with images
    return await this.prisma.post.create({
      data: {
        content: postObject.content,
        authorId: postObject.authorId,
        cellId: postObject.location.cellId,
        sectorId: postObject.location.sectorId,
        districtId: postObject.location.districtId,
        category: postObject.category,
        status: postObject.status,
        hashtags: postObject.hashtags,
        images: {
          create: postObject.images,
        },
      },
      include: {
        author: true,
        cell: true,
        sector: true,
        district: true,
        images: true,
      },
    });
  }

  /**
   * Get feed with posts ordered by engagement and recency
   */
  async getFeed(
    limit: number = 20,
    skip: number = 0,
    filters?: {
      cellId?: string;
      sectorId?: string;
      districtId?: string;
      category?: ActivityCategory;
    }
  ) {
    return await this.prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
        ...(filters?.cellId && { cellId: filters.cellId }),
        ...(filters?.sectorId && { sectorId: filters.sectorId }),
        ...(filters?.districtId && { districtId: filters.districtId }),
        ...(filters?.category && { category: filters.category }),
      },
      include: {
        author: true,
        cell: true,
        sector: true,
        district: true,
        images: true,
        comments: { take: 3 },
        reactions: true,
        reposts: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip,
    });
  }

  /**
   * Get a specific post with all details
   */
  async getPost(postId: string) {
    return await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
        cell: true,
        sector: true,
        district: true,
        images: true,
        comments: {
          include: {
            author: true,
            reactions: true,
          },
        },
        reactions: true,
        reposts: {
          include: {
            author: true,
          },
        },
      },
    });
  }

  /**
   * Delete a post (only by author or admin)
   */
  async deletePost(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    if (post.authorId !== userId) {
      throw new Error("Unauthorized");
    }

    return await this.prisma.post.delete({
      where: { id: postId },
    });
  }

  /**
   * Get user's own posts
   */
  async getUserPosts(userId: string, limit: number = 20, skip: number = 0) {
    return await this.prisma.post.findMany({
      where: {
        authorId: userId,
      },
      include: {
        author: true,
        cell: true,
        sector: true,
        district: true,
        images: true,
        comments: true,
        reactions: true,
        reposts: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip,
    });
  }
}
