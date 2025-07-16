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
      
      // Build Reddit search URL - use specific search parameters for better results
      let searchUrl;
      
      // If the topic starts with 'r/', search within that subreddit
      if (topic.toLowerCase().startsWith('r/')) {
        const subreddit = topic.substring(2);
        searchUrl = `https://www.reddit.com/r/${subreddit}/${sortBy}.json?limit=10`;
        if (timeFilter !== 'all') {
          searchUrl += `&t=${timeFilter}`;
        }
      } else {
        // General search with better query construction
        searchUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(topic)}&sort=${sortBy}&limit=10&type=link`;
        if (timeFilter !== 'all') {
          searchUrl += `&t=${timeFilter}`;
        }
      }
      
      // Try to fetch from Reddit API
      try {
        console.log(`Searching Reddit with URL: ${searchUrl}`);
        const response = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'TrendingRedditApp/1.0 (by /u/developer)',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          const data: RedditApiResponse = await response.json();
          
          // Transform the data and filter out irrelevant results
          const posts = data.data.children
            .filter(child => {
              // Filter out posts that are not relevant to the search topic
              const title = child.data.title.toLowerCase();
              const searchTopic = topic.toLowerCase();
              
              // If searching for a specific subreddit, don't filter by title
              if (topic.toLowerCase().startsWith('r/')) {
                return true;
              }
              
              // For general searches, check if the title or subreddit contains the search term
              return title.includes(searchTopic) || 
                     child.data.subreddit.toLowerCase().includes(searchTopic) ||
                     child.data.selftext?.toLowerCase().includes(searchTopic);
            })
            .map(child => ({
              redditId: child.data.id,
              title: child.data.title,
              author: child.data.author,
              subreddit: child.data.subreddit,
              upvotes: child.data.ups,
              numComments: child.data.num_comments,
              permalink: `https://reddit.com${child.data.permalink}`,
              createdUtc: child.data.created_utc,
            }));
          
          console.log(`Found ${posts.length} relevant posts for "${topic}"`);
          
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

      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          message: 'Invalid search parameters. Please check your input and try again.'
        });
      }

      if (error instanceof Error) {
        return res.status(500).json({
          message: error.message || 'Failed to search posts. Please try again later.'
        });
      }

      // Fallback if it's not an instance of Error
      res.status(500).json({
        message: 'Failed to search posts. Please try again later.'
      });
    }
  });

  // Analyze comments for a given Reddit post (by permalink)
  app.post("/api/analyze", async (req, res) => {
    try {
      const { permalink } = req.body;
      console.log(`Received request to analyze comments for permalink: ${permalink}`);
      if (!permalink) {
        return res.status(400).json({ error: "Permalink is required" });
      }

      // Fetch comments for the post
      // Reddit API: https://www.reddit.com{permalink}.json
      const url = `${permalink}.json?limit=100`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'TrendingRedditApp/1.0 (by /u/developer)',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`Reddit API returned ${response.status}: ${response.statusText}`);
      }

      const data: any = await response.json();
      // Comments are in data[1].data.children
      const rawComments = (data[1]?.data?.children || [])
          .filter((child: any) => child.kind === "t1")
          .map((child: any) => child.data.body)
          .filter((comment: string) => comment && comment.length > 15);

      console.log(`Fetched ${rawComments.length} comments for permalink: ${permalink}`);
      // Sentiment Analysis Helper Functions
      const sentimentWords = {
        positive: [
          'amazing', 'awesome', 'excellent', 'fantastic', 'great', 'love', 'perfect',
          'wonderful', 'brilliant', 'outstanding', 'good', 'nice', 'happy', 'satisfied',
          'pleased', 'impressed', 'recommend', 'helpful', 'useful', 'easy', 'smooth',
          'fast', 'efficient', 'reliable', 'quality', 'best', 'favorite', 'solid'
        ],
        negative: [
          'terrible', 'awful', 'horrible', 'worst', 'hate', 'disgusting', 'pathetic',
          'useless', 'broken', 'failed', 'disappointed', 'frustrated', 'annoying',
          'confusing', 'difficult', 'slow', 'expensive', 'overpriced', 'waste',
          'regret', 'avoid', 'warning', 'scam', 'fraud', 'misleading', 'fake',
          'poor', 'cheap', 'flimsy', 'unreliable', 'buggy', 'glitchy'
        ]
      };

      const painPointKeywords = [
        'problem', 'issue', 'bug', 'error', 'crash', 'freeze', 'lag', 'slow',
        'expensive', 'overpriced', 'confusing', 'difficult', 'complicated',
        'frustrating', 'annoying', 'disappointing', 'broken', 'doesn\'t work',
        'not working', 'failed', 'missing', 'lacking', 'need', 'wish', 'should',
        'could be better', 'improvement', 'fix', 'update', 'change', 'remove',
        'add', 'feature request', 'suggestion', 'complaint', 'concern', 'worry'
      ];

      // Sentiment Analysis Function
      function analyzeSentiment(text: string): { score: number; sentiment: 'positive' | 'negative' | 'neutral' } {
        const words = text.toLowerCase().split(/\s+/);
        let score = 0;

        // Count positive and negative words
        for (const word of words) {
          if (sentimentWords.positive.includes(word)) score += 1;
          if (sentimentWords.negative.includes(word)) score -= 1;
        }

        // Apply negation handling (simple approach)
        const negationWords = ['not', 'no', 'never', 'none', 'nothing', 'nobody', 'nowhere', 'neither', 'nor', 'don\'t', 'doesn\'t', 'didn\'t', 'won\'t', 'wouldn\'t', 'can\'t', 'cannot', 'shouldn\'t', 'mustn\'t'];
        for (let i = 0; i < words.length - 1; i++) {
          if (negationWords.includes(words[i])) {
            // Flip sentiment of next few words
            for (let j = i + 1; j < Math.min(i + 4, words.length); j++) {
              if (sentimentWords.positive.includes(words[j])) score -= 2; // was +1, now -1
              if (sentimentWords.negative.includes(words[j])) score += 2; // was -1, now +1
            }
          }
        }

        // Normalize score based on text length
        const normalizedScore = score / Math.max(words.length / 10, 1);

        let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
        if (normalizedScore > 0.1) sentiment = 'positive';
        else if (normalizedScore < -0.1) sentiment = 'negative';

        return { score: normalizedScore, sentiment };
      }

      // Pain Point Detection Function
      function detectPainPoints(text: string): { isPainPoint: boolean; keywords: string[]; severity: number } {
        const lowerText = text.toLowerCase();
        const foundKeywords: string[] = [];
        let severity = 0;

        for (const keyword of painPointKeywords) {
          if (lowerText.includes(keyword)) {
            foundKeywords.push(keyword);
            // Weight certain keywords more heavily
            if (['broken', 'crash', 'error', 'bug', 'terrible', 'awful'].includes(keyword)) {
              severity += 2;
            } else {
              severity += 1;
            }
          }
        }

        return {
          isPainPoint: foundKeywords.length > 0,
          keywords: foundKeywords,
          severity
        };
      }

      // Analyze all comments
      const analyzedComments = rawComments.map((comment: string) => {
        const sentiment = analyzeSentiment(comment);
        const painPoint = detectPainPoints(comment);

        return {
          text: comment,
          sentiment: sentiment.sentiment,
          sentimentScore: sentiment.score,
          isPainPoint: painPoint.isPainPoint,
          painPointKeywords: painPoint.keywords,
          painPointSeverity: painPoint.severity,
          length: comment.length
        };
      });

      // Extract pain points (comments with negative sentiment or pain point keywords)
      const painPointComments = analyzedComments
          .filter(comment =>
              comment.sentiment === 'negative' ||
              comment.isPainPoint ||
              comment.sentimentScore < -0.05
          )
          .sort((a, b) => {
            // Sort by pain point severity, then by negative sentiment score
            if (a.painPointSeverity !== b.painPointSeverity) {
              return b.painPointSeverity - a.painPointSeverity;
            }
            return a.sentimentScore - b.sentimentScore;
          });

      // Generate summary insights
      const totalComments = analyzedComments.length;
      const sentimentBreakdown = {
        positive: analyzedComments.filter(c => c.sentiment === 'positive').length,
        negative: analyzedComments.filter(c => c.sentiment === 'negative').length,
        neutral: analyzedComments.filter(c => c.sentiment === 'neutral').length
      };

      // Extract top pain point themes
      const painPointThemes: Record<string, number> = {};
      painPointComments.forEach(comment => {
        comment.painPointKeywords.forEach(keyword => {
          painPointThemes[keyword] = (painPointThemes[keyword] || 0) + 1;
        });
      });

      const topPainPointThemes = Object.entries(painPointThemes)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([keyword, count]) => ({ keyword, count }));

      // Calculate average sentiment score
      const avgSentimentScore = analyzedComments.reduce((sum, comment) => sum + comment.sentimentScore, 0) / totalComments;

      // Prepare response
      const response_data = {
        summary: {
          totalComments,
          sentimentBreakdown,
          sentimentPercentages: {
            positive: Math.round((sentimentBreakdown.positive / totalComments) * 100),
            negative: Math.round((sentimentBreakdown.negative / totalComments) * 100),
            neutral: Math.round((sentimentBreakdown.neutral / totalComments) * 100)
          },
          averageSentimentScore: Math.round(avgSentimentScore * 1000) / 1000,
          overallSentiment: avgSentimentScore > 0.1 ? 'positive' : avgSentimentScore < -0.1 ? 'negative' : 'neutral'
        },
        painPoints: painPointComments.slice(0, 20).map(comment => ({
          text: comment.text.substring(0, 200) + (comment.text.length > 200 ? '...' : ''),
          sentiment: comment.sentiment,
          sentimentScore: Math.round(comment.sentimentScore * 1000) / 1000,
          painPointKeywords: comment.painPointKeywords,
          severity: comment.painPointSeverity
        })),
        topPainPointThemes,
        insights: {
          mostCommonPainPoint: topPainPointThemes[0]?.keyword || 'None detected',
          painPointPercentage: Math.round((painPointComments.length / totalComments) * 100),
          recommendedAction: avgSentimentScore < -0.2 ? 'Immediate attention needed' :
              avgSentimentScore < 0 ? 'Monitor closely' : 'Generally positive feedback'
        }
      };

      console.log('Pain Points Inferred...', response_data);
      res.json(response_data);
    } catch (error: any) {
      console.error('Error analyzing post comments:', error);
      res.status(500).json({ error: "Failed to analyze post comments", details: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
