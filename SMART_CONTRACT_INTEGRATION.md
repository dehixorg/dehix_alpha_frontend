# DXUT Platform Smart Contract Integration

This document describes the integration of the DXUTPlatform smart contract into the Next.js frontend application.

## Overview

The DXUTPlatform smart contract provides the following functionality:
- **ERC20 Token**: DXUT-A (DXUT Ava Token) with 18 decimals
- **Escrow System**: Secure payment handling between clients and freelancers
- **NFT Rewards**: Interview completion NFTs and project completion NFTs
- **User Registration**: Automatic user registration on first interaction
- **Reward System**: Welcome rewards for new users (50 DXUT tokens)

## Contract Details

- **Contract Address**: `0x65ad7c61144558AaAFb1b49FB9Ad9Ac69e08Ab88`
- **Token Name**: DXUT Ava Token
- **Token Symbol**: DXUT-A
- **Network**: Avalanche (AVAX)

## Files Added/Modified

### Core Integration Files

1. **`src/lib/smartContract.ts`** - Main contract integration file
   - Contract address and ABI
   - Helper functions for contract interaction
   - Wallet connection utilities

2. **`src/lib/dxutPlatformABI.ts`** - Contract ABI
   - Complete ABI for DXUTPlatform contract
   - Includes all functions, events, and errors

### Component Files

3. **`src/components/walletConnectButton.tsx`** - Updated wallet connection
   - Integrated with smart contract functions
   - Token balance display
   - Welcome reward claiming
   - User registration status

4. **`src/components/shared/EscrowManager.tsx`** - Escrow management
   - Create escrow payments
   - Release escrow to freelancers
   - Refund clients
   - View escrow details

5. **`src/components/shared/InterviewNFTCard.tsx`** - Interview NFT minting
   - Mint NFTs for interview completion
   - Track NFT minting status
   - Freelancer address management

6. **`src/components/shared/SmartContractDemo.tsx`** - Demo component
   - Comprehensive testing interface
   - All contract functions demonstration
   - Platform statistics display

### Demo Page

7. **`src/app/smart-contract-demo/page.tsx`** - Demo page
   - Accessible at `/smart-contract-demo`
   - Complete testing interface

## Smart Contract Functions

### Core Functions

```typescript
// Create escrow for a project
createEscrow(freelancerAddress: string, amount: string)

// Release escrow to freelancer (owner only)
releaseEscrow(escrowId: number)

// Refund client (owner only)
refundClient(escrowId: number)

// Mint interview NFT (owner only)
mintInterviewNFT(freelancerAddress: string)

// Give reward tokens (anyone can call)
reward(toAddress: string)

// Check if address is registered
isAddressRegistered(userAddress: string)

// Get user's token balance
getBalance(userAddress: string)

// Get escrow details
getEscrow(escrowId: number)

// Get escrow counter
getEscrowCounter()
```

### ERC20 Functions

```typescript
// Standard ERC20 functions
balanceOf(account: string)
transfer(to: string, amount: string)
approve(spender: string, amount: string)
transferFrom(from: string, to: string, amount: string)
allowance(owner: string, spender: string)
```

## Usage Examples

### 1. Wallet Connection and Reward Claiming

```typescript
import { contractFunctions } from '@/lib/smartContract';

// Check if user is registered
const isRegistered = await contractFunctions.isAddressRegistered(userAddress);

// Claim welcome reward
if (!isRegistered) {
  await contractFunctions.reward(userAddress);
}

// Get token balance
const balance = await contractFunctions.getBalance(userAddress);
```

### 2. Escrow Management

```typescript
// Create escrow
const tx = await contractFunctions.createEscrow(freelancerAddress, "1.0");

// Get escrow details
const escrow = await contractFunctions.getEscrow(escrowId);

// Release escrow (owner only)
await contractFunctions.releaseEscrow(escrowId);
```

### 3. NFT Minting

```typescript
// Mint interview NFT (owner only)
await contractFunctions.mintInterviewNFT(freelancerAddress);
```

## Integration with Existing Components

### Header Component
The header now displays:
- Wallet connection status
- Token balance
- User registration status

### Project Components
Can integrate with:
- `EscrowManager` for payment handling
- `InterviewNFTCard` for interview rewards

## Error Handling

All contract functions include comprehensive error handling:
- MetaMask connection errors
- Contract transaction failures
- Network issues
- User rejection of transactions

## Testing

### Demo Page
Visit `/smart-contract-demo` to test all functionality:
- Wallet connection
- Token claiming
- Escrow creation
- NFT minting
- Platform statistics

### Test Functions
The demo includes:
- Sample freelancer addresses
- Escrow amount testing
- Real-time balance updates
- Transaction status tracking

## Security Considerations

1. **Owner Functions**: Only contract owner can:
   - Release escrow
   - Refund clients
   - Mint interview NFTs

2. **User Registration**: Automatic registration prevents duplicate rewards

3. **Escrow Security**: Funds are locked until released or refunded

4. **Input Validation**: All inputs are validated before contract calls

## Network Configuration

The contract is deployed on Avalanche network. Ensure:
- MetaMask is configured for Avalanche network
- Users have AVAX for gas fees
- Contract address is correct for the network

## Future Enhancements

1. **Batch Operations**: Batch reward distribution
2. **Advanced Escrow**: Time-based releases
3. **NFT Metadata**: Rich NFT metadata
4. **Analytics**: Transaction analytics and reporting
5. **Mobile Support**: Mobile wallet integration

## Troubleshooting

### Common Issues

1. **MetaMask Not Installed**
   - Error: "MetaMask is not installed"
   - Solution: Install MetaMask browser extension

2. **Wrong Network**
   - Error: Contract calls fail
   - Solution: Switch to Avalanche network in MetaMask

3. **Insufficient Gas**
   - Error: Transaction fails
   - Solution: Ensure sufficient AVAX for gas fees

4. **User Rejection**
   - Error: User rejected transaction
   - Solution: User needs to approve transaction in MetaMask

### Debug Mode

Enable debug logging by adding to browser console:
```javascript
localStorage.setItem('debug', 'smart-contract:*');
```

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify MetaMask connection and network
3. Test with the demo page first
4. Review transaction details on blockchain explorer

## Contract Address

**DXUTPlatform**: `0x65ad7c61144558AaAFb1b49FB9Ad9Ac69e08Ab88`
**DXUT NFT**: `0x...` (Update when deployed)

---

*This integration provides a complete Web3 experience for the DXUT platform, enabling secure escrow payments, token rewards, and NFT achievements.*
