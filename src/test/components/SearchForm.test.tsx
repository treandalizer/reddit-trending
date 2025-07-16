import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SearchForm } from '@/components/search-form';

describe('SearchForm', () => {
  const mockOnSearch = vi.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  it('renders all form fields', () => {
    render(<SearchForm onSearch={mockOnSearch} isLoading={false} />);
    
    expect(screen.getByLabelText(/topic or subreddit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time filter/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search posts/i })).toBeInTheDocument();
  });

  it('has correct default values', () => {
    render(<SearchForm onSearch={mockOnSearch} isLoading={false} />);
    
    const topicInput = screen.getByLabelText(/topic or subreddit/i);
    expect(topicInput).toHaveValue('');
  });

  it('calls onSearch with correct data when form is submitted', async () => {
    const user = userEvent.setup();
    render(<SearchForm onSearch={mockOnSearch} isLoading={false} />);
    
    const topicInput = screen.getByLabelText(/topic or subreddit/i);
    await user.type(topicInput, 'programming');
    
    const submitButton = screen.getByRole('button', { name: /search posts/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith({
        topic: 'programming',
        sortBy: 'hot',
        timeFilter: 'all',
      });
    });
  });

  it('shows loading state when isLoading is true', () => {
    render(<SearchForm onSearch={mockOnSearch} isLoading={true} />);
    
    expect(screen.getByText(/searching.../i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('validates required topic field', async () => {
    const user = userEvent.setup();
    render(<SearchForm onSearch={mockOnSearch} isLoading={false} />);
    
    const submitButton = screen.getByRole('button', { name: /search posts/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
    
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('updates sort option correctly', async () => {
    const user = userEvent.setup();
    render(<SearchForm onSearch={mockOnSearch} isLoading={false} />);
    
    const topicInput = screen.getByLabelText(/topic or subreddit/i);
    await user.type(topicInput, 'technology');
    
    // Click sort by dropdown
    const sortTrigger = screen.getByRole('combobox', { name: /sort by/i });
    await user.click(sortTrigger);
    
    // Select "Top" option
    const topOption = screen.getByText('Top');
    await user.click(topOption);
    
    const submitButton = screen.getByRole('button', { name: /search posts/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith({
        topic: 'technology',
        sortBy: 'top',
        timeFilter: 'all',
      });
    });
  });
});