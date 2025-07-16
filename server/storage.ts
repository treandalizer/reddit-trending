import { redditPosts, type RedditPost, type InsertRedditPost } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  getTrendingPosts(): Promise<RedditPost[]>;
  saveTrendingPosts(posts: InsertRedditPost[]): Promise<void>;
  clearOldPosts(): Promise<void>;
  getTopicPosts(topic: string): Promise<RedditPost[]>;
  saveTopicPosts(topic: string, posts: InsertRedditPost[]): Promise<void>;
  clearTopicPosts(topic: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, any>;
  private posts: Map<string, RedditPost>;
  private topicPosts: Map<string, Map<string, RedditPost>>;
  currentId: number;
  currentPostId: number;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.topicPosts = new Map();
    this.currentId = 1;
    this.currentPostId = 1;
  }

  async getUser(id: number): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = this.currentId++;
    const user: any = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTrendingPosts(): Promise<RedditPost[]> {
    const posts = Array.from(this.posts.values());
    return posts.sort((a, b) => b.upvotes - a.upvotes).slice(0, 10);
  }

  async saveTrendingPosts(posts: InsertRedditPost[]): Promise<void> {
    // Clear existing posts
    this.posts.clear();
    
    // Add new posts
    posts.forEach(post => {
      const redditPost: RedditPost = {
        ...post,
        id: this.currentPostId++,
        fetchedAt: new Date(),
      };
      this.posts.set(post.redditId, redditPost);
    });
  }

  async clearOldPosts(): Promise<void> {
    this.posts.clear();
  }

  async getTopicPosts(topic: string): Promise<RedditPost[]> {
    const topicPostsMap = this.topicPosts.get(topic.toLowerCase());
    if (!topicPostsMap) {
      return [];
    }
    const posts = Array.from(topicPostsMap.values());
    return posts.sort((a, b) => b.upvotes - a.upvotes).slice(0, 10);
  }

  async saveTopicPosts(topic: string, posts: InsertRedditPost[]): Promise<void> {
    const topicKey = topic.toLowerCase();
    const topicPostsMap = new Map<string, RedditPost>();
    
    posts.forEach(post => {
      const redditPost: RedditPost = {
        ...post,
        id: this.currentPostId++,
        fetchedAt: new Date(),
      };
      topicPostsMap.set(post.redditId, redditPost);
    });
    
    this.topicPosts.set(topicKey, topicPostsMap);
  }

  async clearTopicPosts(topic: string): Promise<void> {
    this.topicPosts.delete(topic.toLowerCase());
  }
}

export const storage = new MemStorage();
