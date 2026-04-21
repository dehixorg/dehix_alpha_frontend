/**
 * ============================================
 * CENTRALIZED SMART CONTRACT CONFIGURATION
 * ============================================
 *
 * 🎯 THIS IS YOUR MAIN CONFIGURATION FILE
 *
 * Edit ONLY this file to change:
 * - Contract addresses
 * - Contract ABIs
 *
 * The entire app will automatically use your new values:
 * - addEducation.tsx
 * - addExperiences.tsx
 * - addProject.tsx
 * - useSBTData.ts
 * - sbt-transactions page
 *
 * NO OTHER FILES NEED EDITING!
 *
 * ============================================
 * HOW TO UPDATE CONTRACT ADDRESSES
 * ============================================
 *
 * 1. Copy your new contract address
 * 2. Replace the value below (keep the quotes)
 * 3. Save this file
 * 4. Done! The entire app uses the new address
 *
 * EXAMPLE:
 * BEFORE: FREELANCER_CONTRACT: '0xcEb98b9E4...',
 * AFTER:  FREELANCER_CONTRACT: '0xYourNewAddress...',
 *
 * ============================================
 * HOW TO UPDATE CONTRACT ABIs
 * ============================================
 *
 * 1. Get your contract ABI (from Etherscan, Remix, or your contract file)
 * 2. Find the ABI section below (FREELANCER_CONTRACT_ABI or SBT_CONTRACT_ABI)
 * 3. Replace the entire array with your new ABI
 * 4. Save this file
 * 5. Done! The entire app uses the new ABI
 *
 * Make sure the ABI is formatted as valid TypeScript const array!
 */

// ============================================
// SMART CONTRACT ADDRESSES (POLYGON AMOY TESTNET)
// ============================================
export const CONTRACT_ADDRESSES = {
  // ⬇️ CHANGE THESE ADDRESSES (keep the quotes)
  // Freelancer Contract - Handles freelancer registration
  FREELANCER_CONTRACT: '0xFe70F4032dE38e2bE754810FCb2B4666B80Ac3a2',

  // Soulbound Token Contract - Handles SBT minting
  SBT_CONTRACT: '0x1f4f15125640b683ba4339b8d0f3993E3ca86B9f',
};

// ============================================
// SMART CONTRACT ABIs
// ============================================

/**
 * FREELANCER CONTRACT ABI
 * Copy your contract's ABI here
 */
export const FREELANCER_CONTRACT_ABI = [
  {
    type: 'function',
    name: 'addFreelancer',
    inputs: [
      { name: 'freelancerId', type: 'string' },
      { name: 'walletAddress', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getFreelancer',
    inputs: [{ name: 'freelancerId', type: 'string' }],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
] as const;

/**
 * SOULBOUND TOKEN (SBT) CONTRACT ABI
 * Copy your contract's ABI here
 */
export const SBT_CONTRACT_ABI = [
  {
    type: 'function',
    name: 'mintFreelancerToken',
    inputs: [
      { name: '_freelancerAddress', type: 'address' },
      { name: '_freelancerId', type: 'string' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTokenIdsByFreelancer',
    inputs: [{ name: '_freelancerAddress', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'tokenURI',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
] as const;

// ============================================
// QUICK REFERENCE FOR UPDATING
// ============================================
/*
 * TO UPDATE CONTRACT ADDRESSES:
 * 1. Replace the values in CONTRACT_ADDRESSES object above
 * 2. Save this file
 * 3. The entire app will use the new addresses
 *
 * EXAMPLE:
 * Before: FREELANCER_CONTRACT: '0xcEb98b9E4773dF57b5dB1cB9e097404b684FeE5A',
 * After:  FREELANCER_CONTRACT: '0xYourNewAddress123456789...',
 *
 * TO UPDATE CONTRACT ABIs:
 * 1. Copy your contract's full ABI from Etherscan or your contract file
 * 2. Replace the entire FREELANCER_CONTRACT_ABI or SBT_CONTRACT_ABI object
 * 3. Make sure it's properly formatted as TypeScript const
 * 4. Save this file
 *
 * THE APP WILL AUTOMATICALLY USE THE NEW ABI
 */
