import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, AlertCircle, ExternalLink, TrendingUp, Search } from "lucide-react";
import { SiReddit } from "react-icons/si";
import { PostCard } from "@/components/post-card";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { SearchForm } from "@/components/search-form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { RedditPost, SearchRequest } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchResults, setSearchResults] = useState<RedditPost[]>([]);
  const [currentSearch, setCurrentSearch] = useState<SearchRequest | null>(null);
  const [activeTab, setActiveTab] = useState<string>("trending");

  const { data: posts, isLoading, error } = useQuery<RedditPost[]>({
    queryKey: ["/api/trending"],
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/trending/refresh");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/trending"], data);
      toast({
        title: "Posts refreshed",
        description: "Successfully fetched the latest trending posts from Reddit.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Refresh failed",
        description: error.message || "Failed to refresh posts. Please try again.",
        variant: "destructive",
      });
    },
  });

  const searchMutation = useMutation({
    mutationFn: async (searchData: SearchRequest) => {
      const response = await apiRequest("POST", "/api/search", searchData);
      return response.json();
    },
    onSuccess: (data, variables) => {
      setSearchResults(data);
      setCurrentSearch(variables);
      setActiveTab("search");
      toast({
        title: "Search completed",
        description: `Found ${data.length} posts for "${variables.topic}"`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Search failed",
        description: error.message || "Failed to search posts. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  const handleSearch = (searchData: SearchRequest) => {
    searchMutation.mutate(searchData);
  };

  const getLastUpdated = () => {
    if (posts && posts.length > 0) {
      const latestPost = posts[0];
      if (latestPost.fetchedAt) {
        return new Date(latestPost.fetchedAt).toLocaleTimeString();
      }
    }
    return new Date().toLocaleTimeString();
  };

  return (
    <div className="bg-reddit-bg min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SiReddit className="text-reddit text-2xl" />
              <h1 className="text-2xl font-bold text-reddit-dark">Reddit Explorer</h1>
              <span className="bg-reddit text-white px-2 py-1 rounded-full text-sm font-medium">
                Enhanced
              </span>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshMutation.isPending}
              className="bg-reddit hover:bg-orange-600 text-white font-medium"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
              {refreshMutation.isPending ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trending Posts
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search Topics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="trending" className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-reddit-dark mb-2">Top 10 Trending Posts</h2>
              <p className="text-reddit-gray">
                Discover the most popular posts from all of Reddit right now. Updates automatically every 5 minutes.
              </p>
            </div>

            {isLoading && <LoadingSkeleton />}
            
            {error && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-reddit-dark mb-2">
                  Failed to load posts
                </h2>
                <p className="text-reddit-gray mb-6">
                  There was an error fetching the trending posts. Please try again.
                </p>
                <Button
                  onClick={handleRefresh}
                  disabled={refreshMutation.isPending}
                  className="bg-reddit hover:bg-orange-600 text-white"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
                  Try Again
                </Button>
              </div>
            )}

            {posts && posts.length > 0 && (
              <div className="space-y-4">
                {posts.map((post, index) => (
                  <PostCard key={post.redditId} post={post} index={index} />
                ))}
              </div>
            )}

            {posts && posts.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-reddit-gray mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-reddit-dark mb-2">
                  No posts found
                </h2>
                <p className="text-reddit-gray mb-6">
                  Unable to fetch trending posts at this time. Please try refreshing.
                </p>
                <Button
                  onClick={handleRefresh}
                  disabled={refreshMutation.isPending}
                  className="bg-reddit hover:bg-orange-600 text-white"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <SearchForm onSearch={handleSearch} isLoading={searchMutation.isPending} />
            
            {currentSearch && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-reddit-dark mb-2">
                  Search Results for "{currentSearch.topic}"
                </h3>
                <p className="text-reddit-gray text-sm">
                  Sorted by {currentSearch.sortBy} • Time filter: {currentSearch.timeFilter === 'all' ? 'All time' : currentSearch.timeFilter}
                </p>
              </div>
            )}
            
            {searchMutation.isPending && <LoadingSkeleton />}
            
            {searchResults.length > 0 && (
              <div className="space-y-4">
                {searchResults.map((post, index) => (
                  <PostCard key={post.redditId} post={post} index={index} />
                ))}
              </div>
            )}
            
            {searchResults.length === 0 && currentSearch && !searchMutation.isPending && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-reddit-gray mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-reddit-dark mb-2">
                  No results found
                </h2>
                <p className="text-reddit-gray mb-6">
                  No posts found for "{currentSearch.topic}". Try a different search term or adjust your filters.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="text-center py-8 mt-8 border-t border-gray-200">
          <p className="text-reddit-gray text-sm">
            Data refreshed every 5 minutes • Last updated: {getLastUpdated()}
          </p>
          <p className="text-reddit-gray text-xs mt-2">
            Powered by Reddit API • 
            <a 
              href="https://github.com/treandalizer/reddit-trending" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-reddit hover:text-orange-600 ml-1"
            >
              View Source
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
