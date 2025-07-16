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