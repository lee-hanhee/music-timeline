#!/bin/bash

# Script to deploy the reveal-sunday-songs Edge Function
# Make this file executable with: chmod +x deploy-edge-function.sh

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Get project reference from .env.local
if [ -f .env.local ]; then
    SUPABASE_URL=$(grep SUPABASE_URL .env.local | cut -d '=' -f2 | tr -d ' ')
    if [[ $SUPABASE_URL == *"your-project-id"* ]]; then
        echo "Please update your .env.local file with real credentials first."
        exit 1
    fi
    
    # Extract project reference from URL - improved regex
    PROJECT_REF=$(echo $SUPABASE_URL | sed -E 's|https?://([^.]+)\.supabase\.co.*|\1|')
    
    echo "Found project reference: $PROJECT_REF"
    
    if [ -z "$PROJECT_REF" ]; then
        echo "Could not determine project reference from SUPABASE_URL."
        read -p "Please enter your Supabase project reference: " PROJECT_REF
    fi
else
    echo ".env.local file not found."
    read -p "Please enter your Supabase project reference: " PROJECT_REF
fi

# Deploy the Edge Function
echo "Deploying reveal-sunday-songs Edge Function..."
supabase functions deploy reveal-sunday-songs --project-ref "$PROJECT_REF"

# Check deployment status
if [ $? -eq 0 ]; then
    echo "✅ Edge Function deployed successfully!"
    echo "Check the Supabase Dashboard for invocation logs: https://app.supabase.com/project/$PROJECT_REF/functions"
else
    echo "❌ Deployment failed. Please check the error message above."
fi 