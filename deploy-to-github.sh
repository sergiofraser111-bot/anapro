#!/bin/bash

# Profit Analysis - GitHub Deployment Script
# This script helps deploy your project to a new GitHub repository

echo "🚀 Profit Analysis - GitHub Deployment Helper"
echo "=============================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Error: Git is not installed. Please install Git first."
    echo "   Download from: https://git-scm.com/"
    exit 1
fi

# Ask for GitHub repository URL
echo "📝 Please create a new repository on GitHub first:"
echo "   Go to: https://github.com/new"
echo ""
read -p "Enter your new GitHub repository URL (e.g., https://github.com/username/repo-name.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ Error: Repository URL cannot be empty"
    exit 1
fi

echo ""
echo "🔍 Checking current git status..."

# Check if .git directory exists
if [ -d ".git" ]; then
    echo "⚠️  Existing git repository found."
    read -p "Do you want to remove the existing git history and start fresh? (y/n): " REMOVE_GIT

    if [ "$REMOVE_GIT" = "y" ] || [ "$REMOVE_GIT" = "Y" ]; then
        echo "🗑️  Removing existing git repository..."
        rm -rf .git
        echo "✅ Removed existing git history"
    else
        echo "ℹ️  Keeping existing git repository. Will add new remote."
    fi
fi

# Initialize git if needed
if [ ! -d ".git" ]; then
    echo "📦 Initializing new git repository..."
    git init
    echo "✅ Git repository initialized"
fi

echo ""
echo "📋 Preparing files for commit..."

# Ensure .env is not committed
if grep -q "^.env$" .gitignore 2>/dev/null; then
    echo "✅ .gitignore already includes .env"
else
    echo ".env" >> .gitignore
    echo "✅ Added .env to .gitignore"
fi

# Check if .env file exists and warn
if [ -f ".env" ]; then
    echo "⚠️  WARNING: .env file exists. Make sure it's in .gitignore!"
    echo "   This file contains sensitive credentials and should NOT be committed."
fi

echo ""
echo "📤 Adding files to git..."
git add .

echo ""
read -p "Enter commit message (default: 'Initial commit: Profit Analysis Platform'): " COMMIT_MSG
COMMIT_MSG=${COMMIT_MSG:-"Initial commit: Profit Analysis Platform"}

echo "💾 Creating commit..."
git commit -m "$COMMIT_MSG"

echo ""
echo "🔗 Adding remote repository..."
git remote remove origin 2>/dev/null  # Remove existing origin if any
git remote add origin "$REPO_URL"

echo ""
echo "⬆️  Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "=============================================="
echo "✅ Successfully deployed to GitHub!"
echo "=============================================="
echo ""
echo "📍 Your repository: $REPO_URL"
echo ""
echo "📝 Next Steps:"
echo "   1. Set up Supabase project (see DEPLOYMENT_GUIDE.md)"
echo "   2. Configure environment variables"
echo "   3. Deploy to Vercel/Netlify (see README.md)"
echo ""
echo "📚 Documentation:"
echo "   - Quick Start: README.md"
echo "   - Full Guide: DEPLOYMENT_GUIDE.md"
echo ""
echo "🎉 Happy deploying!"
