/**
 * Bundle Size Analyzer
 * Analyzes Next.js bundle sizes to identify large dependencies
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getColorForSize(sizeKB) {
  if (sizeKB < 100) return colors.green;
  if (sizeKB < 250) return colors.yellow;
  return colors.red;
}

function printHeader(title) {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

function analyzeBuildManifest() {
  printHeader('NEXT.JS BUILD ANALYSIS');

  const buildManifestPath = path.join(process.cwd(), '.next', 'build-manifest.json');
  
  if (!fs.existsSync(buildManifestPath)) {
    console.log(`${colors.red}❌ Build manifest not found. Run 'npm run build' first.${colors.reset}\n`);
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf8'));
  
  console.log(`${colors.bright}Pages:${colors.reset}`);
  const pages = Object.keys(manifest.pages);
  console.log(`  Total pages: ${pages.length}\n`);

  // Analyze blog-related pages
  const blogPages = pages.filter(p => p.includes('blog'));
  if (blogPages.length > 0) {
    console.log(`${colors.bright}Blog Pages:${colors.reset}`);
    blogPages.forEach(page => {
      console.log(`  📄 ${page}`);
      const files = manifest.pages[page];
      if (files && files.length > 0) {
        console.log(`     Chunks: ${files.length}`);
      }
    });
    console.log();
  }
}

function analyzeStaticDir() {
  printHeader('STATIC ASSETS ANALYSIS');

  const staticDir = path.join(process.cwd(), '.next', 'static');
  
  if (!fs.existsSync(staticDir)) {
    console.log(`${colors.red}❌ Static directory not found. Run 'npm run build' first.${colors.reset}\n`);
    return;
  }

  const chunksDir = path.join(staticDir, 'chunks');
  if (fs.existsSync(chunksDir)) {
    const chunks = fs.readdirSync(chunksDir)
      .filter(f => f.endsWith('.js'))
      .map(file => {
        const filePath = path.join(chunksDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          sizeKB: (stats.size / 1024).toFixed(2)
        };
      })
      .sort((a, b) => b.size - a.size);

    console.log(`${colors.bright}Largest JavaScript Chunks:${colors.reset}`);
    chunks.slice(0, 10).forEach((chunk, i) => {
      const color = getColorForSize(chunk.sizeKB);
      console.log(`  ${i + 1}. ${chunk.name.padEnd(50)} ${color}${formatBytes(chunk.size)}${colors.reset}`);
    });
    console.log();

    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    console.log(`${colors.bright}Total JS Size:${colors.reset} ${formatBytes(totalSize)}\n`);
  }
}

function analyzePackageJson() {
  printHeader('DEPENDENCY ANALYSIS');

  const packagePath = path.join(process.cwd(), 'package.json');
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  const heavyDeps = [
    '@iconify/react',
    'react-quill',
    'react-hot-toast',
    '@supabase/supabase-js',
    'next',
    'react',
    'react-dom'
  ];

  console.log(`${colors.bright}Key Dependencies:${colors.reset}`);
  heavyDeps.forEach(dep => {
    const version = pkg.dependencies?.[dep] || pkg.devDependencies?.[dep];
    if (version) {
      console.log(`  📦 ${dep.padEnd(30)} ${version}`);
    }
  });
  console.log();
}

function generateRecommendations() {
  printHeader('OPTIMIZATION RECOMMENDATIONS');

  console.log(`${colors.yellow}Bundle Size Optimization:${colors.reset}`);
  console.log(`  1. Use dynamic imports for heavy components`);
  console.log(`     Example: const Editor = dynamic(() => import('react-quill'))`);
  console.log(`  2. Implement code splitting for blog pages`);
  console.log(`  3. Use tree-shaking for icon libraries`);
  console.log(`  4. Consider lazy loading images with next/image`);
  console.log(`  5. Remove unused dependencies\n`);

  console.log(`${colors.green}Next Steps:${colors.reset}`);
  console.log(`  1. Run: npm run build -- --profile`);
  console.log(`  2. Install: npm install -D @next/bundle-analyzer`);
  console.log(`  3. Analyze: ANALYZE=true npm run build\n`);
}

// Run analysis
console.log(`${colors.bright}${colors.blue}Starting Bundle Analysis...${colors.reset}\n`);
analyzeBuildManifest();
analyzeStaticDir();
analyzePackageJson();
generateRecommendations();
