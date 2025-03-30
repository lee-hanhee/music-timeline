#!/bin/bash

# Simple script to deploy the reveal-sunday-songs Edge Function
# Make executable with: chmod +x deploy-function.sh

# Hard-coded project reference from the logs
PROJECT_REF="wgnrkfglgpsliofqgkwn"

echo "Deploying reveal-sunday-songs Edge Function to project: $PROJECT_REF"

# Try with the proper project ref format
supabase functions deploy reveal-sunday-songs --project-ref "$PROJECT_REF"

if [ $? -ne 0 ]; then
    echo "Deployment failed. Trying with debug output:"
    supabase functions deploy reveal-sunday-songs --project-ref "$PROJECT_REF" --debug
fi 