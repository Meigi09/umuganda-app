# Architecture & Design Patterns Implementation Guide

## System Overview

The Umuganda Social Impact Tracking Platform is built on a layered architecture following Domain-Driven Design (DDD) and the Model-View-Controller (MVC) pattern.

### Layered Architecture Diagram

```
┌─────────────────────────────────────────────┐
│        Presentation Layer (UI)              │
│   (Next.js Pages & Components)              │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│      Application/API Layer                  │
│   (Next.js Routes, Services)                │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│       Domain Layer (Business Logic)         │
│  (Factories, Builders, Services, Entities)  │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│    Infrastructure Layer (Data Access)      │
│      (Prisma, Database, External APIs)     │
└─────────────────────────────────────────────┘
```

## Design Patterns Implementation

### 1. Factory Method Pattern

**File**: `src/domain/factories/PostFactory.ts`

**Purpose**: Encapsulate the creation of different post types without exposing the instantiation logic.

**Structure**:

```typescript
// Abstract base factory
abstract class PostFactory {
  abstract createPost(args: IPostCreationArgs): Promise<IPost>
  abstract getPostType(): string
}

// Concrete factories
class TextPostFactory extends PostFactory { ... }
class ImagePostFactory extends PostFactory { ... }

// Factory creator for easy access
class PostFactoryCreator {
  static getFactory(postType: 'text' | 'image'): PostFactory
}
```

**Usage Example**:

```typescript
// Instead of: new TextPost(...) or new ImagePost(...)
const factory = PostFactoryCreator.getFactory("text");
const post = await factory.createPost({
  content: "Community cleaned the road",
  authorId: "user-123",
  // ... other fields
});
```

**Benefits**:

- Easy to add new post types without modifying existing code
- Consistent validation and creation logic
- Extensible through factory registration

---

### 2. Builder Pattern

**File**: `src/domain/builders/PostBuilder.ts`

**Purpose**: Construct complex Post objects step-by-step with optional fields and validation.

**Structure**:

```typescript
class PostBuilder {
  setContent(content: string): this { ... }
  setAuthorId(authorId: string): this { ... }
  setLocation(cellId, sectorId, districtId): this { ... }
  setCategory(category: ActivityCategory): this { ... }
  addHashtag(tag: string): this { ... }
  addImage(url: string): this { ... }
  build(): Post { ... }
  reset(): this { ... }
}
```

**Usage Example**:

```typescript
const post = new PostBuilder()
  .setContent("Cleaned the community water point")
  .setAuthorId("user-456")
  .setLocation("cell-123", "sector-456", "district-789")
  .setCategory(ActivityCategory.WATER)
  .addHashtag("umuganda")
  .addHashtag("service")
  .addImage("https://example.com/image.jpg")
  .build();
```

**Benefits**:

- Fluent interface for readable code
- Validation at each step
- Easy to handle optional fields (hashtags, images)
- Immutable object creation
- Reset capability for reuse

---

### 3. Singleton Pattern

**File**: `src/domain/services/AnalyticsEngine.ts`

**Purpose**: Ensure a single instance of AnalyticsEngine exists throughout application lifecycle, managing all national-level statistics aggregation.

**Structure**:

```typescript
class AnalyticsEngine {
  private static instance: AnalyticsEngine | null = null

  private constructor(prisma: PrismaClient) { ... }

  static getInstance(prisma: PrismaClient): AnalyticsEngine {
    if (!AnalyticsEngine.instance) {
      AnalyticsEngine.instance = new AnalyticsEngine(prisma)
    }
    return AnalyticsEngine.instance
  }

  async generateSummary(
    startDate: Date,
    endDate: Date
  ): Promise<AnalyticsSummary> { ... }
}
```

**Usage Example**:

```typescript
// Get or create singleton instance
const analytics = AnalyticsEngine.getInstance(prisma);

// Generate 6-month statistics
const summary = await analytics.generateSummary(
  new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
  new Date()
);

// Results include:
// - National totals (posts, comments, reactions, reposts)
// - Top categories and hashtags
// - Per-location stats (cells, sectors, districts)
// - Engagement scores
```

**Benefits**:

- Single source of truth for analytics
- Prevents multiple instances from conflicting
- Lazy initialization (created only when needed)
- Thread-safe implementation
- Efficient resource management

**Lifecycle Statistics Aggregated**:

```typescript
interface AnalyticsSummary {
  period: { startDate: Date; endDate: Date };
  national: {
    totalPosts: number;
    totalComments: number;
    totalReactions: number;
    totalReposts: number;
    totalEngagement: number;
  };
  topCategories: CategoryStats[];
  topHashtags: HashtagStats[];
  cellStats: LocationStats[];
  sectorStats: LocationStats[];
  districtStats: LocationStats[];
  lastUpdated: Date;
}
```

---

## Integration: Patterns Working Together

### Post Creation Flow

```
User Request
    ↓
POST /api/posts
    ↓
PostService.createImagePost()
    ↓
Factory Method Pattern
  ├─ PostFactoryCreator.getFactory('image')
  └─ ImagePostFactory.createPost()
    ↓
Builder Pattern
  ├─ new PostBuilder()
  ├─ .setContent()
  ├─ .setLocation()
  ├─ .setCategory()
  ├─ .addImages()
  └─ .build()
    ↓
Save to Database (Prisma)
    ↓
Analytics Engine (Singleton)
  └─ Auto-aggregates in next batch
```

### Analytics Generation Flow

```
GET /api/analytics/summary
    ↓
AnalyticsEngine.getInstance()
  ├─ Returns existing instance or creates new one
  └─ Single instance guaranteed
    ↓
generateSummary(startDate, endDate)
    ├─ Aggregate national stats
    ├─ Extract categories & hashtags
    ├─ Calculate per-location metrics
    └─ Return AnalyticsSummary
    ↓
Response to Client
```

---

## SOLID Principles in Implementation

### Single Responsibility Principle

- **PostFactory**: Only responsible for post creation
- **PostBuilder**: Only responsible for post assembly
- **AnalyticsEngine**: Only responsible for statistics aggregation
- **PostService**: Coordinates factory and builder usage

### Open/Closed Principle

- Factories: Open for extension (new post types), closed for modification
- Builder: Open for extension (new fields), closed for modification
- AnalyticsEngine: Easily extended with new metrics without changing core logic

### Liskov Substitution Principle

- All PostFactory subclasses can be used interchangeably
- Client code works with abstract `PostFactory` interface

### Interface Segregation Principle

- Small, focused interfaces: `IPost`, `IImagePost`, `IPostCreationArgs`
- Each interface serves specific purpose

### Dependency Inversion Principle

- Depends on abstractions (PostFactory) not concrete classes
- AnalyticsEngine depends on injected PrismaClient
- Services receive dependencies through constructor

---

## Database Design Relationships

```
┌────────┐
│  User  │
├────────┤
│ id     │───┐
│ email  │   │
│ role   │   │
│ cellId │   │
└────────┘   │
    ▲        │
    │        │ (one-to-many)
    │        ▼
    │    ┌────────┐       ┌─────────────┐
    └────│  Cell  │─────→ │  Post       │
         ├────────┤       ├─────────────┤
         │ id     │       │ id          │
         │ name   │       │ content     │
         │ code   │       │ category    │
         └────────┘       │ status      │
              │           │ hashtags[]  │
              │           └──────┬──────┘
              │                  │
         ┌────▼─────┐       ┌────▼──────────┐
         │  Sector  │       │  PostImage     │
         ├──────────┤       ├────────────────┤
         │ id       │       │ id             │
         │ name     │       │ url            │
         │ code     │       │ publicId       │
         └────┬─────┘       │ caption        │
              │             └────────────────┘
         ┌────▼─────────┐
         │  District    │
         ├──────────────┤
         │ id           │
         │ name         │
         │ code         │
         └──────────────┘

┌─────────────┐      ┌─────────────┐
│  Comment    │      │  Reaction   │
├─────────────┤      ├─────────────┤
│ id          │      │ id          │
│ content     │      │ type (enum) │
│ postId (FK) │      │ postId (FK) │
│ authorId(FK)│      │ userId (FK) │
└─────────────┘      └─────────────┘

┌─────────────┐
│  Repost     │
├─────────────┤
│ id          │
│ postId (FK) │
│ authorId(FK)│
│ caption     │
└─────────────┘

┌──────────────────────┐
│ AnalyticsSnapshot    │
├──────────────────────┤
│ id                   │
│ cellId/sectorId/     │
│ districtId           │
│ totalPosts           │
│ totalComments        │
│ totalReactions       │
│ topCategories (JSON) │
│ topHashtags (JSON)   │
└──────────────────────┘
```

---

## Testing Strategy

### Unit Tests

**Factory Pattern Tests** (`PostFactory.test.ts`):

- ✓ TextPostFactory creates valid text posts
- ✓ ImagePostFactory creates posts with images
- ✓ Validation of content length
- ✓ Image count restrictions
- ✓ Factory creator selection

**Builder Pattern Tests** (`PostBuilder.test.ts`):

- ✓ Complete post building with all fields
- ✓ Required field validation
- ✓ Hashtag management and deduplication
- ✓ Image addition and limits
- ✓ Fluent interface chaining
- ✓ Builder reset functionality

**Singleton Tests** (to be created):

- ✓ Single instance guarantee
- ✓ Lazy initialization
- ✓ Analytics generation accuracy

### Integration Tests

- Authentication flow
- Post creation end-to-end
- Analytics aggregation
- Location hierarchy relationships

---

## Conclusion

The Umuganda platform demonstrates mature software engineering practices through:

1. **Clear separation of concerns** across architectural layers
2. **Proven design patterns** for specific problems (Factory, Builder, Singleton)
3. **SOLID principles** ensuring maintainability and extensibility
4. **Comprehensive testing** for critical functionality
5. **Strong type safety** with TypeScript throughout
6. **Database normalization** preventing data anomalies
7. **API documentation** and consistent response formats
