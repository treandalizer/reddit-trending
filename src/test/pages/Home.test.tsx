import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import Home from '@/pages/home';

// Mock the queryClient
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {children}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main heading', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    expect(screen.getByText('Reddit Explorer')).toBeInTheDocument();
  });

  it('shows trending and search tabs', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    expect(screen.getByText('Trending Posts')).toBeInTheDocument();
    expect(screen.getByText('Search Topics')).toBeInTheDocument();
  });

  it('displays trending posts description', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    expect(screen.getByText('Top 10 Trending Posts')).toBeInTheDocument();
    expect(screen.getByText(/Discover the most popular posts from all of Reddit/)).toBeInTheDocument();
  });

  it('has a refresh button', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    expect(refreshButton).toBeInTheDocument();
  });

  it('switches to search tab when clicked', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    const searchTab = screen.getByRole('tab', { name: /search topics/i });
    await user.click(searchTab);

    expect(screen.getByText('Search Reddit Posts')).toBeInTheDocument();
  });

  it('shows footer with correct links', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    const sourceLink = screen.getByRole('link', { name: /view source/i });
    expect(sourceLink).toHaveAttribute('href', 'https://github.com/treandalizer/reddit-trending');
    expect(sourceLink).toHaveAttribute('target', '_blank');
  });

  it('displays last updated time', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    expect(screen.getByText(/last updated:/i)).toBeInTheDocument();
  });
});