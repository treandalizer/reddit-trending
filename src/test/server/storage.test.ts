import { describe, it, expect, beforeEach } from 'vitest';
import { MemStorage } from '../../../server/storage';
import type { InsertRedditPost } from '@shared/schema';

describe('MemStorage', () => {
  let storage: MemStorage;

  beforeEach(() => {
    storage = new MemStorage();
  });

  describe('Trending Posts', () => {
    it('saves and retrieves trending posts', async () => {
      const mockPosts: InsertRedditPost[] = [
        {
          redditId: 'test1',
          title: 'Test Post 1',
          author: 'user1',
          subreddit: 'test',
          upvotes: 100,
          numComments: 50,
          permalink: 'https://reddit.com/test1',
          createdUtc: 1640995200,
        },
        {
          redditId: 'test2',
          title: 'Test Post 2',
          author: 'user2',
          subreddit: 'test',
          upvotes: 200,
          numComments: 25,
          permalink: 'https://reddit.com/test2',
          createdUtc: 1640995100,
        },
      ];

      await storage.saveTrendingPosts(mockPosts);
      const retrievedPosts = await storage.getTrendingPosts();

      expect(retrievedPosts).toHaveLength(2);
      expect(retrievedPosts[0].title).toBe('Test Post 2'); // Sorted by upvotes descending
      expect(retrievedPosts[1].title).toBe('Test Post 1');
    });

    it('clears old posts', async () => {
      const mockPosts: InsertRedditPost[] = [
        {
          redditId: 'test1',
          title: 'Test Post',
          author: 'user1',
          subreddit: 'test',
          upvotes: 100,
          numComments: 50,
          permalink: 'https://reddit.com/test1',
          createdUtc: 1640995200,
        },
      ];

      await storage.saveTrendingPosts(mockPosts);
      await storage.clearOldPosts();
      const retrievedPosts = await storage.getTrendingPosts();

      expect(retrievedPosts).toHaveLength(0);
    });
  });

  describe('Topic Posts', () => {
    it('saves and retrieves topic posts', async () => {
      const mockPosts: InsertRedditPost[] = [
        {
          redditId: 'topic1',
          title: 'Technology Post',
          author: 'techuser',
          subreddit: 'technology',
          upvotes: 500,
          numComments: 100,
          permalink: 'https://reddit.com/topic1',
          createdUtc: 1640995200,
        },
      ];

      await storage.saveTopicPosts('technology', mockPosts);
      const retrievedPosts = await storage.getTopicPosts('technology');

      expect(retrievedPosts).toHaveLength(1);
      expect(retrievedPosts[0].title).toBe('Technology Post');
    });

    it('returns empty array for non-existent topic', async () => {
      const retrievedPosts = await storage.getTopicPosts('nonexistent');
      expect(retrievedPosts).toHaveLength(0);
    });

    it('clears topic posts', async () => {
      const mockPosts: InsertRedditPost[] = [
        {
          redditId: 'topic1',
          title: 'Technology Post',
          author: 'techuser',
          subreddit: 'technology',
          upvotes: 500,
          numComments: 100,
          permalink: 'https://reddit.com/topic1',
          createdUtc: 1640995200,
        },
      ];

      await storage.saveTopicPosts('technology', mockPosts);
      await storage.clearTopicPosts('technology');
      const retrievedPosts = await storage.getTopicPosts('technology');

      expect(retrievedPosts).toHaveLength(0);
    });
  });

  describe('User Management', () => {
    it('creates and retrieves users', async () => {
      const user = await storage.createUser({
        username: 'testuser',
        email: 'test@example.com',
      });

      expect(user.id).toBe(1);
      expect(user.username).toBe('testuser');

      const retrievedUser = await storage.getUser(1);
      expect(retrievedUser).toEqual(user);
    });

    it('finds user by username', async () => {
      await storage.createUser({
        username: 'testuser',
        email: 'test@example.com',
      });

      const foundUser = await storage.getUserByUsername('testuser');
      expect(foundUser?.username).toBe('testuser');
    });

    it('returns undefined for non-existent user', async () => {
      const user = await storage.getUser(999);
      expect(user).toBeUndefined();
    });
  });
});