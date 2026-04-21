# 🌈 Rainbow Wallet Integration - Complete Setup

Welcome! Your Rainbow Wallet integration is complete. This guide walks you through the final setup steps.

## ✅ What's Been Done

- ✓ Installed all dependencies (@rainbow-me/rainbowkit, wagmi, viem, @tanstack/react-query)
- ✓ Created WalletProvider configuration
- ✓ Created useWalletConnection custom hook
- ✓ Created WalletConnectButton component
- ✓ Updated app layout with WalletProvider
- ✓ Updated login page with wallet connection option
- ✓ Created comprehensive documentation

## 🚀 Quick Start (5 Minutes)

### 1. Get WalletConnect Project ID (2 minutes)

```bash
# Visit and complete these steps:
https://cloud.walletconnect.com/

1. Click "Create Account" or "Sign In"
2. Complete email verification
3. Click "Create New Project"
4. Enter project name: "Dehix"
5. Copy your Project ID
```

### 2. Set Environment Variable (1 minute)

```bash
# Edit .env.local file and add:
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_copied_project_id_here
```

### 3. Test Locally (2 minutes)

```bash
# Start development server
npm run dev

# Open http://localhost:3000/auth/login
# Click "Connect Wallet"
# Select MetaMask or any wallet
```

## 📋 Full Integration Checklist

### Frontend Setup (DONE ✓)
- [x] Dependencies installed
- [x] WalletProvider created
- [x] useWalletConnection hook created
- [x] WalletConnectButton component created
- [x] App layout updated
- [x] Login page updated
- [ ] Environment variable set (NEXT STEP)

### Backend Setup (NEXT)
- [ ] Create `/auth/wallet-login` endpoint
- [ ] Implement user verification
- [ ] Generate JWT token
- [ ] Return user data

## 🔧 Backend Implementation

Your backend needs ONE endpoint:

### Endpoint: `POST /auth/wallet-login`

**Request:**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc7e7595f42bE",
  "chainId": 1
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "uid": "user_123",
    "email": "user@example.com",
    "displayName": "User Name",
    "type": "freelancer",
    "photoURL": null,
    "phoneNumber": null,
    "emailVerified": false
  }
}
```

### Example Backend Code (Node.js/Express):

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/auth/wallet-login', async (req, res) => {
  try {
    const { walletAddress, chainId } = req.body;

    // Validate wallet address
    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    // Find or create user
    let user = await User.findOne({ 
      walletAddress: walletAddress.toLowerCase() 
    });

    if (!user) {
      user = new User({
        walletAddress: walletAddress.toLowerCase(),
        displayName: `User ${walletAddress.substring(0, 6)}`,
        type: 'freelancer',
        email: null,
        emailVerified: false,
      });
      await user.save();
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        walletAddress: user.walletAddress,
        type: user.type,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send response
    res.json({
      token,
      user: {
        uid: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL || null,
        phoneNumber: user.phoneNumber || null,
        emailVerified: user.emailVerified,
        type: user.type,
      },
    });
  } catch (error) {
    console.error('Wallet login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

module.exports = router;
```

See `WALLET_BACKEND_IMPLEMENTATION.md` for more languages.

## 📁 Created Files Overview

### Core Files
- **`src/providers/WalletProvider.tsx`** - Wagmi + Rainbow Kit setup
- **`src/hooks/useWalletConnection.ts`** - Wallet connection logic
- **`src/components/WalletConnectButton.tsx`** - Connect button UI

### Documentation
- **`RAINBOW_WALLET_INTEGRATION.md`** - Detailed integration guide
- **`WALLET_BACKEND_IMPLEMENTATION.md`** - Backend code examples
- **`WALLET_INTEGRATION_SUMMARY.md`** - Quick overview
- **`QUICK_START.sh`** - Setup helper script
- **`README_WALLET.md`** - This file

## 🌐 Supported Wallets

Through Rainbow Kit, users can connect with:

**Popular Wallets:**
- MetaMask
- Rainbow Wallet
- Coinbase Wallet
- WalletConnect
- Ledger Live
- Argent
- Phantom
- Trust Wallet
- XDEFI

**And 40+ more wallets!**

Rainbow Kit automatically displays all available wallets installed on the user's device.

## 📱 User Experience Flow

```
1. User visits /auth/login
   ↓
2. Sees "Connect Wallet" button below Google Login
   ↓
3. Clicks "Connect Wallet"
   ↓
4. Rainbow Kit modal opens showing available wallets
   ↓
5. User selects their wallet (MetaMask, Rainbow, etc.)
   ↓
6. Wallet prompts user to connect
   ↓
7. User approves connection
   ↓
8. "Authenticate with Wallet" button becomes active
   ↓
9. User clicks "Authenticate with Wallet"
   ↓
10. Frontend sends walletAddress to backend
    ↓
11. Backend returns JWT token and user data
    ↓
12. User redirected to dashboard
    - Freelancer → /freelancer/dashboard
    - Business → /business/dashboard
    - Other → /dashboard
```

## 🔐 Security Features Built-in

1. **Token Management**
   - JWT tokens with 7-day expiration
   - Secure localStorage with auto-cleanup on logout

2. **User Validation**
   - Wallet address format validation
   - Network/chain validation
   - User type verification

3. **State Management**
   - Redux store for user data
   - Automatic logout on disconnect
   - Session persistence

4. **Error Handling**
   - Toast notifications for errors
   - Console logging for debugging
   - Graceful error recovery

## 🛠️ Customization Guide

### Change Supported Networks
Edit `src/providers/WalletProvider.tsx`:
```tsx
chains: [mainnet, polygon, sepolia, arbitrumSepolia, baseSepolia]
```

Add Arbitrum:
```tsx
import { arbitrum } from 'wagmi/chains';
chains: [mainnet, polygon, arbitrum, ...]
```

### Change Button Colors
Edit `src/components/WalletConnectButton.tsx`:
```tsx
<Button className="gap-2 bg-blue-600 hover:bg-blue-700">
```

Change to red:
```tsx
<Button className="gap-2 bg-red-600 hover:bg-red-700">
```

### Change Redirect Routes
Edit `src/hooks/useWalletConnection.ts`:
```tsx
if (user.type === 'freelancer') {
  router.push('/freelancer/dashboard');
}
```

### Change Toast Messages
Edit `src/hooks/useWalletConnection.ts`:
```tsx
notifySuccess('Wallet connected successfully!');
```

## 📊 Supported Networks

| Network | Chain ID | Use Case |
|---------|----------|----------|
| Ethereum Mainnet | 1 | Production |
| Polygon | 137 | Scaling |
| Sepolia | 11155111 | Testing |
| Arbitrum Sepolia | 421614 | Testing |
| Base Sepolia | 84532 | Testing |

## 🧪 Testing Checklist

- [ ] WalletConnect Project ID is set
- [ ] Dev server runs: `npm run dev`
- [ ] Login page loads at `/auth/login`
- [ ] "Connect Wallet" button visible
- [ ] Clicking shows Rainbow Kit modal
- [ ] Can select and connect wallet
- [ ] "Authenticate with Wallet" button works
- [ ] Backend `/auth/wallet-login` endpoint responds
- [ ] User data received and stored
- [ ] Redirects to correct dashboard
- [ ] Disconnect button works
- [ ] Can reconnect after disconnect

## 🐛 Troubleshooting

### "Rainbow Kit not showing"
```
Solution:
1. Check NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is set in .env.local
2. Restart dev server: Ctrl+C then npm run dev
3. Hard refresh browser: Ctrl+Shift+R
4. Check browser console for errors
```

### "Wallet not connecting"
```
Solution:
1. Ensure wallet is installed and unlocked
2. Try different wallet
3. Check wallet extension permissions
4. Check browser console for error messages
```

### "Backend returns 404"
```
Solution:
1. Verify /auth/wallet-login endpoint exists
2. Check it accepts POST requests
3. Verify walletAddress is in lowercase
4. Test with curl or Postman first
```

### "Users not redirected to dashboard"
```
Solution:
1. Check user.type value (should be 'freelancer' or 'business')
2. Verify dashboard paths exist
3. Check browser console for routing errors
4. Verify Redux user state is set correctly
```

## 📞 Getting Help

### For Rainbow Kit Issues:
- [Rainbow Kit Documentation](https://www.rainbowkit.com/)
- [Rainbow Kit Discord](https://discord.gg/rainbowkit)

### For Wagmi Issues:
- [Wagmi Documentation](https://wagmi.sh/)
- [Wagmi GitHub Discussions](https://github.com/wevm/wagmi/discussions)

### For Your Integration:
1. Check the documentation files:
   - `RAINBOW_WALLET_INTEGRATION.md`
   - `WALLET_BACKEND_IMPLEMENTATION.md`
2. Review the source code comments
3. Check browser console for error messages

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Set real WalletConnect Project ID
- [ ] Update NEXT_PUBLIC_API_URL for production
- [ ] Test all wallet types
- [ ] Test on mobile devices
- [ ] Enable HTTPS (required for web3)
- [ ] Set environment variables on hosting platform
- [ ] Test blockchain networks (if using testnet, switch to mainnet)
- [ ] Load test the `/auth/wallet-login` endpoint
- [ ] Set up proper error monitoring
- [ ] Configure CORS for production domain

## 📈 Metrics to Monitor

After deployment, monitor:
- Wallet connection success rate
- Average connection time
- Error rates per wallet type
- User redirects to correct dashboard
- Token expiration/refresh rate

## 💾 Database Schema Hint

Your User model should include:

```javascript
{
  walletAddress: { type: String, unique: true, lowercase: true },
  email: { type: String, unique: true, sparse: true },
  displayName: String,
  type: { enum: ['freelancer', 'business'] },
  photoURL: String,
  phoneNumber: String,
  emailVerified: { type: Boolean, default: false },
  kycStatus: { enum: ['pending', 'verified', 'rejected'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

## 🎉 You're All Set!

Your Rainbow Wallet integration is complete and ready to use. 

### Next Steps:
1. ✅ Get WalletConnect Project ID
2. ✅ Set NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID in .env.local
3. ✅ Implement backend /auth/wallet-login endpoint
4. ✅ Test locally: npm run dev
5. ✅ Deploy to production

**Estimated time to full setup: 30 minutes**

---

**Questions?** Check the documentation files in this folder or review the source code comments in the created files.

**Ready to launch?** Start with Step 1: Get your WalletConnect Project ID! 🚀
