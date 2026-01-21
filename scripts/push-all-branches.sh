#!/bin/bash

# Push all branches to remote repository
# Usage: ./scripts/push-all-branches.sh

set -e

echo "🚀 Pushing all branches to remote..."

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ Error: No remote 'origin' configured."
    echo "   Add remote first: git remote add origin <your-repo-url>"
    exit 1
fi

# Push main branch
echo "📤 Pushing main branch..."
git push -u origin main

# Push staging branch
echo "📤 Pushing staging branch..."
git push -u origin staging

# Push develop branch
echo "📤 Pushing develop branch..."
git push -u origin develop

echo ""
echo "✅ All branches pushed successfully!"
echo ""
echo "🔗 Remote URL: $(git remote get-url origin)"
echo ""
echo "📋 Next Steps:"
echo "  1. Set up branch protection rules in GitHub"
echo "  2. Configure AWS Amplify app to connect to this repository"
echo "  3. Set up environment variables in Amplify Console"
echo ""
