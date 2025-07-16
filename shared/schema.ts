import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const redditPosts = pgTable("reddit_posts", {
  id: serial("id").primaryKey(),
  redditId: text("reddit_id").notNull().unique(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  subreddit: text("subreddit").notNull(),
  upvotes: integer("upvotes").notNull(),
  numComments: integer("num_comments").notNull(),
  permalink: text("permalink").notNull(),
  createdUtc: integer("created_utc").notNull(),
  fetchedAt: timestamp("fetched_at").defaultNow(),
});

export const insertRedditPostSchema = createInsertSchema(redditPosts).omit({
  id: true,
  fetchedAt: true,
});

export type InsertRedditPost = z.infer<typeof insertRedditPostSchema>;
export type RedditPost = typeof redditPosts.$inferSelect;

// Additional types for Reddit API response
export interface RedditApiResponse {
  data: {
    children: Array<{
      data: {
        id: string;
        title: string;
        author: string;
        subreddit: string;
        ups: number;
        num_comments: number;
        permalink: string;
        created_utc: number;
        selftext?: string; // Optional text content of the post
      };
    }>;
  };
}

// Search request schema
export const searchRequestSchema = z.object({
  topic: z.string().min(1, "Topic is required").max(100, "Topic must be less than 100 characters"),
  sortBy: z.enum(["hot", "new", "top", "rising"]).default("hot"),
  timeFilter: z.enum(["all", "year", "month", "week", "day", "hour"]).default("all"),
});

export type SearchRequest = z.infer<typeof searchRequestSchema>;
