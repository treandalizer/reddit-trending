# Reddit Trending Posts App

## Overview

This is a modern full-stack web application that displays trending posts from Reddit in a clean, responsive interface. The app fetches trending posts from Reddit's public API and displays them with features like upvote counts, comment counts, and direct links to the original posts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with custom Reddit-themed color scheme
- **UI Components**: Radix UI primitives with shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **API Design**: RESTful endpoints for Reddit data
- **Error Handling**: Centralized error middleware
- **Logging**: Custom request logging with duration tracking

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Schema**: Defined in shared schema file for type safety
- **Caching**: In-memory storage with time-based invalidation (5-minute cache)
- **Migrations**: Managed through Drizzle Kit

### Authentication and Authorization
- **Current State**: No authentication implemented
- **Session Management**: Basic session infrastructure in place with connect-pg-simple
- **Future-Ready**: Infrastructure exists for adding user authentication

## Key Components

### Database Schema
- **reddit_posts table**: Stores fetched Reddit posts with metadata
- **Fields**: id, redditId, title, author, subreddit, upvotes, numComments, permalink, createdUtc, fetchedAt
- **Indexing**: Unique constraint on redditId to prevent duplicates

### API Endpoints
- **GET /api/trending**: Fetches trending posts with intelligent caching
- **POST /api/trending/refresh**: Manual refresh endpoint for fresh data

### Frontend Components
- **PostCard**: Displays individual Reddit posts with voting UI
- **LoadingSkeleton**: Animated loading states
- **Home**: Main page component with auto-refresh functionality

### External Dependencies
- **Reddit API**: Public JSON endpoints for trending posts
- **Neon Database**: Serverless PostgreSQL hosting
- **Radix UI**: Headless UI components for accessibility

## Data Flow

1. **Initial Load**: Frontend requests trending posts from `/api/trending`
2. **Cache Check**: Backend checks for recent posts (< 5 minutes old)
3. **Cache Hit**: Returns cached data immediately
4. **Cache Miss**: Fetches fresh data from Reddit API
5. **Data Transform**: Converts Reddit API response to internal schema
6. **Storage**: Saves transformed data to PostgreSQL
7. **Response**: Returns formatted data to frontend
8. **Auto-Refresh**: Frontend automatically refetches every 5 minutes

## External Dependencies

### Reddit API Integration
- **Endpoint**: `https://www.reddit.com/r/popular.json`
- **Rate Limiting**: Handled through caching strategy
- **Error Handling**: Graceful degradation on API failures

### Database Integration
- **Provider**: Neon Database (serverless PostgreSQL)
- **Connection**: Environment variable-based configuration
- **ORM**: Drizzle for type-safe database operations

### UI Libraries
- **Radix UI**: Accessible, unstyled components
- **Lucide Icons**: Consistent icon system
- **React Icons**: Additional icon library for brand icons

## Deployment Strategy

### Development
- **Dev Server**: Vite development server with HMR
- **Backend**: tsx for TypeScript execution
- **Database**: Development database migrations

### Production Build
- **Frontend**: Static files built with Vite
- **Backend**: Bundled with esbuild for Node.js
- **Database**: Production migrations with Drizzle

### Environment Configuration
- **Required Variables**: DATABASE_URL for PostgreSQL connection
- **Optional Features**: Replit-specific development tools
- **Build Process**: Automated build pipeline for client and server

The application follows a clean separation of concerns with shared TypeScript types, making it maintainable and type-safe across the full stack.

## Recent Changes

### Latest modifications with dates
- **2025-01-15**: Added topic search functionality with advanced filtering options
- **2025-01-15**: Implemented tabbed interface separating trending posts from search results
- **2025-01-15**: Added `/api/search` endpoint for Reddit topic searches with caching
- **2025-01-15**: Enhanced UI with search form, validation, and proper error handling
- **2025-01-15**: Fixed search filter bug - now properly handles different sort options (Hot, New, Top, Rising)
- **2025-01-15**: Added comprehensive unit testing infrastructure with Vitest and React Testing Library
- **2025-01-15**: Implemented GitHub Actions CI/CD pipeline for automated testing and deployment
- **2025-01-15**: Created extensive test coverage for components, API routes, storage, and validation
- **2025-01-15**: Fixed server binding issue for local development - changed from `0.0.0.0` to `localhost` in development mode
- **2025-01-15**: User successfully downloaded and ran application locally with `npm run dev`
- **2025-01-15**: Application confirmed working on local machine, ready for deployment or further development

### Known Issues
- **Reddit API Access**: Currently blocked due to security restrictions (403 Forbidden)
- **Solution**: Requires Reddit API credentials (Client ID and Secret) for authentication
- **Status**: Application interface fully functional, awaiting API authentication setup

### Testing Infrastructure
- **Unit Tests**: Comprehensive test suite with Vitest and React Testing Library
- **Coverage**: Tests for components, API routes, storage, and schema validation
- **CI/CD**: GitHub Actions workflow for automated testing and deployment
- **Test Categories**: Component tests, server tests, integration tests, and schema validation
- **Mock Service Worker**: API mocking for realistic testing scenarios