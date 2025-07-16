import { ExternalLink, MessageSquare, ArrowUp, ArrowDown, Share, TrendingDown, AlertTriangle, BarChart3 } from "lucide-react";
import type { RedditPost } from "@shared/schema";

// Updated interface to match the new API response
interface PainPoint {
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  painPointKeywords: string[];
  severity: number;
}

interface PainPointTheme {
  keyword: string;
  count: number;
}

interface AnalysisResult {
  summary: {
    totalComments: number;
    sentimentBreakdown: {
      positive: number;
      negative: number;
      neutral: number;
    };
    sentimentPercentages: {
      positive: number;
      negative: number;
      neutral: number;
    };
    averageSentimentScore: number;
    overallSentiment: 'positive' | 'negative' | 'neutral';
  };
  painPoints: PainPoint[];
  topPainPointThemes: PainPointTheme[];
  insights: {
    mostCommonPainPoint: string;
    painPointPercentage: number;
    recommendedAction: string;
  };
}

interface PostCardProps {
  post: RedditPost;
  index: number;
  onAnalyze?: (permalink: string, index: number) => void;
  analysisResult?: AnalysisResult | null;
  analyzing?: boolean;
}

export function PostCard({ post, index, onAnalyze, analysisResult, analyzing }: PostCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const getTimeAgo = (createdUtc: number) => {
    const now = Date.now() / 1000;
    const diff = now - createdUtc;

    if (diff < 3600) {
      return `${Math.floor(diff / 60)} minutes ago`;
    } else if (diff < 86400) {
      return `${Math.floor(diff / 3600)} hours ago`;
    } else {
      return `${Math.floor(diff / 86400)} days ago`;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityBadge = (severity: number) => {
    if (severity >= 4) return 'bg-red-100 text-red-800 border-red-200';
    if (severity >= 2) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getOverallSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'negative': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <BarChart3 className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
      <article className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-6">
        <div className="flex items-start space-x-4">
          {/* Vote section */}
          <div className="flex flex-col items-center space-y-1 min-w-0">
            <button className="text-gray-400 hover:text-reddit transition-colors">
              <ArrowUp className="w-5 h-5" />
            </button>
            <span className="font-bold text-reddit-dark text-sm">
            {formatNumber(post.upvotes)}
          </span>
            <button className="text-gray-400 hover:text-blue-500 transition-colors">
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>

          {/* Post content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium text-reddit-dark">{index + 1}.</span>
              <span className="text-sm text-reddit-gray">r/</span>
              <span className="text-sm font-medium text-reddit-dark">{post.subreddit}</span>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-reddit-gray">Posted by</span>
              <span className="text-sm font-medium text-reddit-dark">u/{post.author}</span>
              <span className="text-sm text-reddit-gray">{getTimeAgo(post.createdUtc)}</span>
            </div>

            <h2 className="text-lg font-semibold text-reddit-dark mb-2 line-clamp-2">
              {post.title}
            </h2>

            <div className="flex items-center space-x-4 text-sm text-reddit-gray mb-2">
            <span className="flex items-center space-x-1">
              <MessageSquare className="w-4 h-4" />
              <span>{formatNumber(post.numComments)} comments</span>
            </span>
              <span className="flex items-center space-x-1">
              <Share className="w-4 h-4" />
              <span>Share</span>
            </span>
              <a
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-reddit hover:text-orange-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View on Reddit</span>
              </a>
              {onAnalyze && (
                  <button
                      className="ml-2 px-3 py-1 bg-reddit text-white rounded hover:bg-orange-600 transition-colors"
                      onClick={() => onAnalyze(post.permalink, index)}
                      disabled={analyzing}
                  >
                    {analyzing ? "Analyzing..." : "Analyze"}
                  </button>
              )}
            </div>

            {/* Enhanced Analysis Results */}
            {analysisResult && (
                <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                  {/* Summary Header */}
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getOverallSentimentIcon(analysisResult.summary.overallSentiment)}
                        <span className="font-medium text-gray-900">
                      Analysis Results ({analysisResult.summary.totalComments} comments)
                    </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{analysisResult.summary.sentimentPercentages.positive}%</span>
                    </span>
                        <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>{analysisResult.summary.sentimentPercentages.negative}%</span>
                    </span>
                        <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span>{analysisResult.summary.sentimentPercentages.neutral}%</span>
                    </span>
                      </div>
                    </div>
                  </div>

                  {/* Key Insights */}
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span className="text-sm">
                      <strong>Pain Points:</strong> {analysisResult.insights.painPointPercentage}%
                    </span>
                      </div>
                      <div className="flex items-center space-x-2">
                    <span className="text-sm">
                      <strong>Action:</strong>
                      <span className={`ml-1 font-medium ${
                          analysisResult.insights.recommendedAction.includes('Immediate') ? 'text-red-600' :
                              analysisResult.insights.recommendedAction.includes('Monitor') ? 'text-orange-600' :
                                  'text-green-600'
                      }`}>
                        {analysisResult.insights.recommendedAction}
                      </span>
                    </span>
                      </div>
                    </div>

                    {/* Top Pain Point Themes */}
                    {analysisResult.topPainPointThemes.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Top Issues:</h4>
                          <div className="flex flex-wrap gap-2">
                            {analysisResult.topPainPointThemes.slice(0, 5).map((theme, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                                >
                          {theme.keyword}
                                  <span className="ml-1 bg-gray-200 px-1 rounded">{theme.count}</span>
                        </span>
                            ))}
                          </div>
                        </div>
                    )}

                    {/* Top Pain Points */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Key Pain Points:</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {analysisResult.painPoints.slice(0, 5).map((painPoint, idx) => (
                            <div
                                key={idx}
                                className="p-3 bg-gray-50 rounded border border-gray-200 text-sm"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getSentimentColor(painPoint.sentiment)}`}>
                              {painPoint.sentiment}
                            </span>
                                  <span className={`px-2 py-1 rounded text-xs border ${getSeverityBadge(painPoint.severity)}`}>
                              Severity: {painPoint.severity}
                            </span>
                                </div>
                                <span className="text-xs text-gray-500">
                            Score: {painPoint.sentimentScore}
                          </span>
                              </div>
                              <p className="text-gray-700 mb-1">
                                {painPoint.text.length > 150
                                    ? painPoint.text.substring(0, 150) + '...'
                                    : painPoint.text}
                              </p>
                              {painPoint.painPointKeywords.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {painPoint.painPointKeywords.slice(0, 3).map((keyword, keyIdx) => (
                                        <span
                                            key={keyIdx}
                                            className="inline-block px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded"
                                        >
                                {keyword}
                              </span>
                                    ))}
                                  </div>
                              )}
                            </div>
                        ))}
                      </div>
                      {analysisResult.painPoints.length > 5 && (
                          <p className="text-xs text-gray-500 mt-2">
                            Showing 5 of {analysisResult.painPoints.length} pain points
                          </p>
                      )}
                    </div>
                  </div>
                </div>
            )}
          </div>
        </div>
      </article>
  );
}