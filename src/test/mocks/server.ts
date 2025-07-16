import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import type { RedditPost } from '@shared/schema';

const mockPosts: RedditPost[] = [
  {
    id: 1,
    redditId: 'test1',
    title: 'Test Post 1',
    author: 'testuser1',
    subreddit: 'test',
    upvotes: 100,
    numComments: 50,
    permalink: 'https://reddit.com/r/test/comments/test1',
    createdUtc: 1640995200,
    fetchedAt: new Date(),
  },
  {
    id: 2,
    redditId: 'test2',
    title: 'Test Post 2',
    author: 'testuser2',
    subreddit: 'test',
    upvotes: 200,
    numComments: 25,
    permalink: 'https://reddit.com/r/test/comments/test2',
    createdUtc: 1640995100,
    fetchedAt: new Date(),
  },
];

export const handlers = [
  http.get('/api/trending', () => {
    return HttpResponse.json(mockPosts);
  }),
  
  http.post('/api/trending/refresh', () => {
    return HttpResponse.json(mockPosts);
  }),
  
  http.post('/api/search', async ({ request }) => {
    const body = await request.json();
    const searchResults = mockPosts.filter(post => 
      post.title.toLowerCase().includes(body.topic.toLowerCase())
    );
    return HttpResponse.json(searchResults);
  }),
];

export const server = setupServer(...handlers);