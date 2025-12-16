/**
 * Analytics Dashboard Component
 * Displays impact statistics and trends
 */

"use client";

import React from "react";
import clsx from "clsx";

interface StatBoxProps {
  label: string;
  value: number;
  trend?: number;
  icon?: string;
}

function StatBox({ label, value, trend, icon }: StatBoxProps) {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">
            {value.toLocaleString()}
          </h3>
          {trend !== undefined && (
            <p
              className={clsx(
                "text-sm font-medium mt-2",
                isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {isPositive ? "↑" : "↓"} {Math.abs(trend)}% from last period
            </p>
          )}
        </div>
        {icon && <span className="text-3xl">{icon}</span>}
      </div>
    </div>
  );
}

interface Category {
  category: string;
  count: number;
  percentage: number;
}

interface LocationStats {
  name: string;
  totalPosts: number;
  engagementScore: number;
}

interface AnalyticsDashboardProps {
  title: string;
  period: {
    startDate: string;
    endDate: string;
  };
  stats: {
    totalPosts: number;
    totalComments: number;
    totalReactions: number;
    totalReposts: number;
    totalEngagement: number;
  };
  topCategories: Category[];
  topHashtags: any[];
  cellStats: LocationStats[];
  lastUpdated: string;
}

export function AnalyticsDashboard({
  title,
  period,
  stats,
  topCategories,
  topHashtags,
  cellStats,
  lastUpdated,
}: AnalyticsDashboardProps) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-2">
          {new Date(period.startDate).toLocaleDateString()} -{" "}
          {new Date(period.endDate).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatBox label="Total Posts" value={stats.totalPosts} icon="📝" />
        <StatBox label="Comments" value={stats.totalComments} icon="💬" />
        <StatBox label="Reactions" value={stats.totalReactions} icon="❤️" />
        <StatBox label="Shares" value={stats.totalReposts} icon="🔄" />
        <StatBox
          label="Total Engagement"
          value={stats.totalEngagement}
          icon="📊"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Categories */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Activity Categories
          </h2>
          <div className="space-y-3">
            {topCategories.slice(0, 5).map((cat) => (
              <div
                key={cat.category}
                className="flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {cat.category}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {cat.count}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-lime-moss h-2 rounded-full transition-all"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Hashtags */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Popular Hashtags
          </h2>
          <div className="flex flex-wrap gap-2">
            {topHashtags.slice(0, 10).map((tag) => (
              <a
                key={tag.hashtag}
                href={`?hashtag=${tag.hashtag}`}
                className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm hover:bg-blue-200 transition-colors"
              >
                {tag.hashtag}
                <span className="ml-1 text-xs font-semibold">{tag.count}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Cells */}
      {cellStats.length > 0 && (
        <div className="mt-8 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Top Performing Communities
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-900">
                    Community
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-900">
                    Posts
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-900">
                    Engagement Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {cellStats.slice(0, 10).map((cell) => (
                  <tr
                    key={cell.name}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {cell.name}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {cell.totalPosts}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-lime-moss h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                cell.engagementScore * 10,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="text-gray-900 font-semibold">
                          {cell.engagementScore.toFixed(1)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
