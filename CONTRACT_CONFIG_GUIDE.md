# 🔧 Smart Contract Configuration Guide

## Quick Start

**Any time you need to update your smart contract addresses or ABIs:**

1. Open this file: `src/config/contracts/contractConfig.ts`
2. Update the contract addresses and/or ABIs
3. Save the file
4. **That's it!** The entire app will use your new configuration automatically

## What Gets Updated Automatically?

When you update `contractConfig.ts`, these components will use your new values:

- ✅ Add Education Form (`src/components/dialogs/addEducation.tsx`)
- ✅ Add Experience Form (`src/components/dialogs/addExperiences.tsx`)
- ✅ Add Project Form (`src/components/dialogs/addProject.tsx`)
- ✅ SBT Data Hook (`src/hooks/useSBTData.ts`)
- ✅ SBT Transactions Page (`src/app/sbt-transactions/page.tsx`)
- ✅ All blockchain interactions

## Configuration File Location

```
src/config/contracts/contractConfig.ts
```

## Current Configuration

### Contract Addresses

```typescript
FREELANCER_CONTRACT: '0xcEb98b9E4773dF57b5dB1cB9e097404b684FeE5A'
SBT_CONTRACT: '0x73b8Ecfd44DA278f856E50e6A328c13bC8F5A5e3'
```

### Contract ABIs

The file contains full ABIs for:
- `FREELANCER_CONTRACT_ABI` - For registering freelancers
- `SBT_CONTRACT_ABI` - For minting Soulbound Tokens

## How to Update Addresses

### Step 1: Open the config file
```
src/config/contracts/contractConfig.ts
```

### Step 2: Replace the address
Find this:
```typescript
FREELANCER_CONTRACT: '0xcEb98b9E4773dF57b5dB1cB9e097404b684FeE5A',
```

Replace with your new address:
```typescript
FREELANCER_CONTRACT: '0xYourNewAddressHere...',
```

### Step 3: Save and you're done!
The app will immediately use your new address.

## How to Update ABIs

### Step 1: Get your contract's ABI
- From Etherscan: Copy the "Contract ABI" JSON
- From Remix: Export the ABI
- From your contract file: Get the ABI export

### Step 2: Open the config file
```
src/config/contracts/contractConfig.ts
```

### Step 3: Find the ABI section
Look for `FREELANCER_CONTRACT_ABI` or `SBT_CONTRACT_ABI`

### Step 4: Replace the entire ABI array
Keep the `as const` at the end to maintain TypeScript type safety:
```typescript
export const FREELANCER_CONTRACT_ABI = [
  // Your new ABI functions here
] as const;
```

### Step 5: Save and rebuild
Run: `npm run build` to verify it compiles

## Trial & Error - No More Breaking Changes!

Instead of:
- ❌ Editing multiple dialog files
- ❌ Updating multiple imports
- ❌ Risking breaking something

Now you just:
- ✅ Edit ONE file
- ✅ Save it
- ✅ Done!

## Testing After Update

After updating the configuration:

1. Rebuild the app: `npm run build`
2. Try creating a new education/experience/project
3. Approve the transaction in MetaMask
4. Check the SBT Transactions page for your hash

## Troubleshooting

### Build fails after updating ABI
- Make sure your ABI is valid JSON/TypeScript
- Check for missing commas or invalid syntax
- Run `npm run build` to see detailed errors

### Smart contract calls fail
- Verify the address is correct
- Check that you're on Sepolia testnet
- Ensure the ABI matches the deployed contract

### Still not working?
- Check browser console (F12) for error messages
- MetaMask needs to show the transaction
- Verify contract is deployed at that address on Sepolia

## File Structure

```
src/
├── config/
│   └── contracts/
│       ├── contractConfig.ts       ← ⭐ MAIN CONFIG FILE (edit this!)
│       └── abis.ts                 ← (no longer used for config)
├── components/
│   └── dialogs/
│       ├── addEducation.tsx        ← Uses contractConfig
│       ├── addExperiences.tsx      ← Uses contractConfig
│       └── addProject.tsx          ← Uses contractConfig
├── hooks/
│   └── useSBTData.ts               ← Uses contractConfig
└── app/
    └── sbt-transactions/
        └── page.tsx                ← Uses contractConfig
```

## Questions?

Everything is centralized now! Just remember:
- **One file to edit:** `src/config/contracts/contractConfig.ts`
- **Unlimited trial & error:** Change addresses and ABIs as many times as you want
- **Automatic sync:** All components use your new values instantly
