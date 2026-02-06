# Rainbow Wallet Integration Guide

## Overview
Rainbow Wallet has been successfully integrated into the Dehix frontend application. Users can now connect their wallets through the login page.

## Required Environment Variables

Add the following to your `.env.local` file:

```bash
# WalletConnect Project ID (required for Rainbow Kit)
# Get your project ID from: https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here
```

### How to get WalletConnect Project ID:
1. Visit https://cloud.walletconnect.com/
2. Create a new project
3. Copy your Project ID
4. Add it to your `.env.local` file

## Installed Dependencies

The following packages have been installed:
- `@rainbow-me/rainbowkit` - Rainbow Kit UI components
- `wagmi` - Web3 hooks library
- `viem` - Ethereum utilities
- `@tanstack/react-query` - Data fetching and caching

## File Structure

### New Files Created:

1. **`/src/providers/WalletProvider.tsx`**
   - Configures and provides Wagmi and Rainbow Kit to the app
   - Sets up supported chains (Mainnet, Polygon, Sepolia, Arbitrum, Base)
   - Configures query client for caching

2. **`/src/hooks/useWalletConnection.ts`**
   - Custom hook for wallet connection logic
   - Handles wallet authentication with backend
   - Manages wallet disconnection

3. **`/src/components/WalletConnectButton.tsx`**
   - Connect/Disconnect wallet button component
   - Uses Rainbow Kit's ConnectButton
   - Includes disconnect confirmation dialog

### Modified Files:

1. **`/src/app/layout.tsx`**
   - Added WalletProvider wrapper around app
   - WalletProvider is placed as the outermost provider

2. **`/src/app/auth/login/page.tsx`**
   - Added import for WalletConnectButton
   - Added wallet connection button section after Google login
   - Includes visual separator between login methods

## Backend Integration

The frontend expects your backend to have the following endpoint:

### POST `/auth/wallet-login`

**Request Body:**
```json
{
  "walletAddress": "0x...",
  "chainId": 1
}
```

**Expected Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "uid": "user_id",
    "email": "email@example.com",
    "displayName": "User Name",
    "type": "freelancer" | "business",
    "photoURL": "url_or_null",
    "phoneNumber": "phone_or_null",
    "emailVerified": true
  }
}
```

## Supported Wallets

Through Rainbow Kit, the following wallets are automatically supported:
- MetaMask
- Rainbow
- Coinbase Wallet
- WalletConnect
- Ledger Live
- Argent
- And many more

Users can click the "Connect Wallet" button and Rainbow Kit will display all available options.

## Supported Networks

The integration is configured to support:
- **Mainnet** (Ethereum Mainnet)
- **Polygon** (Polygon Network)
- **Sepolia** (Ethereum Testnet)
- **Arbitrum Sepolia** (Arbitrum Testnet)
- **Base Sepolia** (Base Testnet)

To add more networks, edit `/src/providers/WalletProvider.tsx` and add them to the chains array.

## Usage Flow

1. User visits the login page
2. User clicks "Connect Wallet" button
3. Rainbow Kit modal opens showing available wallets
4. User selects their wallet and connects
5. Once connected, "Authenticate with Wallet" button becomes available
6. User clicks "Authenticate with Wallet" to login
7. Frontend sends wallet address to backend
8. Backend returns JWT token and user data
9. User is redirected to their dashboard

## API Integration Points

The `useWalletConnection` hook integrates with:
- `axiosInstance.post('/auth/wallet-login')` - Backend authentication endpoint
- Redux store for user state management
- Next.js router for navigation
- Toast notifications for user feedback

## Customization

### Change Supported Chains
Edit `/src/providers/WalletProvider.tsx`:
```tsx
chains: [mainnet, polygon, sepolia, arbitrumSepolia, baseSepolia],
```

### Change Wallet Button Styling
Edit `/src/components/WalletConnectButton.tsx`:
- Modify Button className props
- Change button colors and sizes

### Change Redirects
Edit `/src/hooks/useWalletConnection.ts`:
- Modify the redirect paths based on user type

## Troubleshooting

### Rainbow Kit not showing
- Ensure `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` is set in `.env.local`
- Check browser console for errors
- Clear browser cache and restart dev server

### Wallet not connecting
- Ensure user has a Web3 wallet installed
- Check network connectivity
- Verify wallet is unlocked

### Backend returns error
- Verify `/auth/wallet-login` endpoint exists
- Check wallet address is valid Ethereum address
- Check response format matches expected structure

## Next Steps

1. **Set WalletConnect Project ID** in `.env.local`
2. **Implement backend endpoint** `/auth/wallet-login`
3. **Test wallet connection** in development
4. **Deploy to production** when ready

## Dependencies Added
```
@rainbow-me/rainbowkit@4.2.9
wagmi@2.13.12
viem@2.21.37
@tanstack/react-query@5.90.13
```

All dependencies were installed successfully. The integration is ready to use once you set up the environment variables and backend endpoint.
