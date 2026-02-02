'use client'

import { useState, useEffect } from 'react'
import { superAdminApi } from '@/lib/superAdminApi'
import { 
  BarChart3, 
  Eye, 
  FileText, 
  TrendingUp,
  Users,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Filter,
  Download
} from 'lucide-react'

interface BlogAnalytics {
  overview: {
    totalPosts: number
    totalViews: number
    timeframe: number
  }
  popularPosts: Array<{
    _id: string
    title: string
    slug: string
    viewCount: number
    uniqueUserCount: number
  }>
  categoryStats: Array<{
    _id: string
    name: string
    color: string
    views: number
  }>
  helpfulnessStats: Array<{
    _id: string
    title: string
    helpfulCount: number
    notHelpfulCount: number
    totalFeedback: number
    helpfulPercentage: number
  }>
}

export default function BlogAnalyticsPage() {
  const [analytics, setAnalytics] = useState<BlogAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeframe, setTimeframe] = useState('30')

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await superAdminApi.getBlogAnalytics(timeframe)
      setAnalytics(response.data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [timeframe])

  const timeframeOptions = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: '365', label: 'Last year' }
  ]

  if (loading && !analytics) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading analytics</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-4">
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
          <p className="text-gray-500">Analytics will appear once you have blog posts with activity.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Analytics</h1>
          <p className="text-gray-600">Track performance and engagement of your blog content</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {timeframeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalPosts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalViews.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Last {analytics.overview.timeframe} days</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Views/Post</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.overview.totalPosts > 0 
                  ? Math.round(analytics.overview.totalViews / analytics.overview.totalPosts)
                  : 0
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.categoryStats.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Posts */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Most Popular Posts</h2>
            <p className="text-sm text-gray-500">Based on views in the selected timeframe</p>
          </div>
          <div className="p-6">
            {analytics.popularPosts.length === 0 ? (
              <div className="text-center py-8">
                <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No view data available for this timeframe</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.popularPosts.map((post, index) => (
                  <div key={post._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                          {post.title}
                        </h3>
                        <p className="text-xs text-gray-500">/{post.slug}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {post.viewCount.toLocaleString()} views
                      </div>
                      <div className="text-xs text-gray-500">
                        {post.uniqueUserCount} unique users
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Category Performance</h2>
            <p className="text-sm text-gray-500">Views by category</p>
          </div>
          <div className="p-6">
            {analytics.categoryStats.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No category data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.categoryStats.map((category) => {
                  const maxViews = Math.max(...analytics.categoryStats.map(c => c.views))
                  const percentage = maxViews > 0 ? (category.views / maxViews) * 100 : 0
                  
                  return (
                    <div key={category._id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {category.name}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {category.views.toLocaleString()} views
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            backgroundColor: category.color,
                            width: `${percentage}%`
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Helpfulness Stats */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Most Helpful Posts</h2>
            <p className="text-sm text-gray-500">Based on user feedback</p>
          </div>
          <div className="p-6">
            {analytics.helpfulnessStats.length === 0 ? (
              <div className="text-center py-8">
                <ThumbsUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No feedback data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.helpfulnessStats.map((post) => (
                  <div key={post._id} className="p-3 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-1">
                      {post.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600">{post.helpfulCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsDown className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-red-600">{post.notHelpfulCount}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {Math.round(post.helpfulPercentage)}% helpful
                        </div>
                        <div className="text-xs text-gray-500">
                          {post.totalFeedback} total feedback
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-500">Common blog management tasks</p>
          </div>
          <div className="p-6 space-y-3">
            <a
              href="/blog/posts/create"
              className="block w-full bg-blue-600 text-white text-center px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create New Post
            </a>
            <a
              href="/blog/categories"
              className="block w-full bg-gray-600 text-white text-center px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Manage Categories
            </a>
            <a
              href="/blog/posts"
              className="block w-full border border-gray-300 text-gray-700 text-center px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              View All Posts
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}