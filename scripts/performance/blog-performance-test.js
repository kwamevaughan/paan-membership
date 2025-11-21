/**
 * Blog Performance Testing Script
 * Measures performance of blog operations including:
 * - Page load times
 * - API response times
 * - Database query performance
 */

const { performance } = require('perf_hooks');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function formatTime(ms) {
  if (ms < 100) return `${colors.green}${ms.toFixed(2)}ms${colors.reset}`;
  if (ms < 500) return `${colors.yellow}${ms.toFixed(2)}ms${colors.reset}`;
  return `${colors.red}${ms.toFixed(2)}ms${colors.reset}`;
}

function printHeader(title) {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

function printResult(label, time, threshold = 500) {
  const status = time < threshold ? '✅' : '⚠️';
  console.log(`${status} ${label.padEnd(40)} ${formatTime(time)}`);
}

async function measureQuery(name, queryFn) {
  const start = performance.now();
  try {
    const result = await queryFn();
    const end = performance.now();
    const duration = end - start;
    return { success: true, duration, result };
  } catch (error) {
    const end = performance.now();
    const duration = end - start;
    return { success: false, duration, error: error.message };
  }
}

async function testDatabaseQueries() {
  printHeader('DATABASE QUERY PERFORMANCE');

  // Test 1: Fetch all blogs (optimized - only needed columns)
  const test1 = await measureQuery('Fetch all blogs', async () => {
    const { data, error } = await supabase
      .from('blogs')
      .select(`
        id,
        article_name,
        slug,
        article_image,
        created_at,
        is_published
      `)
      .limit(50)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  });
  printResult('Fetch all blogs', test1.duration, 300);
  if (test1.success) {
    console.log(`   📊 Found ${test1.result.length} blogs`);
  }

  // Test 2: Fetch blogs with relations (optimized)
  const test2 = await measureQuery('Fetch blogs with categories & tags', async () => {
    const { data, error } = await supabase
      .from('blogs')
      .select(`
        id,
        article_name,
        slug,
        created_at,
        is_published,
        category:blog_categories(id, name),
        tags:blog_post_tags(
          tag:blog_tags(id, name)
        )
      `)
      .limit(50)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  });
  printResult('Fetch blogs with relations', test2.duration, 500);

  // Test 3: Fetch single blog
  if (test1.success && test1.result.length > 0) {
    const blogId = test1.result[0].id;
    const test3 = await measureQuery('Fetch single blog by ID', async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          category:blog_categories(id, name),
          tags:blog_post_tags(
            tag:blog_tags(id, name)
          )
        `)
        .eq('id', blogId)
        .single();
      if (error) throw error;
      return data;
    });
    printResult('Fetch single blog by ID', test3.duration, 200);
  }

  // Test 4: Fetch categories
  const test4 = await measureQuery('Fetch all categories', async () => {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  });
  printResult('Fetch all categories', test4.duration, 100);
  if (test4.success) {
    console.log(`   📊 Found ${test4.result.length} categories`);
  }

  // Test 5: Fetch tags
  const test5 = await measureQuery('Fetch all tags', async () => {
    const { data, error } = await supabase
      .from('blog_tags')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  });
  printResult('Fetch all tags', test5.duration, 100);
  if (test5.success) {
    console.log(`   📊 Found ${test5.result.length} tags`);
  }

  // Test 6: Search blogs
  const test6 = await measureQuery('Search blogs by keyword', async () => {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .ilike('article_name', '%blog%')
      .limit(10);
    if (error) throw error;
    return data;
  });
  printResult('Search blogs by keyword', test6.duration, 300);

  // Test 7: Count blogs
  const test7 = await measureQuery('Count total blogs', async () => {
    const { count, error } = await supabase
      .from('blogs')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count;
  });
  printResult('Count total blogs', test7.duration, 100);
}

async function testConcurrentQueries() {
  printHeader('CONCURRENT QUERY PERFORMANCE');

  const start = performance.now();
  
  const results = await Promise.all([
    supabase.from('blogs').select('*').limit(10),
    supabase.from('blog_categories').select('*'),
    supabase.from('blog_tags').select('*'),
  ]);
  
  const end = performance.now();
  const duration = end - start;

  printResult('Fetch blogs + categories + tags (parallel)', duration, 400);
  
  const errors = results.filter(r => r.error);
  if (errors.length > 0) {
    console.log(`   ❌ ${errors.length} queries failed`);
  } else {
    console.log(`   ✅ All queries successful`);
  }
}

async function testImageOperations() {
  printHeader('IMAGE OPERATION PERFORMANCE');

  // Test fetching blogs with images
  const test1 = await measureQuery('Fetch blogs with images', async () => {
    const { data, error } = await supabase
      .from('blogs')
      .select('id, article_name, article_image')
      .not('article_image', 'is', null)
      .limit(20);
    if (error) throw error;
    return data;
  });
  printResult('Fetch blogs with images', test1.duration, 200);
  if (test1.success) {
    console.log(`   📊 Found ${test1.result.length} blogs with images`);
  }
}

async function generateReport() {
  printHeader('PERFORMANCE TEST REPORT');
  
  console.log(`${colors.bright}Test Environment:${colors.reset}`);
  console.log(`  Supabase URL: ${supabaseUrl}`);
  console.log(`  Node Version: ${process.version}`);
  console.log(`  Timestamp: ${new Date().toISOString()}\n`);

  console.log(`${colors.bright}Performance Thresholds:${colors.reset}`);
  console.log(`  ${colors.green}✅ Good${colors.reset}     < 100ms`);
  console.log(`  ${colors.yellow}⚠️  Warning${colors.reset}  100-500ms`);
  console.log(`  ${colors.red}❌ Slow${colors.reset}     > 500ms\n`);

  await testDatabaseQueries();
  await testConcurrentQueries();
  await testImageOperations();

  printHeader('RECOMMENDATIONS');
  console.log(`${colors.yellow}If you see slow queries (> 500ms):${colors.reset}`);
  console.log(`  1. Add database indexes on frequently queried columns`);
  console.log(`  2. Implement pagination for large datasets`);
  console.log(`  3. Use React Query or SWR for client-side caching`);
  console.log(`  4. Consider implementing server-side caching`);
  console.log(`  5. Optimize image loading with lazy loading and CDN\n`);

  console.log(`${colors.green}Next steps:${colors.reset}`);
  console.log(`  Run: npm run perf:analyze - Analyze bundle size`);
  console.log(`  Run: npm run perf:lighthouse - Run Lighthouse audit\n`);
}

// Run all tests
generateReport().catch(console.error);
