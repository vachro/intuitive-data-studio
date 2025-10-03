# Mozart Portal - Sanity Studio

## Overview
This is a Sanity Studio (headless CMS) project for the Mozart Portal. Sanity Studio provides a content management interface for managing blog posts, authors, categories, and YouTube videos.

**Project ID:** yzx3bbg2  
**Dataset:** production

## Current State
- **Status:** Fully configured and running on Replit
- **Last Updated:** October 3, 2025
- **Framework:** Sanity Studio v4.10.2
- **Runtime:** Node.js 20

## Project Structure
```
studio3/
├── schemaTypes/          # Content schemas
│   ├── author.ts        # Author schema
│   ├── blockContent.ts  # Rich text schema
│   ├── category.ts      # Category schema
│   ├── post.ts          # Post schema
│   ├── youtube.ts       # YouTube video schema
│   └── index.ts         # Schema exports
├── static/              # Static assets
├── sanity.config.ts     # Sanity configuration
├── sanity.cli.ts        # CLI configuration
└── package.json         # Dependencies
```

## Important Configuration

### Port Configuration
- **Frontend Port:** 5000 (required by Replit)
- **Host:** 0.0.0.0 (allows Replit proxy access)
- The workflow command uses CLI flags to override default port (3333)

### Workflow
- **Name:** Sanity Studio
- **Command:** `cd studio3 && npm run dev -- --port 5000 --host 0.0.0.0`
- **Output:** webview (shows the Sanity Studio interface)

## CORS Configuration Required

⚠️ **Important:** To access the Sanity Studio, you need to add the Replit domain to your Sanity project's CORS origins:

1. Visit: https://sanity.io/manage/project/yzx3bbg2/api
2. Add these origins to the CORS allow list:
   - `https://*.replit.dev` (for all Replit domains)
   - Or specifically: Your current Replit dev domain
3. Click "Add CORS origin" and save

Without this, you'll see CORS errors when trying to load the Studio.

## Development

### Local Development
```bash
cd studio3
npm install
npm run dev -- --port 5000 --host 0.0.0.0
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run deploy` - Deploy to Sanity

## Content Types
- **Post:** Blog posts with title, content, author, categories
- **Author:** Author information
- **Category:** Post categories
- **Block Content:** Rich text editor configuration
- **YouTube:** YouTube video embeds

## Dependencies
- sanity: ^4.10.2 (main framework)
- @sanity/vision: ^4.10.2 (GROQ query tool)
- react: ^19.1
- react-dom: ^19.1
- styled-components: ^6.1.18

## Deployment
The project is configured for deployment using Replit's deployment system. The build command compiles the Sanity Studio, and the run command serves it in production mode.

## Recent Changes
- **2025-10-03:** Initial Replit setup and Vite host fix
  - Installed Node.js 20 and dependencies
  - Configured port 5000 with host 0.0.0.0
  - Set up Sanity Studio workflow
  - Updated Sanity packages to v4.10.2
  - Created .gitignore for Node.js projects
  - Configured deployment settings
  - Fixed Vite host blocking by setting `allowedHosts: true` in vite.config.ts

## Notes
- Sanity Studio requires authentication to access the content
- The project uses auto-updates feature (can be configured via appId in sanity.cli.ts)
- Telemetry is enabled by default (can be disabled with `npx sanity telemetry disable`)
