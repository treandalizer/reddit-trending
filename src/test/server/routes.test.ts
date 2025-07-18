import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { registerRoutes } from '../../../server/routes';
import type { Express } from 'express';
import express from 'express';
import { storage } from '../../../server/storage';

// Mock storage
vi.mock('../../../server/storage', () => ({
  storage: {
    getTrendingPosts: vi.fn(),
    saveTrendingPosts: vi.fn(),
    clearOldPosts: vi.fn(),
    getTopicPosts: vi.fn(),
    saveTopicPosts: vi.fn(),
    clearTopicPosts: vi.fn(),
    getUser: vi.fn(),
    getUserByUsername: vi.fn(),
    createUser: vi.fn(),
  },
}));

describe('API Routes', () => {
  let app: Express;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    
    // Reset mocks before setting up routes
    vi.clearAllMocks();
    vi.resetAllMocks();
    
    await registerRoutes(app);
  });

  describe('GET /api/trending', () => {
    it('returns cached posts when available and recent', async () => {
      const mockPosts = [
        {
          id: 1,
          redditId: 'test1',
          title: 'Test Post',
          author: 'testuser',
          subreddit: 'test',
          upvotes: 100,
          numComments: 50,
          permalink: 'https://reddit.com/test',
          createdUtc: 1640995200,
          fetchedAt: '2025-07-16T10:39:40.736Z', // Use string instead of Date object
        },
      ];

      vi.mocked(storage.getTrendingPosts).mockResolvedValue(mockPosts);

      const response = await request(app).get('/api/trending');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPosts);
      expect(storage.getTrendingPosts).toHaveBeenCalled();
    });

    it('returns 500 when no cached data and Reddit API fails', async () => {
      vi.mocked(storage.getTrendingPosts).mockResolvedValue([]);
      vi.mocked(storage.saveTrendingPosts).mockResolvedValue();
      vi.mocked(storage.clearOldPosts).mockResolvedValue();

      // Mock fetch to simulate Reddit API failure
      global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));

      const response = await request(app).get('/api/trending');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Reddit API is currently unavailable');
    });
  });

  describe('POST /api/trending/refresh', () => {
    it('returns 500 when Reddit API is unavailable', async () => {
      vi.mocked(storage.clearOldPosts).mockResolvedValue();
      vi.mocked(storage.saveTrendingPosts).mockResolvedValue();

      // Mock fetch to simulate Reddit API failure
      global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));

      const response = await request(app).post('/api/trending/refresh');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
      expect(storage.clearOldPosts).toHaveBeenCalledOnce();
    });
  });

  describe('POST /api/search', () => {
    it('validates request body', async () => {
      const response = await request(app)
        .post('/api/search')
        .send({ topic: '' }); // Invalid: empty topic

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid search parameters');
    });

    it('returns cached results when available and recent', async () => {
      const mockPosts = [
        {
          id: 1,
          redditId: 'search1',
          title: 'Technology Post',
          author: 'techuser',
          subreddit: 'technology',
          upvotes: 500,
          numComments: 100,
          permalink: 'https://reddit.com/technology',
          createdUtc: 1640995200,
          fetchedAt: '2025-07-16T10:39:40.736Z', // Use string instead of Date object
        },
      ];

      vi.mocked(storage.getTopicPosts).mockResolvedValue(mockPosts);

      const response = await request(app)
        .post('/api/search')
        .send({
          topic: 'technology',
          sortBy: 'hot',
          timeFilter: 'all',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPosts);
      expect(storage.getTopicPosts).toHaveBeenCalledWith('technology:hot:all');
    });

    it('returns 500 when no cached data and Reddit API fails', async () => {
      vi.mocked(storage.getTopicPosts).mockResolvedValue([]);
      vi.mocked(storage.saveTopicPosts).mockResolvedValue();
      vi.mocked(storage.clearTopicPosts).mockResolvedValue();

      // Mock fetch to simulate Reddit API failure
      global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));

      const response = await request(app)
        .post('/api/search')
        .send({
          topic: 'technology',
          sortBy: 'hot',
          timeFilter: 'all',
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });
});