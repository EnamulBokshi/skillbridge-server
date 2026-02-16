# Vercel Deployment Guide for SkillBridge Server

This guide will walk you through deploying your SkillBridge server application with Better Auth to Vercel.

## Prerequisites

- Vercel CLI installed globally (`npm i -g vercel` or `pnpm add -g vercel`)
- PostgreSQL database (recommend using Vercel Postgres, Neon, or Supabase)
- Vercel account
- Git repository (optional but recommended)

## Step 1: Project Preparation

### 1.1 Create Vercel Configuration

Create a `vercel.json` file in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/auth/(.*)",
      "dest": "src/server.ts"
    },
    {
      "src": "/(.*)",
      "dest": "src/server.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 1.2 Update package.json Build Script

Ensure your `package.json` has the correct build script for Vercel:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "prisma generate && tsc",
    "postinstall": "prisma generate",
    "start": "node dist/server.ts",
    "vercel-build": "prisma generate && prisma migrate deploy"
  }
}
```

**Important:** The `vercel-build` script will run automatically on Vercel and handle database migrations.

### 1.3 Create an Entry Point for Vercel

Create `api/index.ts` (Vercel serverless function entry point):

```typescript
import "../src/config/config.js";
import app from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";

// Initialize database connection
prisma.$connect()
  .then(() => console.log('Database connected'))
  .catch((error) => console.error('Database connection error:', error));

// Export for Vercel serverless
export default app;
```

Alternatively, modify `src/server.ts` to support both local and serverless environments:

```typescript
import "./config/config.js";
import app from "./app.js";
import { prisma } from "./lib/prisma.js";

const PORT = process.env.PORT || 5000;

async function server(){
    try {
        await prisma.$connect();
        console.log('Database connected successfully');
        app.listen(PORT, ()=> {
            console.log(`The server is running on ${process.env.APP_URL || 'http://localhost:5000'}`)
        })
    } catch (error) {
        console.error('An error occured: ', error)
        await prisma.$disconnect();
        process.exit(1)
    }
}

// Only start server if not in serverless environment
if (process.env.VERCEL !== '1') {
    server();
}

// Export for Vercel
export default app;
```

## Step 2: Environment Variables Setup

### 2.1 Required Environment Variables

You'll need to set these in Vercel Dashboard or via CLI:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Better Auth Configuration
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=https://your-app.vercel.app
APP_URL=https://your-app.vercel.app

# Email Configuration (for Better Auth)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Default Avatar URL (optional)
DEFAULT_AVATAR_URL=https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y

# Node Environment
NODE_ENV=production
```

### 2.2 Update CORS Configuration

Update `src/app.ts` to include your production URL:

```typescript
app.use(cors({
    origin: [
        "http://localhost:3000", 
        "http://localhost:5000",
        "https://your-frontend-app.vercel.app", // Add your frontend URL
        process.env.APP_URL || ""
    ].filter(Boolean),
    credentials: true
}));
```

## Step 3: Database Setup

### Option A: Vercel Postgres (Recommended for Vercel)

1. Go to your Vercel dashboard
2. Navigate to Storage → Create Database → Postgres
3. Copy the `DATABASE_URL` connection string
4. Add it to your environment variables

### Option B: External Database (Neon, Supabase, Railway)

1. Create a PostgreSQL database on your preferred provider
2. Get the connection string with SSL mode
3. Add `?sslmode=require` or `?ssl=true` to the connection string
4. Add to environment variables

### 3.1 Run Migrations on Production Database

Before deploying, test your migrations:

```bash
# Set DATABASE_URL to your production database
export DATABASE_URL="your-production-db-url"

# Run migrations
npx prisma migrate deploy

# Or if using pnpm
pnpm prisma migrate deploy
```

## Step 4: Deploy to Vercel

### 4.1 Login to Vercel

```bash
vercel login
```

### 4.2 Initial Deployment

Navigate to your project directory and run:

```bash
vercel
```

This will:
- Link your project to Vercel (or create a new project)
- Ask for project name
- Deploy to a preview URL

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Select your account/team
- **Link to existing project?** No (for first deployment)
- **Project name?** skill-bridge-server (or your preferred name)
- **Directory?** ./ (current directory)
- **Override settings?** No

### 4.3 Set Environment Variables via CLI

```bash
# Set production environment variables
vercel env add DATABASE_URL production
# Paste your DATABASE_URL when prompted

vercel env add BETTER_AUTH_SECRET production
# Paste your secret key when prompted

vercel env add BETTER_AUTH_URL production
# Paste your production URL when prompted

vercel env add APP_URL production
# Paste your production URL when prompted

# Add other environment variables similarly
vercel env add EMAIL_HOST production
vercel env add EMAIL_PORT production
vercel env add EMAIL_USER production
vercel env add EMAIL_PASSWORD production
```

Or set them all at once via Vercel Dashboard:
1. Go to your project settings
2. Navigate to Environment Variables
3. Add all required variables

### 4.4 Deploy to Production

```bash
vercel --prod
```

This deploys to your production domain (e.g., `skill-bridge-server.vercel.app`).

## Step 5: Post-Deployment Configuration

### 5.1 Update Better Auth Configuration

After deployment, update your Better Auth settings:

1. Get your production URL (e.g., `https://skill-bridge-server.vercel.app`)
2. Update environment variables:
   - `BETTER_AUTH_URL=https://skill-bridge-server.vercel.app`
   - `APP_URL=https://skill-bridge-server.vercel.app`

3. Update trusted origins in `src/lib/auth.ts`:

```typescript
const trustedOrigins = [
  process.env.APP_URL,
  process.env.BETTER_AUTH_URL,
  "https://your-frontend-app.vercel.app", // Add your frontend
  "http://localhost:3000", // Keep for local development
  "http://localhost:5000",
].filter((origin): origin is string => Boolean(origin));
```

### 5.2 Redeploy After Configuration Changes

```bash
vercel --prod
```

## Step 6: Verify Deployment

### 6.1 Test Basic Endpoints

```bash
# Test root endpoint
curl https://your-app.vercel.app/

# Test health check or any public endpoint
curl https://your-app.vercel.app/api/health
```

### 6.2 Test Better Auth

```bash
# Test Better Auth endpoints
curl https://your-app.vercel.app/api/auth/get-session
```

### 6.3 Check Logs

View logs in real-time:

```bash
vercel logs --follow
```

Or check logs in the Vercel Dashboard under Deployments → Your Deployment → Logs.

## Step 7: Domain Configuration (Optional)

### 7.1 Add Custom Domain

```bash
vercel domains add yourdomain.com
```

Or add via Vercel Dashboard:
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records as instructed

### 7.2 Update Environment Variables for Custom Domain

Update `BETTER_AUTH_URL` and `APP_URL` to use your custom domain:

```bash
vercel env rm BETTER_AUTH_URL production
vercel env add BETTER_AUTH_URL production
# Enter: https://yourdomain.com

vercel env rm APP_URL production
vercel env add APP_URL production
# Enter: https://yourdomain.com
```

## Step 8: Continuous Deployment (Optional)

### 8.1 Connect Git Repository

1. Push your code to GitHub/GitLab/Bitbucket
2. In Vercel Dashboard, go to your project
3. Settings → Git → Connect Repository
4. Select your repository

Now every push to your main branch will automatically deploy to production.

### 8.2 Configure Branch Deployments

- Pushes to `main` → Production deployment
- Pushes to other branches → Preview deployments

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Error:** `Can't reach database server`

**Solution:**
- Ensure `DATABASE_URL` has `?sslmode=require` or `?ssl=true`
- Check database allows connections from Vercel IPs
- Verify connection string is correct

#### 2. Better Auth Session Issues

**Error:** `CORS error` or `Session not working`

**Solution:**
- Verify `BETTER_AUTH_URL` matches your deployment URL
- Ensure `trustedOrigins` includes your frontend URL
- Check CORS configuration includes `credentials: true`
- Frontend must send requests with `credentials: 'include'`

#### 3. Prisma Generation Errors

**Error:** `Cannot find Prisma Client`

**Solution:**
- Ensure `postinstall` script runs `prisma generate`
- Check `vercel-build` script includes `prisma generate`
- Verify all schema files are committed to git

#### 4. Environment Variables Not Loading

**Solution:**
- Double-check all environment variables are set in Vercel
- Redeploy after adding new environment variables
- Use `process.env.VARIABLE_NAME` syntax consistently

#### 5. Cold Start Issues

Vercel serverless functions may have cold starts. Consider:
- Using Vercel's Pro plan for better performance
- Implementing connection pooling for database
- Using Prisma's connection pooling (`?connection_limit=1`)

### Debug Commands

```bash
# Check deployment status
vercel ls

# View environment variables
vercel env ls

# Pull environment variables locally for testing
vercel env pull

# View recent logs
vercel logs

# Inspect specific deployment
vercel inspect [deployment-url]
```

## Best Practices

1. **Use Connection Pooling:** For PostgreSQL on Vercel, use connection pooling:
   ```
   DATABASE_URL=postgresql://...?connection_limit=1&pool_timeout=0
   ```

2. **Separate Development and Production:** Use different databases for development and production.

3. **Secure Secrets:** Never commit `.env` files. Use Vercel's environment variables.

4. **Monitor Performance:** Use Vercel Analytics to track performance.

5. **Set Up Alerts:** Configure Vercel to alert you on deployment failures.

6. **Use Preview Deployments:** Test changes in preview deployments before merging to production.

7. **Database Backups:** Regularly backup your production database.

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Better Auth Documentation](https://better-auth.com/docs)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

## Quick Reference Commands

```bash
# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Set environment variable
vercel env add VARIABLE_NAME production

# List deployments
vercel ls

# View logs
vercel logs

# Pull env variables locally
vercel env pull

# Remove deployment
vercel remove [deployment-name]
```

---

**Note:** This guide assumes you're using pnpm as your package manager (as specified in your `package.json`). If using npm or yarn, adjust commands accordingly.

For additional help, join the [Vercel Discord](https://vercel.com/discord) or [Better Auth Discord](https://discord.gg/better-auth).
