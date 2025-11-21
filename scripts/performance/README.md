# Performance Testing Scripts

Comprehensive performance testing tools for the PAAN Membership blog system.

## 🚀 Quick Start

```bash
# Test database query performance
npm run perf:test

# Analyze bundle sizes (requires build first)
npm run build
npm run perf:analyze

# Run Lighthouse tests (requires dev server running)
npm run dev
# In another terminal:
npm run perf:lighthouse

# Run all performance tests
npm run perf:all
```

## 📊 Available Scripts

### 1. Database Performance Test (`perf:test`)

Tests the performance of all blog-related database queries:

- ✅ Fetch all blogs
- ✅ Fetch blogs with relations (categories & tags)
- ✅ Fetch single blog by ID
- ✅ Fetch categories and tags
- ✅ Search functionality
- ✅ Concurrent query performance
- ✅ Image operations

**Usage:**
```bash
npm run perf:test
```

**Output:**
- Color-coded results (🟢 < 100ms, 🟡 100-500ms, 🔴 > 500ms)
- Query execution times
- Recommendations for optimization

### 2. Bundle Size Analyzer (`perf:analyze`)

Analyzes Next.js build output to identify large bundles:

- 📦 Page-level bundle sizes
- 📦 JavaScript chunk analysis
- 📦 Dependency analysis
- 📦 Optimization recommendations

**Usage:**
```bash
npm run build
npm run perf:analyze
```

**Output:**
- Largest JavaScript chunks
- Total bundle size
- Heavy dependencies
- Optimization suggestions

### 3. Lighthouse Performance Test (`perf:lighthouse`)

Runs Google Lighthouse audits on blog pages:

- 🎯 Performance score
- ♿ Accessibility score
- ✅ Best practices score
- 🔍 SEO score

**Prerequisites:**
```bash
# Install Lighthouse globally
npm install -g lighthouse

# Install jq for JSON parsing (optional, for summary)
brew install jq  # macOS
```

**Usage:**
```bash
# Start dev server
npm run dev

# In another terminal
npm run perf:lighthouse
```

**Output:**
- HTML reports in `./lighthouse-reports/`
- JSON data for programmatic analysis
- Performance summary in terminal

### 4. Run All Tests (`perf:all`)

Runs database tests, builds the project, and analyzes bundles:

```bash
npm run perf:all
```

## 🎯 Performance Thresholds

### Database Queries
- 🟢 **Good**: < 100ms
- 🟡 **Warning**: 100-500ms
- 🔴 **Slow**: > 500ms

### Bundle Sizes
- 🟢 **Good**: < 100KB
- 🟡 **Warning**: 100-250KB
- 🔴 **Large**: > 250KB

### Lighthouse Scores
- 🟢 **Good**: > 90
- 🟡 **Needs Improvement**: 50-90
- 🔴 **Poor**: < 50

## 🔧 Performance Monitoring in Code

Use the performance monitor utility in your code:

```javascript
import { startTimer, endTimer, measureAsync } from '@/utils/performanceMonitor';

// Manual timing
startTimer('fetch-blogs');
const blogs = await fetchBlogs();
endTimer('fetch-blogs');

// Automatic timing
const blogs = await measureAsync('fetch-blogs', async () => {
  return await fetchBlogs();
});
```

## 📈 Common Performance Issues & Solutions

### Slow Database Queries

**Problem**: Queries taking > 500ms

**Solutions**:
1. Add database indexes:
   ```sql
   CREATE INDEX idx_blogs_created_at ON blogs(created_at);
   CREATE INDEX idx_blogs_category_id ON blogs(category_id);
   ```

2. Implement pagination:
   ```javascript
   const { data } = await supabase
     .from('blogs')
     .select('*')
     .range(0, 9)  // First 10 items
     .order('created_at', { ascending: false });
   ```

3. Use select() to fetch only needed columns:
   ```javascript
   .select('id, article_name, created_at')  // Instead of '*'
   ```

### Large Bundle Sizes

**Problem**: JavaScript bundles > 250KB

**Solutions**:
1. Dynamic imports for heavy components:
   ```javascript
   const Editor = dynamic(() => import('react-quill'), { ssr: false });
   ```

2. Tree-shake icon libraries:
   ```javascript
   // Instead of: import { Icon } from '@iconify/react';
   import Icon from '@iconify/react/dist/offline';
   import homeIcon from '@iconify/icons-mdi/home';
   ```

3. Code splitting:
   ```javascript
   const BlogEditor = dynamic(() => import('@/components/blog/BlogEditor'));
   ```

### Slow Page Loads

**Problem**: Lighthouse performance score < 50

**Solutions**:
1. Optimize images:
   ```javascript
   import Image from 'next/image';
   <Image src={url} width={800} height={600} loading="lazy" />
   ```

2. Implement caching:
   ```javascript
   import { useQuery } from '@tanstack/react-query';
   
   const { data } = useQuery({
     queryKey: ['blogs'],
     queryFn: fetchBlogs,
     staleTime: 5 * 60 * 1000,  // 5 minutes
   });
   ```

3. Reduce JavaScript execution:
   - Remove unused dependencies
   - Defer non-critical scripts
   - Use CSS instead of JS animations

## 📝 Interpreting Results

### Database Test Results

```
✅ Fetch all blogs                          45.23ms
⚠️  Fetch blogs with relations              234.56ms
🔴 Search blogs by keyword                  678.90ms
```

- **Green (✅)**: Excellent performance, no action needed
- **Yellow (⚠️)**: Acceptable but could be optimized
- **Red (🔴)**: Needs immediate optimization

### Bundle Analysis Results

```
Largest JavaScript Chunks:
1. framework-abc123.js                      245.67 KB
2. main-def456.js                           189.34 KB
3. blog-editor-ghi789.js                    156.78 KB
```

Focus on the largest chunks first for maximum impact.

### Lighthouse Results

```
blog-list:
  Performance:     78%
  Accessibility:   95%
  Best Practices:  87%
  SEO:             92%
```

Prioritize improving the lowest scores.

## 🎓 Best Practices

1. **Run tests regularly**: Before and after major changes
2. **Set up CI/CD**: Automate performance testing in your pipeline
3. **Monitor production**: Use tools like Vercel Analytics or Google Analytics
4. **Set budgets**: Define acceptable thresholds and fail builds if exceeded
5. **Document changes**: Track performance improvements over time

## 🔗 Additional Resources

- [Next.js Performance Docs](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse Scoring Guide](https://web.dev/performance-scoring/)
- [Supabase Performance Tips](https://supabase.com/docs/guides/database/performance)

## 🐛 Troubleshooting

### "Supabase credentials missing"
- Ensure `.env.local` exists with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### "Build manifest not found"
- Run `npm run build` before running bundle analyzer

### "Development server not running"
- Start dev server with `npm run dev` before running Lighthouse tests

### "Lighthouse not found"
- Install globally: `npm install -g lighthouse`

## 📞 Support

For issues or questions, check the main project README or contact the development team.
