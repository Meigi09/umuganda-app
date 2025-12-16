# Umuganda Social Impact Tracking Platform

A modern social media platform for sharing and tracking community service activities in Rwanda. Built with Next.js, TypeScript, PostgreSQL, and Prisma, implementing SOLID principles and creational design patterns.

## 📋 Project Overview

**Umuganda** is a mandatory monthly community service conducted nationwide in Rwanda. This platform provides a centralized, engaging way for communities to share their accomplishments, visualize impact, and analyze progress over time—without requiring form filling.

### Key Features

- **Social Media-Style Posting**: Community members share activities with text, images, and location tags
- **Role-Based Access Control**: Three user roles (Community Member, Cell Moderator, District Viewer)
- **Social Engagement**: Like, comment, and repost functionality
- **Analytics & Insights**: Automatic data extraction and aggregation of community impact per Cell, Sector, and District
- **Impact Visualization**: Charts and statistics showing 6-month trends and metrics

---

## 🛠️ Technology Stack

| Layer                  | Technology                              |
| ---------------------- | --------------------------------------- |
| **Frontend & Backend** | Next.js 16 (App Router)                 |
| **Language**           | TypeScript 5                            |
| **Database**           | PostgreSQL 16                           |
| **ORM**                | Prisma 6                                |
| **Authentication**     | NextAuth 5 (Credentials Provider)       |
| **Styling**            | Tailwind CSS 4, PostCSS                 |
| **Image Storage**      | Cloudinary (or local object storage)    |
| **Validation**         | Zod                                     |
| **Testing**            | Jest, React Testing Library, Playwright |
| **Containerization**   | Docker & Docker Compose                 |
| **Version Control**    | Git & GitHub                            |

---

## 🏗️ Architecture & Design Patterns

### System Architecture: MVC + Domain-Driven Design

```
/src
├── /domain          # Core business logic & entities
│   ├── /factories   # Factory Method Pattern (PostFactory)
│   ├── /builders    # Builder Pattern (PostBuilder)
│   └── /services    # Singleton (AnalyticsEngine)
├── /application     # Use cases & services
├── /infrastructure  # Data access & external services
└── /lib            # Utilities, validation, helpers
```

### Implemented Creational Design Patterns

#### 1. **Factory Method Pattern** - Post Creation

- **Location**: `src/domain/factories/PostFactory.ts`
- **Purpose**: Create different post types (Text, Image) without exposing creation logic
- **Classes**:
  - `TextPostFactory`: Creates text-only posts
  - `ImagePostFactory`: Creates posts with 1-5 images
  - `PostFactoryCreator`: Selects appropriate factory

#### 2. **Builder Pattern** - Post Construction

- **Location**: `src/domain/builders/PostBuilder.ts`
- **Purpose**: Construct complex Post objects step-by-step with optional fields
- **Features**:
  - Fluent interface for method chaining
  - Validation at each step
  - Support for hashtags, images, and metadata
  - Reset functionality

#### 3. **Singleton Pattern** - Analytics Engine

- **Location**: `src/domain/services/AnalyticsEngine.ts`
- **Purpose**: Single instance manages all analytics aggregation across the platform
- **Responsibilities**:
  - Aggregate national-level statistics
  - Calculate per-location metrics (Cell, Sector, District)
  - Generate engagement scores
  - Analyze hashtags and activity categories

---

## 📦 Database Schema

### Core Models

- **User**: Community members with roles (COMMUNITY_MEMBER, CELL_MODERATOR, DISTRICT_VIEWER, ADMIN)
- **Post**: Main content with location tags, categories, and engagement data
- **Comment**: User feedback on posts
- **Reaction**: Like/reaction tracking (LIKE, LOVE, HELPFUL, INSPIRING)
- **Repost**: Sharing functionality
- **PostImage**: Media attachments (1-5 per post)
- **Location Models**:
  - **Cell**: Smallest administrative unit
  - **Sector**: Middle administrative unit
  - **District**: Largest unit in platform
- **AnalyticsSnapshot**: Cached aggregated data

### Activity Categories

- CLEANING
- CONSTRUCTION
- ENVIRONMENT
- HEALTH
- EDUCATION
- INFRASTRUCTURE
- AGRICULTURE
- SOCIAL_SERVICES
- OTHER

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (for containerized setup)
- PostgreSQL 16 (if running locally)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/umuganda-app.git
cd umuganda-app
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**

```bash
cp .env.example .env.local
```

Update `.env.local` with your database and authentication settings:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/umuganda_db"

# NextAuth
NEXTAUTH_SECRET="generate-a-random-string-here"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary (optional)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"
```

4. **Setup database**

```bash
# Create migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running with Docker

```bash
# Build and start containers
docker-compose up

# In another terminal, run migrations
docker-compose exec app npm run prisma:migrate
```

Application will be available at `http://localhost:3000`

---

## 📝 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/signin` - User login (NextAuth)

### Posts

- `POST /api/posts` - Create new post (text or image)
- `GET /api/posts` - Get feed with filters (cellId, sectorId, districtId, category)

### Analytics

- `GET /api/analytics/summary?days=180` - Get aggregated statistics

---

## 🧪 Testing

### Run Unit Tests

```bash
npm run test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Generate Coverage Report

```bash
npm run test:coverage
```

### Test Files

- `src/domain/factories/PostFactory.test.ts` - Factory Pattern tests
- `src/domain/builders/PostBuilder.test.ts` - Builder Pattern tests

---

## 🎨 Design & Color Scheme

The platform uses a carefully chosen color palette that reflects Rwanda's green and natural colors:

- **Onyx** (`#0d0a0bff`): Primary dark color for backgrounds
- **Charcoal Blue** (`#454955ff`): Secondary text and accents
- **Lavender Mist** (`#f3eff5ff`): Light background and subtle accents
- **Lime Moss** (`#72b01dff`): Primary action and highlights
- **Green** (`#3f7d20ff`): Secondary actions and borders

---

## 📚 Code Quality

### Principles Followed

- **SOLID Principles**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **Clean Code**: Meaningful naming, small functions, proper error handling
- **Google TypeScript Style Guide**: Consistent code formatting and conventions

### Folder Structure Best Practices

```
src/
├── domain/           # Pure business logic (no dependencies)
├── application/      # Use cases, orchestration
├── infrastructure/   # Data access, external services
└── lib/             # Utilities, validators, helpers
```

---

## 🐳 Docker Deployment

### Build Image

```bash
docker build -t umuganda-app:latest .
```

### Run Container

```bash
docker-compose up --build
```

### Clean Up

```bash
docker-compose down -v
```

---

## 📊 Project Deliverables

### Code

- ✅ Full Next.js application with TypeScript
- ✅ Prisma ORM with PostgreSQL schema
- ✅ NextAuth authentication with role-based access
- ✅ Three creational design patterns (Factory, Builder, Singleton)
- ✅ Comprehensive API routes
- ✅ Unit and integration tests
- ✅ Docker configuration

### Documentation

- ✅ This README
- ✅ Design pattern documentation inline
- ✅ API documentation
- ✅ Database schema documentation

### Deployment

- ✅ Dockerfile for Next.js
- ✅ docker-compose.yml for full stack
- ✅ Environment configuration
- ✅ Health checks

---

## 🚧 Future Enhancements

- Real-time notifications with WebSockets
- Advanced analytics with data export
- Mobile app (React Native)
- Multi-language support
- AI-powered impact insights
- Community gamification features

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 👥 Contributing

Contributions are welcome! Please follow the standard GitHub workflow:

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

---

## 📞 Support

For questions or issues, please open an GitHub issue or contact the development team.
