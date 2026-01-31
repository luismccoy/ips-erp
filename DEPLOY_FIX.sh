#!/bin/bash
set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  AWS Amplify Homepage Fix Deployment Script               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Install the required plugin
echo "📦 Step 1: Installing vite-plugin-static-copy..."
npm install --save-dev vite-plugin-static-copy
echo "✓ Plugin installed"
echo ""

# Step 2: Backup current files
echo "💾 Step 2: Backing up current files..."
cp vite.config.ts vite.config.ts.backup
cp amplify.yml amplify.yml.backup
echo "✓ Backups created:"
echo "  - vite.config.ts.backup"
echo "  - amplify.yml.backup"
echo ""

# Step 3: Apply fixes
echo "🔧 Step 3: Applying fixes..."
cp vite.config.ts.FIXED vite.config.ts
cp amplify.yml.FIXED amplify.yml
echo "✓ Files updated"
echo ""

# Step 4: Test build locally
echo "🏗️  Step 4: Testing build locally..."
npm run build
echo ""

# Step 5: Verify output
echo "🔍 Step 5: Verifying build output..."
echo ""
echo "Checking for homepage/index.html:"
if [ -f "dist/homepage/index.html" ]; then
    SIZE=$(wc -c < dist/homepage/index.html)
    echo "  ✓ Found! Size: $SIZE bytes (expected ~30KB)"
    if [ $SIZE -lt 5000 ]; then
        echo "  ⚠️  WARNING: File is too small! Expected ~30KB"
    fi
else
    echo "  ✗ NOT FOUND - Build failed!"
    exit 1
fi
echo ""

echo "Checking for images:"
if [ -d "dist/images" ]; then
    IMAGE_COUNT=$(ls -1 dist/images/*.jpg 2>/dev/null | wc -l)
    echo "  ✓ Found! Images: $IMAGE_COUNT"
else
    echo "  ✗ images/ directory not found"
    exit 1
fi
echo ""

# Step 6: Git commit
echo "📝 Step 6: Committing changes..."
git add vite.config.ts amplify.yml package.json package-lock.json
git commit -m "fix: Add vite-plugin-static-copy to properly deploy homepage and images

- Install vite-plugin-static-copy to handle public/ subdirectories
- Copy homepage/ and images/ during Vite build
- Simplify amplify.yml build commands
- Fixes homepage serving React app instead of beta landing page"
echo "✓ Changes committed"
echo ""

# Step 7: Push to trigger Amplify build
echo "🚀 Step 7: Push to deploy..."
read -p "Push to origin/main to trigger Amplify deployment? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin main
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║  ✓ DEPLOYMENT INITIATED                                    ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Monitor deployment at:"
    echo "https://us-east-1.console.aws.amazon.com/amplify/home?region=us-east-1#/d2wwgecog8smmr"
    echo ""
    echo "After deployment completes, verify:"
    echo "  curl -s https://main.d2wwgecog8smmr.amplifyapp.com/homepage/ | wc -c"
    echo "  (should show ~30KB, not 1599 bytes)"
else
    echo ""
    echo "Deployment skipped. To deploy later, run:"
    echo "  git push origin main"
fi
echo ""
echo "Done! 🎉"
