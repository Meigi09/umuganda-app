/**
 * Unit Tests for Post Factory Pattern
 */

import { PostFactoryCreator } from "@/domain/factories/PostFactory";
import { ActivityCategory, PostStatus } from "@prisma/client";

describe("PostFactory - Factory Method Pattern", () => {
  const testData = {
    content: "Test Umuganda activity",
    authorId: "user-123",
    cellId: "cell-123",
    sectorId: "sector-123",
    districtId: "district-123",
    category: ActivityCategory.CLEANING,
  };

  describe("TextPostFactory", () => {
    it("should create a text post successfully", async () => {
      const factory = PostFactoryCreator.getFactory("text");
      const post = await factory.createPost(testData);

      expect(post).toBeDefined();
      expect(post.content).toBe(testData.content);
      expect(post.authorId).toBe(testData.authorId);
      expect(post.status).toBe(PostStatus.PUBLISHED);
    });

    it("should reject empty content", async () => {
      const factory = PostFactoryCreator.getFactory("text");

      await expect(
        factory.createPost({
          ...testData,
          content: "",
        })
      ).rejects.toThrow("Post content cannot be empty");
    });

    it("should reject content exceeding maximum length", async () => {
      const factory = PostFactoryCreator.getFactory("text");

      await expect(
        factory.createPost({
          ...testData,
          content: "a".repeat(5001),
        })
      ).rejects.toThrow("Post content exceeds maximum length");
    });

    it("should return correct post type", () => {
      const factory = PostFactoryCreator.getFactory("text");
      expect(factory.getPostType()).toBe("TEXT_POST");
    });
  });

  describe("ImagePostFactory", () => {
    it("should create an image post successfully", async () => {
      const factory = PostFactoryCreator.getFactory("image");
      const post = await factory.createPost({
        ...testData,
        images: [
          {
            url: "https://example.com/image.jpg",
            publicId: "public-123",
          },
        ],
      });

      expect(post).toBeDefined();
      expect("images" in post && post.images).toHaveLength(1);
      expect("images" in post && post.images[0].url).toBe(
        "https://example.com/image.jpg"
      );
    });

    it("should reject posts without images", async () => {
      const factory = PostFactoryCreator.getFactory("image");

      await expect(
        factory.createPost({
          ...testData,
          images: [],
        } as any)
      ).rejects.toThrow("Image post must have at least 1 image(s)");
    });

    it("should reject posts with too many images", async () => {
      const factory = PostFactoryCreator.getFactory("image");

      await expect(
        factory.createPost({
          ...testData,
          images: Array(6).fill({ url: "https://example.com/image.jpg" }),
        })
      ).rejects.toThrow("Image post cannot exceed 5 images");
    });

    it("should return correct post type", () => {
      const factory = PostFactoryCreator.getFactory("image");
      expect(factory.getPostType()).toBe("IMAGE_POST");
    });
  });

  describe("PostFactoryCreator", () => {
    it("should throw error for unknown post type", () => {
      expect(() => PostFactoryCreator.getFactory("unknown" as any)).toThrow(
        "Unknown post type: unknown"
      );
    });

    it("should be case-insensitive", () => {
      const factory1 = PostFactoryCreator.getFactory("text");
      const factory2 = PostFactoryCreator.getFactory("TEXT" as any);

      expect(factory1.getPostType()).toBe(factory2.getPostType());
    });
  });
});
