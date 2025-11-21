#!/bin/bash

# Lighthouse Performance Testing Script
# Tests blog pages with Google Lighthouse

echo "🚀 Starting Lighthouse Performance Tests..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if lighthouse is installed
if ! command -v lighthouse &> /dev/null; then
    echo -e "${RED}❌ Lighthouse is not installed${NC}"
    echo -e "${YELLOW}Install it with: npm install -g lighthouse${NC}"
    exit 1
fi

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo -e "${RED}❌ Development server is not running${NC}"
    echo -e "${YELLOW}Start it with: npm run dev${NC}"
    exit 1
fi

# Create reports directory
REPORTS_DIR="./lighthouse-reports"
mkdir -p "$REPORTS_DIR"

echo -e "${BLUE}📊 Testing Blog Pages...${NC}"
echo ""

# Test blog list page
echo -e "${GREEN}Testing: /admin/blogs${NC}"
lighthouse http://localhost:3000/admin/blogs \
  --output=html \
  --output=json \
  --output-path="$REPORTS_DIR/blog-list" \
  --chrome-flags="--headless" \
  --quiet

# Test blog create page
echo -e "${GREEN}Testing: /admin/blogs/new${NC}"
lighthouse http://localhost:3000/admin/blogs/new \
  --output=html \
  --output=json \
  --output-path="$REPORTS_DIR/blog-create" \
  --chrome-flags="--headless" \
  --quiet

echo ""
echo -e "${GREEN}✅ Lighthouse tests complete!${NC}"
echo -e "${BLUE}Reports saved to: $REPORTS_DIR${NC}"
echo ""
echo -e "${YELLOW}View reports:${NC}"
echo "  open $REPORTS_DIR/blog-list.report.html"
echo "  open $REPORTS_DIR/blog-create.report.html"
echo ""

# Parse JSON results and show summary
if command -v jq &> /dev/null; then
    echo -e "${BLUE}📈 Performance Summary:${NC}"
    echo ""
    
    for file in "$REPORTS_DIR"/*.report.json; do
        if [ -f "$file" ]; then
            filename=$(basename "$file" .report.json)
            perf=$(jq -r '.categories.performance.score * 100' "$file")
            accessibility=$(jq -r '.categories.accessibility.score * 100' "$file")
            bestPractices=$(jq -r '.categories["best-practices"].score * 100' "$file")
            seo=$(jq -r '.categories.seo.score * 100' "$file")
            
            echo -e "${GREEN}$filename:${NC}"
            echo "  Performance:     ${perf}%"
            echo "  Accessibility:   ${accessibility}%"
            echo "  Best Practices:  ${bestPractices}%"
            echo "  SEO:             ${seo}%"
            echo ""
        fi
    done
else
    echo -e "${YELLOW}Install 'jq' to see performance summary: brew install jq${NC}"
fi
