import { Abi } from 'viem';

// Freelancer Contract ABI
export const FREELANCER_CONTRACT_ABI: Abi = [
  {
    type: 'function',
    name: 'addBusiness',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'addFreelancer',
    inputs: [
      { type: 'string', name: 'freelancerId' },
      { type: 'address', name: 'freelancerAddress' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createProject',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'applyToProject',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createEscrow',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'depositFunds',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'releaseFunds',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'refundFunds',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'vote',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getOwner',
    inputs: [],
    outputs: [],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'stakingContract',
    inputs: [],
    outputs: [],
    stateMutability: 'view',
  },
];

// Freelancer Soul Bound Token ABI
export const FREELANCER_SBT_ABI: Abi = [
  {
    type: 'function',
    name: 'mintFreelancerToken',
    inputs: [
      { type: 'address', name: 'freelancerAddress' },
      { type: 'string', name: 'freelancerId' },
    ],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ type: 'address', name: 'owner' }],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'ownerOf',
    inputs: [{ type: 'uint256', name: 'tokenId' }],
    outputs: [{ type: 'address', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'name',
    inputs: [],
    outputs: [{ type: 'string', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ type: 'string', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'tokenURI',
    inputs: [{ type: 'uint256', name: 'tokenId' }],
    outputs: [{ type: 'string', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'tokenId' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getApproved',
    inputs: [{ type: 'uint256', name: 'tokenId' }],
    outputs: [{ type: 'address', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'setApprovalForAll',
    inputs: [
      { type: 'address', name: 'operator' },
      { type: 'bool', name: 'approved' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'isApprovedForAll',
    inputs: [
      { type: 'address', name: 'owner' },
      { type: 'address', name: 'operator' },
    ],
    outputs: [{ type: 'bool', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'transferFrom',
    inputs: [
      { type: 'address', name: 'from' },
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'tokenId' },
    ],
    outputs: [],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'safeTransferFrom',
    inputs: [
      { type: 'address', name: 'from' },
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'tokenId' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getTotalTokensMinted',
    inputs: [],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'freelancerTokenId',
    inputs: [{ type: 'address', name: '' }],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getProfile',
    inputs: [{ type: 'uint256', name: 'tokenId' }],
    outputs: [],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'updateReputation',
    inputs: [
      { type: 'uint256', name: 'tokenId' },
      { type: 'uint256', name: 'reputationScore' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'endorseSkill',
    inputs: [
      { type: 'uint256', name: 'tokenId' },
      { type: 'string', name: 'skill' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revokeSkillEndorsement',
    inputs: [
      { type: 'uint256', name: 'tokenId' },
      { type: 'string', name: 'skill' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'unlockAchievement',
    inputs: [
      { type: 'uint256', name: 'tokenId' },
      { type: 'string', name: 'achievement' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getAchievements',
    inputs: [{ type: 'uint256', name: 'tokenId' }],
    outputs: [{ type: 'string[]', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getEndorsedSkills',
    inputs: [{ type: 'uint256', name: 'tokenId' }],
    outputs: [{ type: 'string[]', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'burnToken',
    inputs: [{ type: 'uint256', name: 'tokenId' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
];

// NDA Soul Bound Token ABI
export const NDA_SBT_ABI: Abi = [
  {
    type: 'function',
    name: 'createNDA',
    inputs: [
      { type: 'address', name: 'businessOwner' },
      { type: 'address', name: 'freelancer' },
      { type: 'uint256', name: 'duration' },
    ],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'signNDAByBusiness',
    inputs: [{ type: 'uint256', name: 'tokenId' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'signNDAByFreelancer',
    inputs: [{ type: 'uint256', name: 'tokenId' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'completeWork',
    inputs: [{ type: 'uint256', name: 'tokenId' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'reportViolation',
    inputs: [{ type: 'uint256', name: 'tokenId' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getNDA',
    inputs: [{ type: 'uint256', name: 'tokenId' }],
    outputs: [],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isExpired',
    inputs: [{ type: 'uint256', name: 'tokenId' }],
    outputs: [{ type: 'bool', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'checkAndBurnExpired',
    inputs: [{ type: 'uint256', name: 'tokenId' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ type: 'address', name: 'owner' }],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'ownerOf',
    inputs: [{ type: 'uint256', name: 'tokenId' }],
    outputs: [{ type: 'address', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'name',
    inputs: [],
    outputs: [{ type: 'string', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ type: 'string', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'tokenURI',
    inputs: [{ type: 'uint256', name: 'tokenId' }],
    outputs: [{ type: 'string', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'tokenId' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getApproved',
    inputs: [{ type: 'uint256', name: 'tokenId' }],
    outputs: [{ type: 'address', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'setApprovalForAll',
    inputs: [
      { type: 'address', name: 'operator' },
      { type: 'bool', name: 'approved' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'isApprovedForAll',
    inputs: [
      { type: 'address', name: 'owner' },
      { type: 'address', name: 'operator' },
    ],
    outputs: [{ type: 'bool', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'transferFrom',
    inputs: [
      { type: 'address', name: 'from' },
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'tokenId' },
    ],
    outputs: [],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'safeTransferFrom',
    inputs: [
      { type: 'address', name: 'from' },
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'tokenId' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
];

// MyToken (ERC20) ABI
export const MY_TOKEN_ABI: Abi = [
  {
    type: 'function',
    name: 'name',
    inputs: [],
    outputs: [{ type: 'string', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ type: 'string', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ type: 'uint8', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalSupply',
    inputs: [],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ type: 'address', name: 'account' }],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'transfer',
    inputs: [
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'amount' },
    ],
    outputs: [{ type: 'bool', name: '' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { type: 'address', name: 'owner' },
      { type: 'address', name: 'spender' },
    ],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { type: 'address', name: 'spender' },
      { type: 'uint256', name: 'amount' },
    ],
    outputs: [{ type: 'bool', name: '' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'transferFrom',
    inputs: [
      { type: 'address', name: 'from' },
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'amount' },
    ],
    outputs: [{ type: 'bool', name: '' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'mint',
    inputs: [
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'amount' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'burn',
    inputs: [{ type: 'uint256', name: 'amount' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
];

// Staking Rewards ABI
export const STAKING_REWARDS_ABI: Abi = [
  {
    type: 'function',
    name: 'stake',
    inputs: [{ type: 'uint256', name: 'amount' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'withdraw',
    inputs: [{ type: 'uint256', name: 'amount' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getReward',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ type: 'address', name: 'account' }],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'earned',
    inputs: [{ type: 'address', name: 'account' }],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalSupply',
    inputs: [],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'rewardPerToken',
    inputs: [],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'finishAt',
    inputs: [],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'duration',
    inputs: [],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'rewardRate',
    inputs: [],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
  },
];

// Contract addresses
export const FREELANCER_CONTRACT_SEPOLIA =
  '0xcEb98b9E4773dF57b5dB1cB9e097404b684FeE5A';
export const FREELANCER_SBT_SEPOLIA =
  '0x5094297851D4AB5bE67c7Dac57DcdFF00e463028';
export const NDA_SBT_SEPOLIA = '0xBa760c57156e2C5f8712De0DAbB88748A3c08Ee9';
export const MY_TOKEN_SEPOLIA = '0x73b8Ecfd44DA278f856E50e6A328c13bC8F5A5e3';
export const STAKING_REWARDS_SEPOLIA =
  '0x15c013ABf5702D1930c37cb1131f6F1606797071';
