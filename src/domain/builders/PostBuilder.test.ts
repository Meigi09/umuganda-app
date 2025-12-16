/**
 * Unit Tests for Post Builder Pattern
 */

import { PostBuilder, Post } from "@/domain/builders/PostBuilder";
import { ActivityCategory, PostStatus } from "@prisma/client";

describe("PostBuilder - Builder Pattern", () => {
  describe("Basic Building", () => {
    it("should build a complete post successfully", () => {
      const post = new PostBuilder()
        .setContent("Clean the community")
        .setAuthorId("user-123")
        .setLocation("cell-123", "sector-123", "district-123")
        .setCategory(ActivityCategory.CLEANING)
        .build();

      expect(post).toBeInstanceOf(Post);
      expect(post.content).toBe("Clean the community");
      expect(post.authorId).toBe("user-123");
      expect(post.status).toBe(PostStatus.PUBLISHED);
    });

    it("should throw error if content is missing", () => {
      expect(() => {
        new PostBuilder()
          .setAuthorId("user-123")
          .setLocation("cell-123", "sector-123", "district-123")
          .setCategory(ActivityCategory.CLEANING)
          .build();
      }).toThrow("Post content is required");
    });

    it("should throw error if author is missing", () => {
      expect(() => {
        new PostBuilder()
          .setContent("Clean the community")
          .setLocation("cell-123", "sector-123", "district-123")
          .setCategory(ActivityCategory.CLEANING)
          .build();
      }).toThrow("Author ID is required");
    });

    it("should throw error if location is missing", () => {
      expect(() => {
        new PostBuilder()
          .setContent("Clean the community")
          .setAuthorId("user-123")
          .setCategory(ActivityCategory.CLEANING)
          .build();
      }).toThrow("Post location is required");
    });

    it("should throw error if category is missing", () => {
      expect(() => {
        new PostBuilder()
          .setContent("Clean the community")
          .setAuthorId("user-123")
          .setLocation("cell-123", "sector-123", "district-123")
          .build();
      }).toThrow("Post category is required");
    });
  });

  describe("Hashtag Management", () => {
    it("should add single hashtag", () => {
      const post = new PostBuilder()
        .setContent("Community work")
        .setAuthorId("user-123")
        .setLocation("cell-123", "sector-123", "district-123")
        .setCategory(ActivityCategory.CLEANING)
        .addHashtag("umuganda")
        .build();

      expect(post.hashtags).toHaveLength(1);
      expect(post.hashtags[0]).toBe("#umuganda");
    });

    it("should add # prefix if not present", () => {
      const post = new PostBuilder()
        .setContent("Community work")
        .setAuthorId("user-123")
        .setLocation("cell-123", "sector-123", "district-123")
        .setCategory(ActivityCategory.CLEANING)
        .addHashtag("service")
        .build();

      expect(post.hashtags[0]).toBe("#service");
    });

    it("should prevent duplicate hashtags", () => {
      const post = new PostBuilder()
        .setContent("Community work")
        .setAuthorId("user-123")
        .setLocation("cell-123", "sector-123", "district-123")
        .setCategory(ActivityCategory.CLEANING)
        .addHashtag("umuganda")
        .addHashtag("umuganda")
        .build();

      expect(post.hashtags).toHaveLength(1);
    });

    it("should limit hashtags to 10", () => {
      const builder = new PostBuilder()
        .setContent("Community work")
        .setAuthorId("user-123")
        .setLocation("cell-123", "sector-123", "district-123")
        .setCategory(ActivityCategory.CLEANING);

      for (let i = 0; i < 10; i++) {
        builder.addHashtag(`tag${i}`);
      }

      expect(() => {
        builder.addHashtag("tag11");
      }).toThrow("Maximum 10 hashtags allowed per post");
    });

    it("should add multiple hashtags", () => {
      const post = new PostBuilder()
        .setContent("Community work")
        .setAuthorId("user-123")
        .setLocation("cell-123", "sector-123", "district-123")
        .setCategory(ActivityCategory.CLEANING)
        .addHashtags(["umuganda", "service", "community"])
        .build();

      expect(post.hashtags).toHaveLength(3);
    });
  });

  describe("Image Management", () => {
    it("should add single image", () => {
      const post = new PostBuilder()
        .setContent("Community work")
        .setAuthorId("user-123")
        .setLocation("cell-123", "sector-123", "district-123")
        .setCategory(ActivityCategory.CLEANING)
        .addImage("https://example.com/image.jpg")
        .build();

      expect(post.images).toHaveLength(1);
      expect(post.images[0].url).toBe("https://example.com/image.jpg");
    });

    it("should add multiple images", () => {
      const post = new PostBuilder()
        .setContent("Community work")
        .setAuthorId("user-123")
        .setLocation("cell-123", "sector-123", "district-123")
        .setCategory(ActivityCategory.CLEANING)
        .addImages([
          { url: "https://example.com/image1.jpg" },
          { url: "https://example.com/image2.jpg" },
        ])
        .build();

      expect(post.images).toHaveLength(2);
    });

    it("should limit images to 5", () => {
      const builder = new PostBuilder()
        .setContent("Community work")
        .setAuthorId("user-123")
        .setLocation("cell-123", "sector-123", "district-123")
        .setCategory(ActivityCategory.CLEANING);

      for (let i = 0; i < 5; i++) {
        builder.addImage(`https://example.com/image${i}.jpg`);
      }

      expect(() => {
        builder.addImage("https://example.com/image6.jpg");
      }).toThrow("Maximum 5 images allowed per post");
    });

    it("should require image URL", () => {
      const builder = new PostBuilder()
        .setContent("Community work")
        .setAuthorId("user-123")
        .setLocation("cell-123", "sector-123", "district-123")
        .setCategory(ActivityCategory.CLEANING);

      expect(() => {
        builder.addImage("");
      }).toThrow("Image URL is required");
    });
  });

  describe("Fluent Interface", () => {
    it("should support method chaining", () => {
      const post = new PostBuilder()
        .setContent("Community work")
        .setAuthorId("user-123")
        .setLocation("cell-123", "sector-123", "district-123")
        .setCategory(ActivityCategory.CLEANING)
        .setStatus(PostStatus.PUBLISHED)
        .addHashtag("umuganda")
        .addImage("https://example.com/image.jpg")
        .build();

      expect(post).toBeInstanceOf(Post);
      expect(post.hashtags).toHaveLength(1);
      expect(post.images).toHaveLength(1);
    });
  });

  describe("Reset Functionality", () => {
    it("should reset builder to initial state", () => {
      const builder = new PostBuilder()
        .setContent("Community work")
        .setAuthorId("user-123")
        .setLocation("cell-123", "sector-123", "district-123")
        .setCategory(ActivityCategory.CLEANING);

      builder.reset();

      // Should throw because required fields are missing after reset
      expect(() => {
        builder.build();
      }).toThrow();
    });
  });
});
