#!/bin/bash

# Rainbow Wallet Integration - Quick Start Guide
# This script helps you get started with the wallet integration

echo "🚀 Rainbow Wallet Integration - Quick Start"
echo "=========================================="
echo ""

# Step 1: Check for environment file
echo "Step 1: Setting up environment variables..."
if [ -f .env.local ]; then
    echo "✓ .env.local found"
else
    echo "⚠ .env.local not found, creating template..."
    cat > .env.local << EOF
# Add your WalletConnect Project ID
# Get it from: https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here

# Your backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# Firebase config (if using Firebase)
# NEXT_PUBLIC_FIREBASE_API_KEY=
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
# etc...
EOF
    echo "✓ Created .env.local template"
fi

echo ""
echo "Step 2: Getting WalletConnect Project ID..."
echo "📋 Instructions:"
echo "1. Visit: https://cloud.walletconnect.com/"
echo "2. Create an account or login"
echo "3. Create a new project"
echo "4. Copy your Project ID"
echo "5. Paste it in .env.local as NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID"
echo ""

echo "Step 3: Backend Endpoint Setup"
echo "📋 You need to implement this endpoint:"
echo ""
echo "Endpoint: POST /auth/wallet-login"
echo ""
echo "Request body:"
echo "{"
echo "  \"walletAddress\": \"0x...\","
echo "  \"chainId\": 1"
echo "}"
echo ""
echo "Response:"
echo "{"
echo "  \"token\": \"jwt_token_here\","
echo "  \"user\": {"
echo "    \"uid\": \"user_id\","
echo "    \"email\": \"email@example.com\","
echo "    \"displayName\": \"User Name\","
echo "    \"type\": \"freelancer|business\","
echo "    \"photoURL\": null,"
echo "    \"phoneNumber\": null,"
echo "    \"emailVerified\": false"
echo "  }"
echo "}"
echo ""

echo "Step 4: Files to Review"
echo "📂 Documentation files created:"
echo "  • RAINBOW_WALLET_INTEGRATION.md - Full integration guide"
echo "  • WALLET_BACKEND_IMPLEMENTATION.md - Backend examples"
echo "  • WALLET_INTEGRATION_SUMMARY.md - Overview"
echo ""

echo "Step 5: Verify Installation"
echo "Checking installed packages..."
if npm list @rainbow-me/rainbowkit > /dev/null 2>&1; then
    echo "✓ @rainbow-me/rainbowkit installed"
else
    echo "✗ @rainbow-me/rainbowkit not found"
fi

if npm list wagmi > /dev/null 2>&1; then
    echo "✓ wagmi installed"
else
    echo "✗ wagmi not found"
fi

if npm list viem > /dev/null 2>&1; then
    echo "✓ viem installed"
else
    echo "✗ viem not found"
fi

echo ""
echo "Step 6: Run Development Server"
echo "npm run dev"
echo ""

echo "📝 Checklist:"
echo "☐ Get WalletConnect Project ID from https://cloud.walletconnect.com/"
echo "☐ Add NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID to .env.local"
echo "☐ Implement /auth/wallet-login backend endpoint"
echo "☐ Test wallet connection on login page"
echo "☐ Verify redirects to correct dashboard"
echo ""

echo "✨ Integration Complete!"
echo ""
echo "Next action: Add your WalletConnect Project ID to .env.local"
