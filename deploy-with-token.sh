#!/bin/bash

# Profit Analysis - Direct Deployment Script with GitHub Token
# This script allows you to deploy directly to another person's GitHub account

echo "🚀 Profit Analysis - Direct GitHub Deployment"
echo "=============================================="
echo ""
echo "This script will deploy the project directly to another GitHub account"
echo "using a Personal Access Token."
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Error: Git is not installed. Please install Git first."
    echo "   Download from: https://git-scm.com/"
    exit 1
fi

# Get repository details
echo "📝 Repository Information"
echo "-------------------------"
read -p "Enter target GitHub username: " GH_USERNAME

if [ -z "$GH_USERNAME" ]; then
    echo "❌ Error: Username cannot be empty"
    exit 1
fi

read -p "Enter repository name (default: profit-analysis): " REPO_NAME
REPO_NAME=${REPO_NAME:-profit-analysis}

echo ""
echo "📍 Target repository: https://github.com/$GH_USERNAME/$REPO_NAME"
echo ""

# Get authentication token
echo "🔑 Authentication"
echo "-----------------"
echo "The repository owner needs to provide a Personal Access Token."
echo ""
echo "To create a token, they should:"
echo "  1. Go to: https://github.com/settings/tokens"
echo "  2. Click 'Generate new token (classic)'"
echo "  3. Enable 'repo' scope"
echo "  4. Click 'Generate token' and copy it"
echo ""
read -sp "Enter Personal Access Token (starts with ghp_): " GH_TOKEN
echo ""
echo ""

if [ -z "$GH_TOKEN" ]; then
    echo "❌ Error: Token cannot be empty"
    exit 1
fi

# Validate token format
if [[ ! $GH_TOKEN =~ ^ghp_ ]]; then
    echo "⚠️  Warning: Token doesn't start with 'ghp_'"
    read -p "Continue anyway? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
        echo "Aborted."
        exit 1
    fi
fi

# Prepare repository
echo ""
echo "📦 Preparing Repository"
echo "-----------------------"

# Check for existing .env file
if [ -f ".env" ]; then
    echo "⚠️  WARNING: .env file detected!"
    echo "   This file contains sensitive credentials and should NOT be committed."
    echo "   Checking .gitignore..."

    if grep -q "^\.env$" .gitignore 2>/dev/null; then
        echo "   ✅ .env is in .gitignore - safe to proceed"
    else
        echo "   ❌ .env is NOT in .gitignore!"
        echo "   Adding .env to .gitignore..."
        echo ".env" >> .gitignore
        echo "   ✅ Added .env to .gitignore"
    fi
fi

# Remove existing git history
if [ -d ".git" ]; then
    echo ""
    echo "🗑️  Removing existing git history..."
    rm -rf .git
    echo "   ✅ Removed existing git configuration"
fi

# Initialize new repository
echo ""
echo "🔧 Initializing new git repository..."
git init
if [ $? -ne 0 ]; then
    echo "❌ Failed to initialize git repository"
    exit 1
fi

# Add all files
echo "📋 Adding files to repository..."
git add .
if [ $? -ne 0 ]; then
    echo "❌ Failed to add files"
    exit 1
fi

# Show what will be committed
echo ""
echo "📄 Files to be committed:"
git status --short | head -20
FILE_COUNT=$(git status --short | wc -l)
if [ $FILE_COUNT -gt 20 ]; then
    echo "   ... and $((FILE_COUNT - 20)) more files"
fi

echo ""
read -p "Proceed with commit? (y/n): " PROCEED
if [ "$PROCEED" != "y" ] && [ "$PROCEED" != "Y" ]; then
    echo "Aborted."
    exit 1
fi

# Create commit
echo ""
echo "💾 Creating commit..."
read -p "Enter commit message (default: 'Initial commit: Profit Analysis Platform'): " COMMIT_MSG
COMMIT_MSG=${COMMIT_MSG:-"Initial commit: Profit Analysis Platform"}

git commit -m "$COMMIT_MSG"
if [ $? -ne 0 ]; then
    echo "❌ Failed to create commit"
    exit 1
fi

# Create remote URL with token (securely)
REPO_URL="https://${GH_TOKEN}@github.com/${GH_USERNAME}/${REPO_NAME}.git"

echo ""
echo "🔗 Adding remote repository..."
git remote add origin "$REPO_URL"

# Push to GitHub
echo ""
echo "⬆️  Pushing to GitHub..."
echo "   Target: https://github.com/$GH_USERNAME/$REPO_NAME"
echo ""

git branch -M main
git push -u origin main

# Check if push was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "=============================================="
    echo "✅ Successfully deployed to GitHub!"
    echo "=============================================="
    echo ""
    echo "📍 Repository URL: https://github.com/$GH_USERNAME/$REPO_NAME"
    echo ""
    echo "🔒 Security Steps:"
    echo "   1. Token has been cleared from memory"
    echo "   2. Repository owner should revoke the token now"
    echo "   3. Go to: https://github.com/settings/tokens"
    echo ""
    echo "📝 Next Steps for Repository Owner:"
    echo "   1. Set up Supabase project (see DEPLOYMENT_GUIDE.md)"
    echo "   2. Configure environment variables"
    echo "   3. Deploy to Vercel/Netlify"
    echo ""
    echo "📚 Documentation:"
    echo "   - Setup Guide: DEPLOYMENT_GUIDE.md"
    echo "   - Quick Start: README.md"
    echo "   - Transfer Checklist: TRANSFER_CHECKLIST.md"
    echo ""
    echo "🎉 Deployment complete!"
else
    echo ""
    echo "=============================================="
    echo "❌ Deployment Failed"
    echo "=============================================="
    echo ""
    echo "Common issues:"
    echo "  1. Token doesn't have 'repo' permission"
    echo "     → Recreate token with 'repo' scope"
    echo ""
    echo "  2. Repository doesn't exist"
    echo "     → Create empty repository at:"
    echo "       https://github.com/new"
    echo ""
    echo "  3. Repository is not empty"
    echo "     → Delete and recreate the repository"
    echo ""
    echo "  4. Wrong username or repository name"
    echo "     → Verify at: https://github.com/$GH_USERNAME/$REPO_NAME"
    echo ""
    echo "  5. Token has expired"
    echo "     → Generate a new token"
    echo ""
fi

# Clean up sensitive data
echo ""
echo "🧹 Cleaning up..."
unset GH_TOKEN
unset REPO_URL
git remote remove origin 2>/dev/null

echo "   ✅ Token cleared from memory"
echo "   ✅ Remote URL removed"
echo ""
echo "💡 Tip: Clear your terminal history for extra security"
echo "   Run: history -c"
