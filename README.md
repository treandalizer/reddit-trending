# reddit-trending

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/treandalizer/reddit-trending?utm_source=oss&utm_medium=github&utm_campaign=treandalizer%2Freddit-trending&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

A modern full-stack web application that displays trending Reddit posts and allows users to search for posts on specific topics. Built with React, TypeScript, Express, and Tailwind CSS.

## Features

- **Trending Posts**: View the top 10 trending posts from Reddit
- **Topic Search**: Search for posts on specific topics or subreddits
- **Advanced Filtering**: Sort by Hot, New, Top, or Rising with time filters
- **Responsive Design**: Clean, Reddit-themed interface that works on all devices
- **Smart Caching**: 5-minute cache for better performance
- **Auto-refresh**: Trending posts update automatically every 5 minutes
- **Real-time Updates**: Loading states and error handling

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** components for accessibility
- **TanStack Query** for data fetching
- **Wouter** for routing
- **React Hook Form** with Zod validation

### Backend
- **Node.js** with Express
- **TypeScript** throughout
- **Drizzle ORM** for database operations
- **In-memory storage** with intelligent caching
- **Reddit API** integration

## Prerequisites

Before running the application, ensure you have:

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **Reddit API credentials** (optional, for live data)

## Installation

1. **Clone or download** the project to your local machine

2. **Navigate** to the project directory:
   ```bash
   cd reddit-trending
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

## Configuration

### Environment Variables (Optional)

Create a `.env` file in the root directory for optional configuration:

```env
NODE_ENV=development
PORT=5000
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
```

### Getting Reddit API Credentials

To enable live Reddit data fetching:

1. Go to https://www.reddit.com/prefs/apps
2. Click "Create App" or "Create Another App"
3. Choose "script" as the app type
4. Fill in a name and description
5. Copy the Client ID (under the app name) and Client Secret
6. Add them to your `.env` file

**Note**: The application will work without API credentials, but will show error messages when trying to fetch live data.

## Running the Application

### Development Mode

Start the development server:

```bash
npm run dev
```

This will:
- Start the Express backend server
- Start the Vite development server for the frontend
- Open the application at `http://localhost:5000`

### Production Build

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Usage

### Trending Posts

1. Visit the application in your browser
2. The **Trending Posts** tab shows the top 10 trending posts from Reddit
3. Posts automatically refresh every 5 minutes
4. Use the "Refresh" button for manual updates

### Search Topics

1. Click the **Search Topics** tab
2. Enter a topic or subreddit name (e.g., "technology", "AI", "r/programming")
3. Choose sorting options:
   - **Sort by**: Hot, New, Top, Rising
   - **Time filter**: All time, Year, Month, Week, Day, Hour
4. Click "Search Posts" to find relevant posts

## Project Structure

```
reddit-explorer/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities
│   └── index.html          # HTML template
├── server/                 # Express backend
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data storage
│   └── vite.ts             # Vite integration
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database and API schemas
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Build configuration
└── tailwind.config.ts      # Styling configuration
```

## API Endpoints

- `GET /api/trending` - Fetch trending posts
- `POST /api/trending/refresh` - Force refresh trending posts
- `POST /api/search` - Search posts by topic

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type checking

## Deployment

### Local Development
The application is configured to run on `localhost` in development mode to avoid port binding issues.

### Production Deployment

#### Option 1: Vercel (Recommended for React Apps)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Build the application:**
   ```bash
   npm run build
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Configure environment variables** in Vercel dashboard:
   - `REDDIT_CLIENT_ID`
   - `REDDIT_CLIENT_SECRET`

#### Option 2: Railway (Full-Stack Node.js)

1. **Create account** at https://railway.app
2. **Connect GitHub repository** or upload project
3. **Configure environment variables:**
   ```
   NODE_ENV=production
   REDDIT_CLIENT_ID=your_client_id
   REDDIT_CLIENT_SECRET=your_client_secret
   ```
4. **Deploy** - Railway automatically detects Node.js and runs build commands

#### Option 3: Render (Free Tier Available)

1. **Create account** at https://render.com
2. **Create new Web Service** from GitHub repository
3. **Configure build settings:**
   - Build Command: `npm run build`
   - Start Command: `npm start`
4. **Set environment variables** in Render dashboard
5. **Deploy** - Automatic deployments on git push

#### Option 4: DigitalOcean App Platform

1. **Create account** at https://digitalocean.com
2. **Create new App** from GitHub repository
3. **Configure build settings:**
   - Build Command: `npm run build`
   - Run Command: `npm start`
4. **Set environment variables**
5. **Deploy** - Supports auto-scaling and custom domains

#### Option 5: Self-Hosted VPS

1. **Set up server** (Ubuntu/CentOS recommended)
2. **Install Node.js and npm:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone and setup application:**
   ```bash
   git clone your-repo-url
   cd reddit-explorer
   npm install
   ```

4. **Create production environment file:**
   ```bash
   nano .env
   ```
   ```
   NODE_ENV=production
   PORT=3000
   REDDIT_CLIENT_ID=your_client_id
   REDDIT_CLIENT_SECRET=your_client_secret
   ```

5. **Build the application:**
   ```bash
   npm run build
   ```

6. **Install PM2 for process management:**
   ```bash
   npm install -g pm2
   ```

7. **Start application with PM2:**
   ```bash
   pm2 start dist/index.js --name reddit-explorer
   pm2 startup
   pm2 save
   ```

8. **Configure reverse proxy (Nginx):**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

#### Option 6: Docker Deployment

1. **Create Dockerfile:**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm install
   
   COPY . .
   RUN npm run build
   
   EXPOSE 5000
   
   CMD ["npm", "start"]
   ```

2. **Create docker-compose.yml:**
   ```yaml
   version: '3.8'
   services:
     reddit-explorer:
       build: .
       ports:
         - "5000:5000"
       environment:
         - NODE_ENV=production
         - REDDIT_CLIENT_ID=${REDDIT_CLIENT_ID}
         - REDDIT_CLIENT_SECRET=${REDDIT_CLIENT_SECRET}
       restart: unless-stopped
   ```

3. **Build and run:**
   ```bash
   docker-compose up -d
   ```

### Production Environment Variables

Ensure these environment variables are set in production:

```env
NODE_ENV=production
PORT=5000
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
```

### Production Optimization

#### Performance Optimizations

1. **Enable compression:**
   ```bash
   npm install compression
   ```

2. **Configure caching headers**
3. **Use CDN for static assets**
4. **Enable HTTP/2**
5. **Implement rate limiting**

#### Security Considerations

1. **Use HTTPS** in production
2. **Set secure headers**
3. **Validate all user inputs**
4. **Keep dependencies updated**
5. **Use environment variables for secrets**

#### Monitoring and Logging

1. **Set up application monitoring** (e.g., New Relic, Datadog)
2. **Configure error tracking** (e.g., Sentry)
3. **Implement health checks**
4. **Set up log aggregation**

### Build Commands Summary

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run check
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Reddit API credentials added
- [ ] Build command succeeds
- [ ] Application starts without errors
- [ ] API endpoints respond correctly
- [ ] Frontend loads properly
- [ ] Error handling works
- [ ] Performance is acceptable
- [ ] Security headers configured
- [ ] Monitoring set up

## Troubleshooting

### Common Issues

**Port 5000 is busy:**
- The application will automatically find another available port
- Check the terminal output for the actual port number

**Reddit API errors:**
- The application shows error messages when Reddit API is unavailable
- Add Reddit API credentials to `.env` file for reliable data access
- Some networks may block Reddit API requests

**Build errors:**
- Ensure Node.js version 18 or higher is installed
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

**Type errors:**
- Run `npm run check` to see TypeScript errors
- Ensure all dependencies are properly installed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Ensure all dependencies are installed correctly
3. Verify Node.js version compatibility
4. Check browser console for error messages

## Acknowledgments

- **Reddit API** for providing the data
- **Radix UI** for accessible components
- **Tailwind CSS** for utility-first styling
- **TanStack Query** for data fetching
- **Vite** for fast development builds