import { describe, it, expect } from 'vitest';
import { searchRequestSchema, insertRedditPostSchema } from '@shared/schema';

describe('Schema Validation', () => {
  describe('searchRequestSchema', () => {
    it('validates correct search request', () => {
      const validData = {
        topic: 'technology',
        sortBy: 'hot',
        timeFilter: 'all',
      };

      const result = searchRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('rejects empty topic', () => {
      const invalidData = {
        topic: '',
        sortBy: 'hot',
        timeFilter: 'all',
      };

      const result = searchRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects invalid sortBy value', () => {
      const invalidData = {
        topic: 'technology',
        sortBy: 'invalid',
        timeFilter: 'all',
      };

      const result = searchRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects invalid timeFilter value', () => {
      const invalidData = {
        topic: 'technology',
        sortBy: 'hot',
        timeFilter: 'invalid',
      };

      const result = searchRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('insertRedditPostSchema', () => {
    it('validates correct reddit post data', () => {
      const validData = {
        redditId: 'abc123',
        title: 'Test Post Title',
        author: 'testuser',
        subreddit: 'test',
        upvotes: 100,
        numComments: 50,
        permalink: 'https://reddit.com/r/test/comments/abc123',
        createdUtc: 1640995200,
      };

      const result = insertRedditPostSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('rejects missing required fields', () => {
      const invalidData = {
        redditId: 'abc123',
        title: 'Test Post Title',
        // Missing required fields
      };

      const result = insertRedditPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects invalid data types', () => {
      const invalidData = {
        redditId: 'abc123',
        title: 'Test Post Title',
        author: 'testuser',
        subreddit: 'test',
        upvotes: 'invalid', // Should be number
        numComments: 50,
        permalink: 'https://reddit.com/r/test/comments/abc123',
        createdUtc: 1640995200,
      };

      const result = insertRedditPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});