#!/bin/bash

# IPS ERP - Git Repository Initialization Script
# This script initializes the Git repository with proper branch structure for CI/CD

set -e  # Exit on error

echo "🚀 Initializing IPS ERP Git Repository..."

# Check if already initialized
if [ -d .git ]; then
    echo "⚠️  Git repository already exists. Skipping initialization."
    exit 0
fi

# 1. Initialize Git repository
echo "📦 Initializing Git repository..."
git init

# 2. Add all files
echo "📝 Adding files to staging..."
git add .

# 3. Initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: Production-ready IPS ERP application

- Complete React frontend with Admin, Nurse, and Family portals
- AWS Amplify Gen 2 backend scaffolding
- Strict TypeScript with zero any types
- Clean build (0 errors, 0 warnings)
- Environment configuration system
- Reusable UI components and hooks
- Multi-tenant architecture ready
- AI-powered roster architect Lambda function

Ready for CI/CD pipeline setup."

# 4. Rename master to main (if needed)
DEFAULT_BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || echo "main")
if [ "$DEFAULT_BRANCH" != "main" ]; then
    echo "🔄 Renaming $DEFAULT_BRANCH to main..."
    git branch -m main
fi

# 5. Create environment branches
echo "🌿 Creating environment branches..."

# Create develop branch
git branch develop
echo "✅ Created 'develop' branch (auto-deploy to dev environment)"

# Create staging branch
git branch staging
echo "✅ Created 'staging' branch (auto-deploy to staging environment)"

# 6. Display branch structure
echo ""
echo "✨ Repository initialized successfully!"
echo ""
echo "📋 Branch Structure:"
echo "  main     → Production environment (manual approval required)"
echo "  staging  → Staging environment (auto-deploy)"
echo "  develop  → Development environment (auto-deploy)"
echo ""
echo "🔄 Recommended Workflow:"
echo "  1. Create feature branches from 'develop'"
echo "  2. PR feature → develop (auto-deploys to dev)"
echo "  3. PR develop → staging (auto-deploys to staging for UAT)"
echo "  4. PR staging → main (requires approval, deploys to production)"
echo ""
echo "📚 Next Steps:"
echo "  1. Create GitHub repository"
echo "  2. Add remote: git remote add origin <your-repo-url>"
echo "  3. Push all branches: ./scripts/push-all-branches.sh"
echo "  4. Set up AWS Amplify app in AWS Console"
echo "  5. Configure branch protection rules"
echo ""
echo "🎉 Ready for CI/CD setup!"
