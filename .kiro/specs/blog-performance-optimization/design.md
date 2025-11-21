# Blog Performance Optimization - Design

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React Query Cache (5min stale, 10min cache)          │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │
│  │  │  Blogs   │  │Categories│  │   Tags   │            │ │
│  │  └──────────┘  └──────────┘  └──────────┘            │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ↓                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  useBlogOptimized Hook                                 │ │
│  │  - Pagination logic                                    │ │
│  │  - Filter management                                   │ │
│  │  - Performance monitoring                              │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  Supabase (Database)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Optimized Queries with Indexes                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  blogs table (indexed)                           │ │ │
│  │  │  - idx_blogs_created_at                          │ │ │
│  │  │  - idx_blogs_category_id                         │ │ │
│  │  │  - idx_blogs_is_published                        │ │ │
│  │  │  - idx_blogs_slug                                │ │ │
│  │  │  - idx_blogs_article_name_trgm (full-text)      │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Database Design

### Index Strategy

#### Primary Indexes
```sql
-- Sorting index (most common operation)
CREATE INDEX idx_blogs_created_at ON blogs(created_at DESC);

-- Filtering indexes
CREATE INDEX idx_blogs_category_id ON blogs(category_id);
CREATE INDEX idx_blogs_is_published ON blogs(is_published);
CREATE INDEX idx_blogs_is_draft ON blogs(is_draft);

-- SEO index
CREATE INDEX idx_blogs_slug ON blogs(slug);
```

#### Composite Indexes
```sql
-- Common query pattern: published blogs sorted by date
CREATE INDEX idx_blogs_published_created 
ON blogs(is_published, created_at DESC);

-- Draft blogs sorted by date
CREATE INDEX idx_blogs_draft_created 
ON blogs(is_draft, created_at DESC);
```

#### Full-Text Search Indexes
```sql
-- Enable trigram extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Search indexes
CREATE INDEX idx_blogs_article_name_trgm 
ON blogs USING gin(article_name gin_trgm_ops);

CREATE INDEX idx_blogs_article_body_trgm 
ON blogs USING gin(article_body gin_trgm_ops);
```

#### Junction Table Indexes
```sql
-- For efficient tag lookups
CREATE INDEX idx_blog_post_tags_blog_id ON blog_post_tags(blog_id);
CREATE INDEX idx_blog_post_tags_tag_id ON blog_post_tags(tag_id);
CREATE INDEX idx_blog_post_tags_blog_tag ON blog_post_tags(blog_id, tag_id);
```

### Query Optimization Strategy

#### Before (Slow)
```javascript
// Fetches ALL blogs with ALL columns
const { data } = await supabase
  .from("blogs")
  .select("*")
  .order("created_at", { ascending: false });
```

#### After (Fast)
```javascript
// Fetches only current page with needed columns
const { data } = await supabase
  .from("blogs")
  .select(`
    id,
    article_name,
    slug,
    article_image,
    created_at,
    is_published,
    category:blog_categories(id, name)
  `)
  .range(from, to)  // Pagination
  .order("created_at", { ascending: false });
```

## Component Design

### Pagination Component

```
┌─────────────────────────────────────────────────────────┐
│  Pagination                                              │
│  ┌────────┐  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐  ┌────────┐│
│  │  Prev  │  │ 1 │ │ 2 │ │ 3 │ │...│ │ 10│  │  Next  ││
│  └────────┘  └───┘ └───┘ └───┘ └───┘ └───┘  └────────┘│
│                                                          │
│  Page 2 of 10                                           │
└─────────────────────────────────────────────────────────┘
```

**Features**:
- Smart ellipsis for many pages
- Disabled states for first/last page
- Mobile-responsive design
- Keyboard navigation support

### useBlogOptimized Hook

```javascript
const {
  blogs,           // Current page blogs
  totalCount,      // Total number of blogs
  currentPage,     // Current page number
  totalPages,      // Total pages
  itemsPerPage,    // Items per page (12)
  loading,         // Loading state
  categories,      // All categories (cached)
  tags,            // All tags (cached)
  fetchBlogs,      // Fetch with filters
  fetchBlogById,   // Fetch single blog
  deleteBlog,      // Delete blog
  setCurrentPage,  // Change page
} = useBlogOptimized();
```

**Key Features**:
- Pagination built-in
- Performance monitoring
- Efficient filtering
- Optimized queries

## Performance Monitoring Design

### PerformanceMonitor Utility

```javascript
import { startTimer, endTimer, measureAsync } from '@/utils/performanceMonitor';

// Manual timing
startTimer('fetch-blogs');
const blogs = await fetchBlogs();
endTimer('fetch-blogs');  // Logs: 🟢 fetch-blogs: 45.23ms

// Automatic timing
const blogs = await measureAsync('fetch-blogs', async () => {
  return await fetchBlogs();
});
```

**Color Coding**:
- 🟢 Green: <100ms (Good)
- 🟡 Yellow: 100-500ms (Warning)
- 🔴 Red: >500ms (Slow)

## Caching Strategy

### React Query Configuration

```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      cacheTime: 10 * 60 * 1000,     // 10 minutes
      refetchOnWindowFocus: false,    // Don't refetch on focus
      retry: 1,                       // Retry once on failure
    },
  },
});
```

### Cache Keys Strategy

```javascript
// Blog list with filters
['blogs', page, { category, status, search }]

// Single blog
['blog', blogId]

// Categories (rarely changes)
['categories']

// Tags (rarely changes)
['tags']
```

## Code Splitting Strategy

### Dynamic Imports

```javascript
// Heavy editor component
const BlogEditor = dynamic(
  () => import('@/components/blog/BlogEditor'),
  {
    ssr: false,
    loading: () => <EditorSkeleton />
  }
);

// Image library modal
const ImageLibrary = dynamic(
  () => import('@/components/common/ImageLibrary'),
  { ssr: false }
);
```

### Bundle Structure

```
Main Bundle (250KB)
├── React & Next.js core
├── Common components
└── Layout components

Blog List Page (150KB)
├── BlogGrid component
├── Filters
└── Pagination

Blog Editor Page (200KB)
├── BlogFormFields
├── SEO components
└── Sidebar components

Lazy Loaded (loaded on demand)
├── BlogEditor (react-quill) - 180KB
├── ImageLibrary - 50KB
└── Rich text editor - 120KB
```

## Loading States Design

### Skeleton Screens

```
┌─────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────┐  │
│  │  ████████████████████████████████████████████    │  │ Image
│  │  ████████████████████████████████████████████    │  │
│  └──────────────────────────────────────────────────┘  │
│  ████████████████████████                              │ Title
│  ████████████████                                      │ Subtitle
│  ████████████████████████████████                      │ Description
└─────────────────────────────────────────────────────────┘
```

**Benefits**:
- Better perceived performance
- Reduces layout shift
- Improves user experience

## Error Handling Design

### Graceful Degradation

```javascript
try {
  const blogs = await fetchBlogs();
} catch (error) {
  // Log error
  console.error('Failed to fetch blogs:', error);
  
  // Show user-friendly message
  toast.error('Failed to load blogs. Please try again.');
  
  // Track in monitoring
  trackError('fetch-blogs-failed', error);
  
  // Return cached data if available
  return getCachedBlogs();
}
```

## Mobile Optimization

### Responsive Pagination

```
Desktop:
[Prev] [1] [2] [3] [...] [10] [Next]

Mobile:
[Prev]  Page 2 of 10  [Next]
```

### Touch Optimization
- Larger tap targets (44x44px minimum)
- Swipe gestures for pagination
- Optimized for slow connections

## Accessibility Design

### Keyboard Navigation
- Tab through pagination controls
- Enter/Space to activate
- Arrow keys for page navigation

### Screen Reader Support
- Proper ARIA labels
- Live regions for updates
- Semantic HTML

## Performance Budgets

### Page Load Budgets
- Initial HTML: <50KB
- JavaScript: <500KB
- CSS: <50KB
- Images: <200KB per page

### Runtime Budgets
- Database queries: <500ms
- API responses: <1000ms
- UI interactions: <100ms
- Page transitions: <300ms

## Monitoring & Alerts

### Development Monitoring
```javascript
// Automatic logging in development
if (process.env.NODE_ENV === 'development') {
  if (duration > 500) {
    console.warn(`⚠️ Slow query: ${label} took ${duration}ms`);
  }
}
```

### Production Monitoring
- Track Core Web Vitals
- Monitor error rates
- Alert on performance degradation
- Track user experience metrics

## Testing Strategy

### Performance Tests
```bash
# Database performance
npm run perf:test

# Bundle analysis
npm run perf:analyze

# Lighthouse audit
npm run perf:lighthouse
```

### Load Testing
- Test with 100+ blogs
- Test with slow network (3G)
- Test on mobile devices
- Test with concurrent users

## Rollout Strategy

### Phase 1: Database (No User Impact)
1. Add indexes during low-traffic period
2. Run ANALYZE to update statistics
3. Monitor query performance

### Phase 2: Pagination (Gradual Rollout)
1. Deploy to staging
2. Test thoroughly
3. Deploy to production
4. Monitor for issues

### Phase 3: Caching (Feature Flag)
1. Enable for internal users
2. Monitor cache hit rates
3. Gradually roll out to all users

### Phase 4: Code Splitting (Transparent)
1. Deploy with build
2. Monitor bundle sizes
3. Track loading performance

## Success Metrics

### Technical Metrics
- Query time: <500ms (from 2000ms)
- Page load: <1s (from 3s+)
- Bundle size: <500KB (from 800KB+)
- Cache hit rate: >80%

### User Experience Metrics
- Lighthouse score: >85 (from ~60)
- Time to Interactive: <3s
- First Contentful Paint: <1.5s
- Cumulative Layout Shift: <0.1

### Business Metrics
- Reduced server load: 80%
- Improved user satisfaction
- Faster content creation
- Better SEO rankings
