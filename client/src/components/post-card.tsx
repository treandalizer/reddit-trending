import { ExternalLink, MessageSquare, ArrowUp, ArrowDown, Share } from "lucide-react";
import type { RedditPost } from "@shared/schema";

interface PostCardProps {
  post: RedditPost;
  index: number;
}

export function PostCard({ post, index }: PostCardProps) {
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
          
          <div className="flex items-center space-x-4 text-sm text-reddit-gray">
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
          </div>
        </div>
      </div>
    </article>
  );
}
