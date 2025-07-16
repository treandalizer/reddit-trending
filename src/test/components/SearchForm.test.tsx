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

  it('has correct form structure and submit button', async () => {
    const user = userEvent.setup();
    render(<SearchForm onSearch={mockOnSearch} isLoading={false} />);
    
    const topicInput = screen.getByLabelText(/topic or subreddit/i);
    await user.type(topicInput, 'programming');
    
    // Test that the form has correct structure
    expect(topicInput).toHaveValue('programming');
    
    // Test that submit button is present and clickable
    const submitButton = screen.getByRole('button', { name: /search posts/i });
    expect(submitButton).toBeEnabled();
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('shows loading state when isLoading is true', () => {
    render(<SearchForm onSearch={mockOnSearch} isLoading={true} />);
    
    expect(screen.getByText(/searching.../i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('validates required topic field', async () => {
    render(<SearchForm onSearch={mockOnSearch} isLoading={false} />);
    
    // Submit empty form
    const form = document.querySelector('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText(/topic is required/i)).toBeInTheDocument();
    });
    
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('displays correct default values for all form fields', () => {
    render(<SearchForm onSearch={mockOnSearch} isLoading={false} />);
    
    const topicInput = screen.getByLabelText(/topic or subreddit/i);
    expect(topicInput).toHaveValue('');
    
    // Check that sort by shows "Hot" as default (using getAllByText to handle multiple)
    expect(screen.getAllByText('Hot')[0]).toBeInTheDocument();
    
    // Check that time filter shows "All Time" as default
    expect(screen.getAllByText('All Time')[0]).toBeInTheDocument();
  });
});