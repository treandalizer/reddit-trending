import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import type { RedditApiResponse, SearchRequest } from "@shared/schema";
import { searchRequestSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Fetch trending posts from Reddit API
  app.get("/api/trending", async (req, res) => {
    try {
      // First try to get cached posts
      const cachedPosts = await storage.getTrendingPosts();
      
      // If we have recent posts (less than 5 minutes old), return them
      if (cachedPosts.length > 0) {
        const latestPost = cachedPosts[0];
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        if (latestPost.fetchedAt && latestPost.fetchedAt > fiveMinutesAgo) {
          return res.json(cachedPosts);
        }
      }
      
      // Try to fetch from Reddit API first
      try {
        const response = await fetch('https://www.reddit.com/r/popular.json?limit=10', {
          headers: {
            'User-Agent': 'TrendingRedditApp/1.0 (by /u/developer)',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          const data: RedditApiResponse = await response.json();
          
          // Transform the data
          const posts = data.data.children.map(child => ({
            redditId: child.data.id,
            title: child.data.title,
            author: child.data.author,
            subreddit: child.data.subreddit,
            upvotes: child.data.ups,
            numComments: child.data.num_comments,
            permalink: `https://reddit.com${child.data.permalink}`,
            createdUtc: child.data.created_utc,
          }));
          
          // Save to storage
          await storage.saveTrendingPosts(posts);
          
          // Return the saved posts
          const savedPosts = await storage.getTrendingPosts();
          return res.json(savedPosts);
        }
      } catch (apiError) {
        console.log('Reddit API request failed, using fallback data');
      }
      
      // If Reddit API fails, return cached data or error
      if (cachedPosts.length > 0) {
        return res.json(cachedPosts);
      }
      
      // No cached data available, return error
      throw new Error('Unable to fetch data from Reddit API. The service may be temporarily unavailable or blocked.');
      
    } catch (error) {
      console.error('Error fetching trending posts:', error);
      res.status(500).json({ 
        message: 'Reddit API is currently unavailable. This may be due to network restrictions or rate limiting. Please try again later or check your internet connection.' 
      });
    }
  });

  // Force refresh trending posts
  app.post("/api/trending/refresh", async (req, res) => {
    try {
      // Clear old posts
      await storage.clearOldPosts();
      
      // Try to fetch fresh data
      const response = await fetch('https://www.reddit.com/r/popular.json?limit=10', {
        headers: {
          'User-Agent': 'TrendingRedditApp/1.0 (by /u/developer)',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Reddit API returned ${response.status}: ${response.statusText}`);
      }
      
      const data: RedditApiResponse = await response.json();
      
      const posts = data.data.children.map(child => ({
        redditId: child.data.id,
        title: child.data.title,
        author: child.data.author,
        subreddit: child.data.subreddit,
        upvotes: child.data.ups,
        numComments: child.data.num_comments,
        permalink: `https://reddit.com${child.data.permalink}`,
        createdUtc: child.data.created_utc,
      }));
      
      await storage.saveTrendingPosts(posts);
      
      const savedPosts = await storage.getTrendingPosts();
      res.json(savedPosts);
      
    } catch (error) {
      console.error('Error refreshing trending posts:', error);
      res.status(500).json({ 
        message: 'Reddit API is currently unavailable. This may be due to network restrictions or rate limiting. Please try again later.' 
      });
    }
  });

  // Search posts by topic
  app.post("/api/search", async (req, res) => {
    try {
      // Validate request body
      const validatedData = searchRequestSchema.parse(req.body);
      const { topic, sortBy, timeFilter } = validatedData;
      
      // Create cache key that includes all search parameters
      const cacheKey = `${topic}:${sortBy}:${timeFilter}`;
      
      // Check for cached topic posts with the specific search parameters
      const cachedPosts = await storage.getTopicPosts(cacheKey);
      
      // If we have recent posts (less than 5 minutes old), return them
      if (cachedPosts.length > 0) {
        const latestPost = cachedPosts[0];
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        if (latestPost.fetchedAt && latestPost.fetchedAt > fiveMinutesAgo) {
          return res.json(cachedPosts);
        }
      }
      
      // Build Reddit search URL
      let searchUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(topic)}&sort=${sortBy}&limit=10`;
      if (timeFilter !== 'all') {
        searchUrl += `&t=${timeFilter}`;
      }
      
      // Try to fetch from Reddit API
      try {
        const response = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'TrendingRedditApp/1.0 (by /u/developer)',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          const data: RedditApiResponse = await response.json();
          
          // Transform the data
          const posts = data.data.children.map(child => ({
            redditId: child.data.id,
            title: child.data.title,
            author: child.data.author,
            subreddit: child.data.subreddit,
            upvotes: child.data.ups,
            numComments: child.data.num_comments,
            permalink: `https://reddit.com${child.data.permalink}`,
            createdUtc: child.data.created_utc,
          }));
          
          // Save to storage with the cache key
          await storage.saveTopicPosts(cacheKey, posts);
          
          // Return the saved posts
          const savedPosts = await storage.getTopicPosts(cacheKey);
          return res.json(savedPosts);
        }
      } catch (apiError) {
        console.log(`Reddit API search failed for topic "${topic}", using fallback`);
      }
      
      // If Reddit API fails, return cached data or error
      if (cachedPosts.length > 0) {
        return res.json(cachedPosts);
      }
      
      // No cached data available, return error
      throw new Error(`Unable to fetch posts for topic "${topic}". The Reddit API may be temporarily unavailable.`);
      
    } catch (error) {
      console.error('Error searching posts:', error);
      
      // Handle validation errors
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: 'Invalid search parameters. Please check your input and try again.' 
        });
      }
      
      res.status(500).json({ 
        message: error.message || 'Failed to search posts. Please try again later.' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
