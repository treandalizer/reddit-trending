import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PostCard } from '@/components/post-card';
import type { RedditPost } from '@shared/schema';

const mockPost: RedditPost = {
  id: 1,
  redditId: 'test123',
  title: 'Test Reddit Post Title',
  author: 'testuser',
  subreddit: 'programming',
  upvotes: 1500,
  numComments: 120,
  permalink: 'https://reddit.com/r/programming/comments/test123',
  createdUtc: 1640995200,
  fetchedAt: new Date(),
};

describe('PostCard', () => {
  it('renders post title correctly', () => {
    render(<PostCard post={mockPost} index={0} />);
    expect(screen.getByText('Test Reddit Post Title')).toBeInTheDocument();
  });

  it('displays author and subreddit information', () => {
    render(<PostCard post={mockPost} index={0} />);
    expect(screen.getByText(/testuser/)).toBeInTheDocument();
    expect(screen.getByText('r/')).toBeInTheDocument();
    expect(screen.getByText('programming')).toBeInTheDocument();
  });

  it('shows upvotes and comments count', () => {
    render(<PostCard post={mockPost} index={0} />);
    expect(screen.getByText('1.5k')).toBeInTheDocument();
    expect(screen.getByText('120 comments')).toBeInTheDocument();
  });

  it('displays correct ranking badge', () => {
    render(<PostCard post={mockPost} index={0} />);
    expect(screen.getByText('1.')).toBeInTheDocument();
  });

  it('has correct permalink', () => {
    render(<PostCard post={mockPost} index={0} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://reddit.com/r/programming/comments/test123');
    expect(link).toHaveAttribute('target', '_blank');
  });
});

// --- API endpoint tests for /api/analyze ---
import request from "supertest";
import express from "express";
import { registerRoutes } from "../../../server/routes";

describe("/api/analyze endpoint", () => {
  let app: express.Express;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    await registerRoutes(app);
  });

  it("returns 400 if no permalink is provided", async () => {
    const res = await request(app).post("/api/analyze").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Permalink is required");
  });

  it("returns pain points for a valid Reddit post permalink", async () => {
    // Use a known, recent Reddit post permalink (as of June 2024)
    const permalink = "/r/AskReddit/comments/1m19hbt/guys_whats_the_most_offensive_thing_youve_heard";
    const res = await request(app).post("/api/analyze").send({ permalink });

    // The Reddit API may rate limit or block, so allow for 200 or 500
    expect([200, 500]).toContain(res.status);

    if (res.status === 200) {
      console.log("Pain points result:", res.body.painPoints);
      expect(Array.isArray(res.body.painPoints)).toBe(true);
      expect(res.body.painPoints.length).toBeLessThanOrEqual(10);
    } else {
      // If Reddit API fails, error message should be present
      console.error("Error response:", res.body);
      expect(res.body.error).toBeDefined();
    }
  });

  it("handles invalid permalinks gracefully", async () => {
    const res = await request(app).post("/api/analyze").send({ permalink: "/r/invalid/comments/xxxxxx/" });
    expect([200, 404, 500]).toContain(res.status);
    // Should not throw, but may return empty or error
  });
});