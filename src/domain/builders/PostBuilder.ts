/**
 * CREATIONAL DESIGN PATTERN: Builder Pattern
 *
 * Purpose: Construct complex Post objects step by step.
 * This pattern allows flexible construction of posts with various
 * optional fields like content, location, media, metadata, etc.
 *
 * Benefits:
 * - Separates object construction from representation
 * - Provides a clear, fluent interface for building posts
 * - Supports optional fields elegantly
 * - Makes code more readable and maintainable
 */

import { ActivityCategory, PostStatus } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

/**
 * Image data interface
 */
interface Image {
  url: string;
  publicId?: string;
  caption?: string;
}

/**
 * Location data interface
 */
interface Location {
  cellId: string;
  sectorId: string;
  districtId: string;
}

/**
 * Post object being built
 */
export class Post {
  id: string;
  content: string;
  authorId: string;
  location: Location;
  category: ActivityCategory;
  status: PostStatus;
  hashtags: string[];
  images: Image[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
  };

  constructor(
    id: string,
    content: string,
    authorId: string,
    location: Location,
    category: ActivityCategory,
    status: PostStatus,
    hashtags: string[],
    images: Image[],
    metadata: { createdAt: Date; updatedAt: Date }
  ) {
    this.id = id;
    this.content = content;
    this.authorId = authorId;
    this.location = location;
    this.category = category;
    this.status = status;
    this.hashtags = hashtags;
    this.images = images;
    this.metadata = metadata;
  }
}

/**
 * Post Builder
 * Implements the Builder pattern for step-by-step post construction
 */
export class PostBuilder {
  private id: string = uuidv4();
  private content: string = "";
  private authorId: string = "";
  private location: Location | null = null;
  private category: ActivityCategory | null = null;
  private status: PostStatus = PostStatus.PUBLISHED;
  private hashtags: string[] = [];
  private images: Image[] = [];
  private createdAt: Date = new Date();

  /**
   * Set the post ID
   */
  setId(id: string): this {
    this.id = id;
    return this;
  }

  /**
   * Set the post content
   */
  setContent(content: string): this {
    if (!content || content.trim().length === 0) {
      throw new Error("Post content cannot be empty");
    }

    if (content.length > 5000) {
      throw new Error("Post content exceeds maximum length (5000 characters)");
    }

    this.content = content.trim();
    return this;
  }

  /**
   * Set the author ID
   */
  setAuthorId(authorId: string): this {
    if (!authorId) {
      throw new Error("Author ID is required");
    }

    this.authorId = authorId;
    return this;
  }

  /**
   * Set the post location (Cell, Sector, District)
   */
  setLocation(cellId: string, sectorId: string, districtId: string): this {
    if (!cellId || !sectorId || !districtId) {
      throw new Error("Location must include cellId, sectorId, and districtId");
    }

    this.location = { cellId, sectorId, districtId };
    return this;
  }

  /**
   * Set the activity category
   */
  setCategory(category: ActivityCategory): this {
    if (!category) {
      throw new Error("Category is required");
    }

    this.category = category;
    return this;
  }

  /**
   * Set the post status (DRAFT, PUBLISHED, ARCHIVED)
   */
  setStatus(status: PostStatus): this {
    this.status = status;
    return this;
  }

  /**
   * Add a single hashtag
   */
  addHashtag(hashtag: string): this {
    const cleanedHashtag = hashtag.startsWith("#") ? hashtag : `#${hashtag}`;

    if (this.hashtags.includes(cleanedHashtag)) {
      return this; // Avoid duplicates
    }

    if (this.hashtags.length >= 10) {
      throw new Error("Maximum 10 hashtags allowed per post");
    }

    this.hashtags.push(cleanedHashtag);
    return this;
  }

  /**
   * Add multiple hashtags
   */
  addHashtags(hashtags: string[]): this {
    hashtags.forEach((tag) => this.addHashtag(tag));
    return this;
  }

  /**
   * Add an image to the post
   */
  addImage(url: string, publicId?: string, caption?: string): this {
    if (!url) {
      throw new Error("Image URL is required");
    }

    if (this.images.length >= 5) {
      throw new Error("Maximum 5 images allowed per post");
    }

    this.images.push({ url, publicId, caption });
    return this;
  }

  /**
   * Add multiple images
   */
  addImages(images: Image[]): this {
    if (this.images.length + images.length > 5) {
      throw new Error("Maximum 5 images allowed per post");
    }

    images.forEach((img) => {
      if (!img.url) {
        throw new Error("All images must have valid URLs");
      }
    });

    this.images.push(...images);
    return this;
  }

  /**
   * Set creation timestamp
   */
  setCreatedAt(date: Date): this {
    this.createdAt = date;
    return this;
  }

  /**
   * Validate the builder has all required fields
   */
  private validate(): void {
    if (!this.content) {
      throw new Error("Post content is required");
    }

    if (!this.authorId) {
      throw new Error("Author ID is required");
    }

    if (!this.location) {
      throw new Error("Post location is required");
    }

    if (!this.category) {
      throw new Error("Post category is required");
    }
  }

  /**
   * Build and return the Post object
   */
  build(): Post {
    this.validate();

    if (!this.location || !this.category) {
      throw new Error("Invalid post state");
    }

    return new Post(
      this.id,
      this.content,
      this.authorId,
      this.location,
      this.category,
      this.status,
      this.hashtags,
      this.images,
      {
        createdAt: this.createdAt,
        updatedAt: new Date(),
      }
    );
  }

  /**
   * Reset the builder to initial state
   */
  reset(): this {
    this.id = uuidv4();
    this.content = "";
    this.authorId = "";
    this.location = null;
    this.category = null;
    this.status = PostStatus.PUBLISHED;
    this.hashtags = [];
    this.images = [];
    this.createdAt = new Date();
    return this;
  }
}
