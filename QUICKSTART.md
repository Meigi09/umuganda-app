# Quick Start Guide

## Project Overview

The Umuganda Social Impact Tracking Platform is a modern web application for sharing and tracking community service activities in Rwanda. This guide will help you get started with development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Docker & Docker Compose** - [Download](https://www.docker.com/products/docker-desktop)
- **PostgreSQL 16** (if running locally) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

## Quick Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/umuganda-app.git
cd umuganda-app

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your settings
nano .env.local
```

**Minimum required variables:**

```env
# Database URL - for local development
DATABASE_URL="postgresql://umuganda:umuganda_dev@localhost:5432/umuganda_db"

# Authentication - generate a random string
NEXTAUTH_SECRET="your-random-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3A. Run with Docker (Recommended)

```bash
# Start all services (app + PostgreSQL)
docker-compose up

# Run migrations on first startup (in another terminal)
docker-compose exec app npm run prisma:migrate

# Access the app at http://localhost:3000
```

### 3B. Run Locally

```bash
# Start PostgreSQL (if installed locally)
# On macOS with Homebrew:
brew services start postgresql

# Create database
createdb umuganda_db

# Run Prisma migrations
npm run prisma:migrate

# Start development server
npm run dev

# Access the app at http://localhost:3000
```

## Available Scripts

```bash
# Development
npm run dev           # Start dev server at http://localhost:3000

# Building
npm run build        # Build for production
npm start            # Start production server

# Database
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open Prisma Studio (visual DB explorer)

# Testing
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report

# Linting
npm run lint         # Run ESLint

# Docker
docker-compose up    # Start all services
docker-compose down  # Stop all services
docker-compose logs  # View logs
```

## Project Structure

```
umuganda-app/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication routes
│   │   │   ├── posts/         # Post CRUD operations
│   │   │   ├── comments/      # Comments management
│   │   │   ├── reactions/     # Reactions (likes, etc)
│   │   │   ├── reposts/       # Repost functionality
│   │   │   └── analytics/     # Statistics & insights
│   │   ├── page.tsx           # Home page
│   │   └── layout.tsx         # Root layout
│   │
│   ├── components/            # Reusable React components
│   │   ├── PostCard.tsx       # Individual post display
│   │   ├── Feed.tsx           # Posts feed/timeline
│   │   ├── AnalyticsDashboard.tsx # Stats visualization
│   │   └── index.ts           # Barrel exports
│   │
│   ├── domain/                # Business logic (DDD)
│   │   ├── factories/         # Factory pattern - post creation
│   │   ├── builders/          # Builder pattern - post assembly
│   │   └── services/          # Singleton - analytics engine
│   │
│   ├── application/           # Use cases & orchestration
│   │   └── services/          # Application services
│   │
│   ├── infrastructure/        # External services & data access
│   │   └── (future: file storage, notifications, etc)
│   │
│   └── lib/                   # Utilities & helpers
│       ├── auth.ts            # NextAuth configuration
│       ├── prisma.ts          # Database client
│       ├── validation.ts      # Input validation schemas
│       ├── api-response.ts    # Response formatting
│       └── password.ts        # Password utilities
│
├── prisma/
│   └── schema.prisma         # Database schema
│
├── tests/                    # Test files (mirrors src structure)
│   └── unit/
│
├── public/                   # Static assets
├── app/                      # Legacy layout (keep as-is)
├── Dockerfile                # Docker image configuration
├── docker-compose.yml        # Multi-container setup
├── jest.config.ts           # Jest testing configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies & scripts
├── README.md                # Project documentation
└── ARCHITECTURE.md          # Design patterns guide
```

## Common Tasks

### Creating a New Page

```tsx
// app/my-feature/page.tsx
export default function MyFeaturePage() {
  return (
    <div className="py-8">
      <h1>My Feature</h1>
      {/* Your content */}
    </div>
  );
}
```

### Creating an API Route

```typescript
// app/api/my-endpoint/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { apiSuccess, apiError, HTTP_STATUS } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        apiError("UNAUTHORIZED", "User not authenticated"),
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    // Your logic here
    return NextResponse.json(apiSuccess({ data: "success" }));
  } catch (error) {
    return NextResponse.json(apiError("ERROR", "Something went wrong"), {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
}
```

### Adding a Database Model

```prisma
// prisma/schema.prisma
model MyModel {
  id        String    @id @default(cuid())
  name      String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([name])
}
```

Then run: `npm run prisma:migrate`

### Creating a Test

```typescript
// src/domain/factories/MyFactory.test.ts
describe("MyFactory", () => {
  it("should create instance", () => {
    const result = new MyFactory();
    expect(result).toBeDefined();
  });
});
```

## Database Management

### Open Prisma Studio (Visual DB Explorer)

```bash
npm run prisma:studio
```

Opens at `http://localhost:5555`

### View Database Logs

```bash
# With Docker
docker-compose logs postgres

# Or access PostgreSQL CLI
psql -U umuganda -d umuganda_db
```

### Reset Database (⚠️ Deletes all data)

```bash
# Reset and run migrations
npm run prisma:migrate -- --skip-generate

# Or with Docker
docker-compose exec app npm run prisma:migrate -- --reset
```

## Debugging

### Using Node Inspector

```bash
npm run dev

# In another terminal
node --inspect-brk ./node_modules/.bin/next dev
```

Then open `chrome://inspect` in Chrome DevTools.

### Viewing API Requests

Use built-in Next.js API console or tools like:

- **Postman** - REST client
- **Thunder Client** - VS Code extension
- **curl** - Command line

Example:

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"content":"Test post","category":"CLEANING",...}'
```

## Performance Tips

1. **Use React.memo** for expensive components
2. **Implement image optimization** with Next.js Image component
3. **Code-split pages** using dynamic imports
4. **Cache API responses** appropriately
5. **Use database indexes** for frequently queried fields

## Security Checklist

- ✅ Never commit `.env.local` (it's in `.gitignore`)
- ✅ Use `NEXTAUTH_SECRET` in production (generate with: `openssl rand -base64 32`)
- ✅ Enable HTTPS in production
- ✅ Validate all inputs server-side (we use Zod)
- ✅ Use parameterized queries (Prisma does this)
- ✅ Keep dependencies updated: `npm audit fix`

## Deployment

### To Docker Hub

```bash
docker build -t yourusername/umuganda-app:latest .
docker push yourusername/umuganda-app:latest
```

### To Vercel (Recommended for Next.js)

```bash
npm i -g vercel
vercel
```

### To AWS, GCP, or other cloud providers

See deployment guide in main README.

## Troubleshooting

### Port Already in Use

```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Error

```bash
# Check PostgreSQL is running
pg_isready -h localhost

# Reset connection
npm run prisma:migrate -- --skip-generate
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Docker Issues

```bash
# Clean up all containers and volumes
docker-compose down -v

# Rebuild images
docker-compose up --build
```

## Getting Help

- 📖 [Next.js Docs](https://nextjs.org/docs)
- 📘 [Prisma Docs](https://www.prisma.io/docs)
- 🔐 [NextAuth Docs](https://next-auth.js.org)
- 💻 Open an issue in GitHub
- 💬 Check existing discussions

## Next Steps

1. ✅ Complete the quick setup
2. ✅ Explore the project structure
3. ✅ Read [ARCHITECTURE.md](ARCHITECTURE.md) for design patterns
4. ✅ Start with `npm run dev`
5. ✅ Open http://localhost:3000
6. ✅ Check the code and modify as needed
7. ✅ Run tests with `npm test`
8. ✅ Deploy when ready!

Happy coding! 🎉
