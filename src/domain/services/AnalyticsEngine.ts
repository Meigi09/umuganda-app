/**
 * CREATIONAL DESIGN PATTERN: Singleton
 *
 * Purpose: Ensure a single instance of the Analytics Engine exists
 * throughout the application lifecycle. The Analytics Engine is responsible
 * for aggregating post data and generating national-level statistics.
 *
 * Benefits:
 * - Single source of truth for analytics data
 * - Prevents multiple instances from conflicting
 * - Lazy initialization (created only when needed)
 * - Thread-safe implementation
 */

import { ActivityCategory, PrismaClient } from "@prisma/client";

/**
 * Category statistics interface
 */
interface CategoryStats {
  category: ActivityCategory;
  count: number;
  percentage: number;
}

/**
 * Location statistics interface
 */
interface LocationStats {
  name: string;
  id: string;
  totalPosts: number;
  totalEngagement: number;
  engagementScore: number;
  topCategories: CategoryStats[];
}

/**
 * Hashtag statistics interface
 */
interface HashtagStats {
  hashtag: string;
  count: number;
  percentage: number;
}

/**
 * Analytics summary interface
 */
export interface AnalyticsSummary {
  period: {
    startDate: Date;
    endDate: Date;
  };
  national: {
    totalPosts: number;
    totalComments: number;
    totalReactions: number;
    totalReposts: number;
    totalEngagement: number;
  };
  topCategories: CategoryStats[];
  topHashtags: HashtagStats[];
  cellStats: LocationStats[];
  sectorStats: LocationStats[];
  districtStats: LocationStats[];
  lastUpdated: Date;
}

/**
 * Analytics Engine - Singleton
 *
 * This class should be instantiated only once and used globally.
 * It aggregates data from all posts and generates comprehensive statistics.
 */
export class AnalyticsEngine {
  private static instance: AnalyticsEngine | null = null;
  private prisma: PrismaClient;
  private lastUpdated: Date | null = null;

  /**
   * Private constructor to prevent direct instantiation
   */
  private constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get the singleton instance of AnalyticsEngine
   * Implements lazy initialization pattern
   *
   * @param prisma - PrismaClient instance for database access
   * @returns The singleton instance of AnalyticsEngine
   */
  static getInstance(prisma: PrismaClient): AnalyticsEngine {
    if (!AnalyticsEngine.instance) {
      AnalyticsEngine.instance = new AnalyticsEngine(prisma);
    }
    return AnalyticsEngine.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static resetInstance(): void {
    AnalyticsEngine.instance = null;
  }

  /**
   * Calculate engagement score based on interactions
   */
  private calculateEngagementScore(
    posts: number,
    comments: number,
    reactions: number,
    reposts: number
  ): number {
    // Weighted scoring: posts=1, comments=2, reactions=1, reposts=3
    const score = posts * 1 + comments * 2 + reactions * 1 + reposts * 3;
    return Math.round((score / (posts || 1)) * 100) / 100;
  }

  /**
   * Get category statistics from posts
   */
  private async getCategoryStats(
    startDate: Date,
    endDate: Date
  ): Promise<CategoryStats[]> {
    const posts = await this.prisma.post.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: { category: true },
    });

    const categoryMap = new Map<ActivityCategory, number>();

    posts.forEach((post) => {
      categoryMap.set(post.category, (categoryMap.get(post.category) || 0) + 1);
    });

    const total = posts.length || 1;
    return Array.from(categoryMap.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Extract and rank hashtags from posts
   */
  private async getHashtagStats(
    startDate: Date,
    endDate: Date
  ): Promise<HashtagStats[]> {
    const posts = await this.prisma.post.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: { hashtags: true },
    });

    const hashtagMap = new Map<string, number>();

    posts.forEach((post) => {
      if (post.hashtags && post.hashtags.length > 0) {
        post.hashtags.forEach((tag) => {
          hashtagMap.set(tag, (hashtagMap.get(tag) || 0) + 1);
        });
      }
    });

    const total = Array.from(hashtagMap.values()).reduce((a, b) => a + b, 1);
    return Array.from(hashtagMap.entries())
      .map(([hashtag, count]) => ({
        hashtag,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 hashtags
  }

  /**
   * Get statistics for a specific location level (cell, sector, district)
   */
  private async getLocationStats(
    startDate: Date,
    endDate: Date,
    locationType: "cell" | "sector" | "district"
  ): Promise<LocationStats[]> {
    const locationStats: LocationStats[] = [];

    if (locationType === "cell") {
      const cells = await this.prisma.cell.findMany({
        include: {
          posts: {
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
            include: {
              comments: true,
              reactions: true,
              reposts: true,
            },
          },
        },
      });

      for (const cell of cells) {
        const totalPosts = cell.posts.length;
        const totalComments = cell.posts.reduce(
          (acc, post) => acc + post.comments.length,
          0
        );
        const totalReactions = cell.posts.reduce(
          (acc, post) => acc + post.reactions.length,
          0
        );
        const totalReposts = cell.posts.reduce(
          (acc, post) => acc + post.reposts.length,
          0
        );
        const totalEngagement =
          totalPosts + totalComments + totalReactions + totalReposts;

        const categoryStats = await this.getCategoryStatsForLocation(
          cell.posts.map((p) => p.category)
        );

        locationStats.push({
          name: cell.name,
          id: cell.id,
          totalPosts,
          totalEngagement,
          engagementScore: this.calculateEngagementScore(
            totalPosts,
            totalComments,
            totalReactions,
            totalReposts
          ),
          topCategories: categoryStats,
        });
      }
    } else if (locationType === "sector") {
      const sectors = await this.prisma.sector.findMany({
        include: {
          posts: {
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
            include: {
              comments: true,
              reactions: true,
              reposts: true,
            },
          },
        },
      });

      for (const sector of sectors) {
        const totalPosts = sector.posts.length;
        const totalComments = sector.posts.reduce(
          (acc, post) => acc + post.comments.length,
          0
        );
        const totalReactions = sector.posts.reduce(
          (acc, post) => acc + post.reactions.length,
          0
        );
        const totalReposts = sector.posts.reduce(
          (acc, post) => acc + post.reposts.length,
          0
        );
        const totalEngagement =
          totalPosts + totalComments + totalReactions + totalReposts;

        const categoryStats = await this.getCategoryStatsForLocation(
          sector.posts.map((p) => p.category)
        );

        locationStats.push({
          name: sector.name,
          id: sector.id,
          totalPosts,
          totalEngagement,
          engagementScore: this.calculateEngagementScore(
            totalPosts,
            totalComments,
            totalReactions,
            totalReposts
          ),
          topCategories: categoryStats,
        });
      }
    } else {
      // district
      const districts = await this.prisma.district.findMany({
        include: {
          posts: {
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
            include: {
              comments: true,
              reactions: true,
              reposts: true,
            },
          },
        },
      });

      for (const district of districts) {
        const totalPosts = district.posts.length;
        const totalComments = district.posts.reduce(
          (acc, post) => acc + post.comments.length,
          0
        );
        const totalReactions = district.posts.reduce(
          (acc, post) => acc + post.reactions.length,
          0
        );
        const totalReposts = district.posts.reduce(
          (acc, post) => acc + post.reposts.length,
          0
        );
        const totalEngagement =
          totalPosts + totalComments + totalReactions + totalReposts;

        const categoryStats = await this.getCategoryStatsForLocation(
          district.posts.map((p) => p.category)
        );

        locationStats.push({
          name: district.name,
          id: district.id,
          totalPosts,
          totalEngagement,
          engagementScore: this.calculateEngagementScore(
            totalPosts,
            totalComments,
            totalReactions,
            totalReposts
          ),
          topCategories: categoryStats,
        });
      }
    }

    return locationStats.sort((a, b) => b.engagementScore - a.engagementScore);
  }

  /**
   * Helper to get category stats for a given list of categories
   */
  private async getCategoryStatsForLocation(
    categories: ActivityCategory[]
  ): Promise<CategoryStats[]> {
    const categoryMap = new Map<ActivityCategory, number>();

    categories.forEach((cat) => {
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    });

    const total = categories.length || 1;
    return Array.from(categoryMap.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 categories per location
  }

  /**
   * Generate comprehensive analytics summary for a given period
   *
   * @param startDate - Start of analytics period
   * @param endDate - End of analytics period
   * @returns Complete AnalyticsSummary object
   */
  async generateSummary(
    startDate: Date,
    endDate: Date
  ): Promise<AnalyticsSummary> {
    // Fetch national-level data
    const totalPosts = await this.prisma.post.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalComments = await this.prisma.comment.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalReactions = await this.prisma.reaction.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalReposts = await this.prisma.repost.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalEngagement =
      totalPosts + totalComments + totalReactions + totalReposts;

    // Get category and hashtag stats
    const topCategories = await this.getCategoryStats(startDate, endDate);
    const topHashtags = await this.getHashtagStats(startDate, endDate);

    // Get location-level stats
    const cellStats = await this.getLocationStats(startDate, endDate, "cell");
    const sectorStats = await this.getLocationStats(
      startDate,
      endDate,
      "sector"
    );
    const districtStats = await this.getLocationStats(
      startDate,
      endDate,
      "district"
    );

    this.lastUpdated = new Date();

    return {
      period: { startDate, endDate },
      national: {
        totalPosts,
        totalComments,
        totalReactions,
        totalReposts,
        totalEngagement,
      },
      topCategories,
      topHashtags,
      cellStats,
      sectorStats,
      districtStats,
      lastUpdated: this.lastUpdated,
    };
  }

  /**
   * Get the last time analytics were updated
   */
  getLastUpdated(): Date | null {
    return this.lastUpdated;
  }
}
