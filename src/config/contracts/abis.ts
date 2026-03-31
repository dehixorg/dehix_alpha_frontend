import { Abi } from 'viem';

// Freelancer Contract ABI
export const FREELANCER_CONTRACT_ABI: Abi = [
  {
    type: 'constructor',
    inputs: [
      {
        type: 'address',
        name: '_stakingContractAddress',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'addBusiness',
    inputs: [
      { type: 'string', name: '_businessId', internalType: 'string' },
      { type: 'address', name: '_businessAddress', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'addFreelancer',
    inputs: [
      { type: 'string', name: '_freelancerId', internalType: 'string' },
      { type: 'address', name: '_freelancerAddress', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'addOracle',
    inputs: [
      { type: 'address', name: '_oracleAddress', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'applyToProject',
    inputs: [
      { type: 'string', name: '_projectId', internalType: 'string' },
      { type: 'address', name: '_freelancerAddress', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createEscrow',
    inputs: [
      { type: 'string', name: '_escrowId', internalType: 'string' },
      { type: 'address[]', name: '_votingOracles', internalType: 'address[]' },
      { type: 'address', name: '_freelancer', internalType: 'address' },
      { type: 'address', name: '_tokenAddress', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createProject',
    inputs: [{ type: 'string', name: '_projectId', internalType: 'string' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'deactivateProject',
    inputs: [{ type: 'string', name: '_projectId', internalType: 'string' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'depositFunds',
    inputs: [
      { type: 'uint256', name: '_amount', internalType: 'uint256' },
      { type: 'string', name: '_escrowId', internalType: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getEscrow',
    inputs: [{ type: 'string', name: '_escrowId', internalType: 'string' }],
    outputs: [
      { type: 'string', name: '', internalType: 'string' },
      { type: 'address[]', name: '', internalType: 'address[]' },
      { type: 'address', name: '', internalType: 'address' },
      { type: 'address', name: '', internalType: 'address' },
      { type: 'uint256', name: '', internalType: 'uint256' },
      { type: 'address', name: '', internalType: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getOwner',
    inputs: [],
    outputs: [{ type: 'address', name: '', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'refundFunds',
    inputs: [{ type: 'string', name: '_escrowId', internalType: 'string' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'releaseFunds',
    inputs: [{ type: 'string', name: '_escrowId', internalType: 'string' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'removeOracle',
    inputs: [
      { type: 'address', name: '_oracleAddress', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 's_businesses',
    inputs: [{ type: 'string', name: '', internalType: 'string' }],
    outputs: [
      { type: 'string', name: 'businessId', internalType: 'string' },
      { type: 'address', name: 'businessAddress', internalType: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 's_escrows',
    inputs: [{ type: 'string', name: '', internalType: 'string' }],
    outputs: [
      { type: 'string', name: 'escrowId', internalType: 'string' },
      { type: 'address', name: 'freelancerAddress', internalType: 'address' },
      { type: 'address', name: 'businessAddress', internalType: 'address' },
      { type: 'uint256', name: 'depositedAmount', internalType: 'uint256' },
      {
        type: 'address',
        name: 'tokenAddress',
        internalType: 'contract IERC20',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 's_freelancers',
    inputs: [{ type: 'string', name: '', internalType: 'string' }],
    outputs: [
      { type: 'string', name: 'freelancerId', internalType: 'string' },
      { type: 'address', name: 'freelancerAddress', internalType: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 's_oracles',
    inputs: [{ type: 'address', name: '', internalType: 'address' }],
    outputs: [{ type: 'bool', name: '', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 's_projects',
    inputs: [{ type: 'string', name: '', internalType: 'string' }],
    outputs: [
      { type: 'string', name: 'projectId', internalType: 'string' },
      { type: 'bool', name: 'isActive', internalType: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'stakingContract',
    inputs: [],
    outputs: [
      { type: 'address', name: '', internalType: 'contract StakingRewards' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'vote',
    inputs: [
      { type: 'string', name: '_escrowId', internalType: 'string' },
      { type: 'bool', name: '_release', internalType: 'bool' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'BusinessAdded',
    inputs: [
      {
        type: 'string',
        name: 'businessId',
        indexed: true,
        internalType: 'string',
      },
      {
        type: 'address',
        name: 'businessAddress',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'EscrowCreated',
    inputs: [
      {
        type: 'string',
        name: 'escrowId',
        indexed: true,
        internalType: 'string',
      },
      {
        type: 'address',
        name: 'business',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'address',
        name: 'freelancer',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'FreelancerAdded',
    inputs: [
      {
        type: 'string',
        name: 'freelancerId',
        indexed: true,
        internalType: 'string',
      },
      {
        type: 'address',
        name: 'freelancerAddress',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'FundsDeposited',
    inputs: [
      {
        type: 'string',
        name: 'escrowId',
        indexed: true,
        internalType: 'string',
      },
      {
        type: 'uint256',
        name: 'amount',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'FundsRefunded',
    inputs: [
      {
        type: 'string',
        name: 'escrowId',
        indexed: true,
        internalType: 'string',
      },
      { type: 'address', name: 'to', indexed: true, internalType: 'address' },
      {
        type: 'uint256',
        name: 'amount',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'FundsReleased',
    inputs: [
      {
        type: 'string',
        name: 'escrowId',
        indexed: true,
        internalType: 'string',
      },
      { type: 'address', name: 'to', indexed: true, internalType: 'address' },
      {
        type: 'uint256',
        name: 'amount',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OracleAdded',
    inputs: [
      {
        type: 'address',
        name: 'oracleAddress',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OracleRemoved',
    inputs: [
      {
        type: 'address',
        name: 'oracleAddress',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ProjectCreated',
    inputs: [
      {
        type: 'string',
        name: 'projectId',
        indexed: true,
        internalType: 'string',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ProjectDeactivated',
    inputs: [
      {
        type: 'string',
        name: 'projectId',
        indexed: true,
        internalType: 'string',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Voted',
    inputs: [
      {
        type: 'string',
        name: 'escrowId',
        indexed: true,
        internalType: 'string',
      },
      {
        type: 'address',
        name: 'oracle',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'bool',
        name: 'voteForRelease',
        indexed: false,
        internalType: 'bool',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'ReentrancyGuardReentrantCall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'SafeERC20FailedOperation',
    inputs: [{ type: 'address', name: 'token', internalType: 'address' }],
  },
];

// Freelancer Soul Bound Token ABI
export const FREELANCER_SBT_ABI: Abi = [
  {
    type: 'function',
    name: 'ADMIN_ROLE',
    inputs: [],
    outputs: [{ type: 'bytes32', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'DEFAULT_ADMIN_ROLE',
    inputs: [],
    outputs: [{ type: 'bytes32', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'MINTER_ROLE',
    inputs: [],
    outputs: [{ type: 'bytes32', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'REPUTATION_ROLE',
    inputs: [],
    outputs: [{ type: 'bytes32', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'UPDATER_ROLE',
    inputs: [],
    outputs: [{ type: 'bytes32', name: '' }],
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
    name: 'balanceOf',
    inputs: [{ type: 'address', name: 'owner' }],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'burnToken',
    inputs: [{ type: 'uint256', name: '_tokenId' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'endorseSkill',
    inputs: [
      { type: 'uint256', name: '_tokenId' },
      { type: 'string', name: '_skill' },
      { type: 'bool', name: '_verified' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'freelancerProfiles',
    inputs: [{ type: 'uint256', name: '' }],
    outputs: [
      { type: 'string', name: 'freelancerId' },
      { type: 'address', name: 'freelancerAddress' },
      { type: 'uint256', name: 'totalProjectsCompleted' },
      { type: 'uint256', name: 'averageRating' },
      { type: 'uint256', name: 'totalEarnings' },
      { type: 'uint256', name: 'tokensMinted' },
      { type: 'uint256', name: 'createdAt' },
      { type: 'uint256', name: 'updatedAt' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'freelancerTokenIds',
    inputs: [
      { type: 'address', name: '' },
      { type: 'uint256', name: '' },
    ],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAchievements',
    inputs: [{ type: 'uint256', name: '_tokenId' }],
    outputs: [
      {
        type: 'tuple[]',
        name: '',
        components: [
          { type: 'uint8', name: 'achievement' },
          { type: 'uint256', name: 'unlockedAt' },
          { type: 'string', name: 'metadata' },
        ],
      },
    ],
    stateMutability: 'view',
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
    name: 'getEndorsedSkills',
    inputs: [{ type: 'uint256', name: '_tokenId' }],
    outputs: [
      { type: 'string[]', name: 'skills' },
      { type: 'bool[]', name: 'verified' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getFreelancerProfile',
    inputs: [{ type: 'uint256', name: '_tokenId' }],
    outputs: [
      {
        type: 'tuple',
        name: '',
        components: [
          { type: 'string', name: 'freelancerId' },
          { type: 'address', name: 'freelancerAddress' },
          { type: 'uint256', name: 'totalProjectsCompleted' },
          { type: 'uint256', name: 'averageRating' },
          { type: 'uint256', name: 'totalEarnings' },
          { type: 'uint256', name: 'tokensMinted' },
          { type: 'string[]', name: 'endorsedSkills' },
          { type: 'bool[]', name: 'skillVerified' },
          { type: 'uint256', name: 'createdAt' },
          { type: 'uint256', name: 'updatedAt' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getProfiles',
    inputs: [{ type: 'address', name: 'user' }],
    outputs: [
      {
        type: 'tuple[]',
        name: '',
        components: [
          { type: 'string', name: 'freelancerId' },
          { type: 'address', name: 'freelancerAddress' },
          { type: 'uint256', name: 'totalProjectsCompleted' },
          { type: 'uint256', name: 'averageRating' },
          { type: 'uint256', name: 'totalEarnings' },
          { type: 'uint256', name: 'tokensMinted' },
          { type: 'string[]', name: 'endorsedSkills' },
          { type: 'bool[]', name: 'skillVerified' },
          { type: 'uint256', name: 'createdAt' },
          { type: 'uint256', name: 'updatedAt' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getRoleAdmin',
    inputs: [{ type: 'bytes32', name: 'role' }],
    outputs: [{ type: 'bytes32', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTokenIdsByFreelancer',
    inputs: [{ type: 'address', name: '_freelancerAddress' }],
    outputs: [{ type: 'uint256[]', name: '' }],
    stateMutability: 'view',
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
    name: 'grantRole',
    inputs: [
      { type: 'bytes32', name: 'role' },
      { type: 'address', name: 'account' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'hasRole',
    inputs: [
      { type: 'bytes32', name: 'role' },
      { type: 'address', name: 'account' },
    ],
    outputs: [{ type: 'bool', name: '' }],
    stateMutability: 'view',
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
    name: 'mintFreelancerToken',
    inputs: [
      { type: 'address', name: '_freelancerAddress' },
      { type: 'string', name: '_freelancerId' },
    ],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'nonpayable',
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
    name: 'ownerOf',
    inputs: [{ type: 'uint256', name: 'tokenId' }],
    outputs: [{ type: 'address', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'renounceRole',
    inputs: [
      { type: 'bytes32', name: 'role' },
      { type: 'address', name: 'callerConfirmation' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revokeRole',
    inputs: [
      { type: 'bytes32', name: 'role' },
      { type: 'address', name: 'account' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revokeSkillEndorsement',
    inputs: [
      { type: 'uint256', name: '_tokenId' },
      { type: 'uint256', name: '_skillIndex' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
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
    name: 'safeTransferFrom',
    inputs: [
      { type: 'address', name: '' },
      { type: 'address', name: '' },
      { type: 'uint256', name: '' },
      { type: 'bytes', name: '' },
    ],
    outputs: [],
    stateMutability: 'pure',
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
    name: 'supportsInterface',
    inputs: [{ type: 'bytes4', name: 'interfaceId' }],
    outputs: [{ type: 'bool', name: '' }],
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
    name: 'tokenAchievements',
    inputs: [
      { type: 'uint256', name: '' },
      { type: 'uint256', name: '' },
    ],
    outputs: [
      { type: 'uint8', name: 'achievement' },
      { type: 'uint256', name: 'unlockedAt' },
      { type: 'string', name: 'metadata' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'tokenIdToFreelancerId',
    inputs: [{ type: 'uint256', name: '' }],
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
    name: 'transferFrom',
    inputs: [
      { type: 'address', name: '' },
      { type: 'address', name: '' },
      { type: 'uint256', name: '' },
    ],
    outputs: [],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'unlockAchievement',
    inputs: [
      { type: 'uint256', name: '_tokenId' },
      { type: 'uint8', name: '_achievement' },
      { type: 'string', name: '_metadata' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateReputation',
    inputs: [
      { type: 'uint256', name: '_tokenId' },
      { type: 'uint256', name: '_projectsCompleted' },
      { type: 'uint256', name: '_averageRating' },
      { type: 'uint256', name: '_totalEarnings' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'AchievementUnlocked',
    inputs: [
      {
        type: 'uint256',
        name: 'tokenId',
        indexed: true,
        internalType: 'uint256',
      },
      {
        type: 'uint8',
        name: 'achievement',
        indexed: false,
        internalType: 'enum FreelancerSoulBoundToken.Achievement',
      },
      {
        type: 'string',
        name: 'metadata',
        indexed: false,
        internalType: 'string',
      },
      {
        type: 'uint256',
        name: 'timestamp',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Approval',
    inputs: [
      {
        type: 'address',
        name: 'owner',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'address',
        name: 'approved',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'tokenId',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ApprovalForAll',
    inputs: [
      {
        type: 'address',
        name: 'owner',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'address',
        name: 'operator',
        indexed: true,
        internalType: 'address',
      },
      { type: 'bool', name: 'approved', indexed: false, internalType: 'bool' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ProfileDataUpdated',
    inputs: [
      {
        type: 'uint256',
        name: 'tokenId',
        indexed: true,
        internalType: 'uint256',
      },
      {
        type: 'string',
        name: 'fieldName',
        indexed: false,
        internalType: 'string',
      },
      {
        type: 'string',
        name: 'newValue',
        indexed: false,
        internalType: 'string',
      },
      {
        type: 'uint256',
        name: 'timestamp',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ReputationUpdated',
    inputs: [
      {
        type: 'uint256',
        name: 'tokenId',
        indexed: true,
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: 'totalProjects',
        indexed: false,
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: 'averageRating',
        indexed: false,
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: 'totalEarnings',
        indexed: false,
        internalType: 'uint256',
      },
      {
        type: 'uint256',
        name: 'timestamp',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RoleAdminChanged',
    inputs: [
      { type: 'bytes32', name: 'role', indexed: true, internalType: 'bytes32' },
      {
        type: 'bytes32',
        name: 'previousAdminRole',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        type: 'bytes32',
        name: 'newAdminRole',
        indexed: true,
        internalType: 'bytes32',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RoleGranted',
    inputs: [
      { type: 'bytes32', name: 'role', indexed: true, internalType: 'bytes32' },
      {
        type: 'address',
        name: 'account',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'address',
        name: 'sender',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RoleRevoked',
    inputs: [
      { type: 'bytes32', name: 'role', indexed: true, internalType: 'bytes32' },
      {
        type: 'address',
        name: 'account',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'address',
        name: 'sender',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'SkillEndorsed',
    inputs: [
      {
        type: 'uint256',
        name: 'tokenId',
        indexed: true,
        internalType: 'uint256',
      },
      { type: 'string', name: 'skill', indexed: false, internalType: 'string' },
      { type: 'bool', name: 'verified', indexed: false, internalType: 'bool' },
      {
        type: 'address',
        name: 'endorsedBy',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'timestamp',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'TokenBurned',
    inputs: [
      {
        type: 'uint256',
        name: 'tokenId',
        indexed: true,
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: 'freelancerAddress',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'timestamp',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'TokenMinted',
    inputs: [
      {
        type: 'uint256',
        name: 'tokenId',
        indexed: true,
        internalType: 'uint256',
      },
      {
        type: 'address',
        name: 'freelancerAddress',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'string',
        name: 'freelancerId',
        indexed: false,
        internalType: 'string',
      },
      {
        type: 'uint256',
        name: 'timestamp',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { type: 'address', name: 'from', indexed: true, internalType: 'address' },
      { type: 'address', name: 'to', indexed: true, internalType: 'address' },
      {
        type: 'uint256',
        name: 'tokenId',
        indexed: true,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'AccessControlBadConfirmation',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AccessControlUnauthorizedAccount',
    inputs: [
      { type: 'address', name: 'account', internalType: 'address' },
      { type: 'bytes32', name: 'neededRole', internalType: 'bytes32' },
    ],
  },
  {
    type: 'error',
    name: 'ERC721IncorrectOwner',
    inputs: [
      { type: 'address', name: 'sender', internalType: 'address' },
      { type: 'uint256', name: 'tokenId', internalType: 'uint256' },
      { type: 'address', name: 'owner', internalType: 'address' },
    ],
  },
  {
    type: 'error',
    name: 'ERC721InsufficientApproval',
    inputs: [
      { type: 'address', name: 'operator', internalType: 'address' },
      { type: 'uint256', name: 'tokenId', internalType: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'ERC721InvalidApprover',
    inputs: [{ type: 'address', name: 'approver', internalType: 'address' }],
  },
  {
    type: 'error',
    name: 'ERC721InvalidOperator',
    inputs: [{ type: 'address', name: 'operator', internalType: 'address' }],
  },
  {
    type: 'error',
    name: 'ERC721InvalidOwner',
    inputs: [{ type: 'address', name: 'owner', internalType: 'address' }],
  },
  {
    type: 'error',
    name: 'ERC721InvalidReceiver',
    inputs: [{ type: 'address', name: 'receiver', internalType: 'address' }],
  },
  {
    type: 'error',
    name: 'ERC721InvalidSender',
    inputs: [{ type: 'address', name: 'sender', internalType: 'address' }],
  },
  {
    type: 'error',
    name: 'ERC721NonexistentToken',
    inputs: [{ type: 'uint256', name: 'tokenId', internalType: 'uint256' }],
  },
  {
    type: 'error',
    name: 'ReentrancyGuardReentrantCall',
    inputs: [],
  },
];

// NDA Soul Bound Token ABI
export const NDA_SBT_ABI: Abi = [
  {
    type: 'constructor',
    inputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'ADMIN_ROLE',
    inputs: [],
    outputs: [{ type: 'bytes32', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'BUSINESS_OWNER_ROLE',
    inputs: [],
    outputs: [{ type: 'bytes32', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'DEFAULT_ADMIN_ROLE',
    inputs: [],
    outputs: [{ type: 'bytes32', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'FREELANCER_ROLE',
    inputs: [],
    outputs: [{ type: 'bytes32', name: '' }],
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
    name: 'balanceOf',
    inputs: [{ type: 'address', name: 'owner' }],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'businessOwnerNDAs',
    inputs: [
      { type: 'address', name: '' },
      { type: 'uint256', name: '' },
    ],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'checkAndBurnExpired',
    inputs: [{ type: 'uint256', name: '_tokenId' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'completeWork',
    inputs: [{ type: 'uint256', name: '_tokenId' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createNDA',
    inputs: [
      { type: 'bytes32', name: '_contentHash' },
      { type: 'string', name: '_ipfsHash' },
      { type: 'address', name: '_freelancer' },
      { type: 'uint256', name: '_durationDays' },
    ],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'freelancerNDAs',
    inputs: [
      { type: 'address', name: '' },
      { type: 'uint256', name: '' },
    ],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
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
    name: 'getBusinessOwnerNDAs',
    inputs: [{ type: 'address', name: '_businessOwner' }],
    outputs: [{ type: 'uint256[]', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getFreelancerNDAs',
    inputs: [{ type: 'address', name: '_freelancer' }],
    outputs: [{ type: 'uint256[]', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getNDA',
    inputs: [{ type: 'uint256', name: '_tokenId' }],
    outputs: [
      {
        type: 'tuple',
        name: '',
        components: [
          { type: 'uint256', name: 'id' },
          { type: 'bytes32', name: 'contentHash' },
          { type: 'string', name: 'ipfsHash' },
          { type: 'address', name: 'businessOwner' },
          { type: 'address', name: 'freelancer' },
          { type: 'bytes32', name: 'businessSignature' },
          { type: 'bytes32', name: 'freelancerSignature' },
          { type: 'uint256', name: 'createdAt' },
          { type: 'uint256', name: 'signedAt' },
          { type: 'uint256', name: 'expirationTime' },
          { type: 'uint256', name: 'completionTime' },
          { type: 'uint8', name: 'status' },
          { type: 'bool', name: 'burned' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getRoleAdmin',
    inputs: [{ type: 'bytes32', name: 'role' }],
    outputs: [{ type: 'bytes32', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'grantRole',
    inputs: [
      { type: 'bytes32', name: 'role' },
      { type: 'address', name: 'account' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'hasRole',
    inputs: [
      { type: 'bytes32', name: 'role' },
      { type: 'address', name: 'account' },
    ],
    outputs: [{ type: 'bool', name: '' }],
    stateMutability: 'view',
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
    name: 'isExpired',
    inputs: [{ type: 'uint256', name: '_tokenId' }],
    outputs: [{ type: 'bool', name: '' }],
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
    name: 'ndas',
    inputs: [{ type: 'uint256', name: '' }],
    outputs: [
      { type: 'uint256', name: 'id' },
      { type: 'bytes32', name: 'contentHash' },
      { type: 'string', name: 'ipfsHash' },
      { type: 'address', name: 'businessOwner' },
      { type: 'address', name: 'freelancer' },
      { type: 'bytes32', name: 'businessSignature' },
      { type: 'bytes32', name: 'freelancerSignature' },
      { type: 'uint256', name: 'createdAt' },
      { type: 'uint256', name: 'signedAt' },
      { type: 'uint256', name: 'expirationTime' },
      { type: 'uint256', name: 'completionTime' },
      { type: 'uint8', name: 'status' },
      { type: 'bool', name: 'burned' },
    ],
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
    name: 'renounceRole',
    inputs: [
      { type: 'bytes32', name: 'role' },
      { type: 'address', name: 'callerConfirmation' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'reportViolation',
    inputs: [
      { type: 'uint256', name: '_tokenId' },
      { type: 'string', name: '_reason' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revokeRole',
    inputs: [
      { type: 'bytes32', name: 'role' },
      { type: 'address', name: 'account' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
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
    name: 'safeTransferFrom',
    inputs: [
      { type: 'address', name: '' },
      { type: 'address', name: '' },
      { type: 'uint256', name: '' },
      { type: 'bytes', name: '' },
    ],
    outputs: [],
    stateMutability: 'pure',
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
    name: 'signNDAByBusiness',
    inputs: [
      { type: 'uint256', name: '_tokenId' },
      { type: 'bytes32', name: '_signatureHash' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'signNDAByFreelancer',
    inputs: [
      { type: 'uint256', name: '_tokenId' },
      { type: 'bytes32', name: '_signatureHash' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'supportsInterface',
    inputs: [{ type: 'bytes4', name: 'interfaceId' }],
    outputs: [{ type: 'bool', name: '' }],
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
    name: 'transferFrom',
    inputs: [
      { type: 'address', name: '' },
      { type: 'address', name: '' },
      { type: 'uint256', name: '' },
    ],
    outputs: [],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'verifyDocument',
    inputs: [
      { type: 'uint256', name: '_tokenId' },
      { type: 'string', name: '_document' },
    ],
    outputs: [{ type: 'bool', name: 'matched' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'Approval',
    inputs: [
      { type: 'address', name: 'owner', indexed: true },
      { type: 'address', name: 'approved', indexed: true },
      { type: 'uint256', name: 'tokenId', indexed: true },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ApprovalForAll',
    inputs: [
      { type: 'address', name: 'owner', indexed: true },
      { type: 'address', name: 'operator', indexed: true },
      { type: 'bool', name: 'approved', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'DocumentVerified',
    inputs: [
      { type: 'uint256', name: 'tokenId', indexed: true },
      { type: 'address', name: 'verifier', indexed: true },
      { type: 'bool', name: 'matched', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NDAActivated',
    inputs: [{ type: 'uint256', name: 'tokenId', indexed: true }],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NDABurned',
    inputs: [
      { type: 'uint256', name: 'tokenId', indexed: true },
      { type: 'uint8', name: 'reason', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NDACompleted',
    inputs: [
      { type: 'uint256', name: 'tokenId', indexed: true },
      { type: 'uint256', name: 'completionTime', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NDACreated',
    inputs: [
      { type: 'uint256', name: 'tokenId', indexed: true },
      { type: 'address', name: 'businessOwner', indexed: true },
      { type: 'bytes32', name: 'contentHash', indexed: false },
      { type: 'string', name: 'ipfsHash', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NDASigned',
    inputs: [
      { type: 'uint256', name: 'tokenId', indexed: true },
      { type: 'address', name: 'signer', indexed: true },
      { type: 'bytes32', name: 'signatureHash', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NDAViolationReported',
    inputs: [
      { type: 'uint256', name: 'tokenId', indexed: true },
      { type: 'address', name: 'reporter', indexed: true },
      { type: 'string', name: 'reason', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RoleAdminChanged',
    inputs: [
      { type: 'bytes32', name: 'role', indexed: true },
      { type: 'bytes32', name: 'previousAdminRole', indexed: true },
      { type: 'bytes32', name: 'newAdminRole', indexed: true },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RoleGranted',
    inputs: [
      { type: 'bytes32', name: 'role', indexed: true },
      { type: 'address', name: 'account', indexed: true },
      { type: 'address', name: 'sender', indexed: true },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RoleRevoked',
    inputs: [
      { type: 'bytes32', name: 'role', indexed: true },
      { type: 'address', name: 'account', indexed: true },
      { type: 'address', name: 'sender', indexed: true },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { type: 'address', name: 'from', indexed: true },
      { type: 'address', name: 'to', indexed: true },
      { type: 'uint256', name: 'tokenId', indexed: true },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'AccessControlBadConfirmation',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AccessControlUnauthorizedAccount',
    inputs: [
      { type: 'address', name: 'account' },
      { type: 'bytes32', name: 'neededRole' },
    ],
  },
  {
    type: 'error',
    name: 'ERC721IncorrectOwner',
    inputs: [
      { type: 'address', name: 'sender' },
      { type: 'uint256', name: 'tokenId' },
      { type: 'address', name: 'owner' },
    ],
  },
  {
    type: 'error',
    name: 'ERC721InsufficientApproval',
    inputs: [
      { type: 'address', name: 'operator' },
      { type: 'uint256', name: 'tokenId' },
    ],
  },
  {
    type: 'error',
    name: 'ERC721InvalidApprover',
    inputs: [{ type: 'address', name: 'approver' }],
  },
  {
    type: 'error',
    name: 'ERC721InvalidOperator',
    inputs: [{ type: 'address', name: 'operator' }],
  },
  {
    type: 'error',
    name: 'ERC721InvalidOwner',
    inputs: [{ type: 'address', name: 'owner' }],
  },
  {
    type: 'error',
    name: 'ERC721InvalidReceiver',
    inputs: [{ type: 'address', name: 'receiver' }],
  },
  {
    type: 'error',
    name: 'ERC721InvalidSender',
    inputs: [{ type: 'address', name: 'sender' }],
  },
  {
    type: 'error',
    name: 'ERC721NonexistentToken',
    inputs: [{ type: 'uint256', name: 'tokenId' }],
  },
  {
    type: 'error',
    name: 'ReentrancyGuardReentrantCall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'StringsInsufficientHexLength',
    inputs: [
      { type: 'uint256', name: 'value', internalType: 'uint256' },
      { type: 'uint256', name: 'length', internalType: 'uint256' },
    ],
  },
];

// MyToken (ERC20) ABI
export const MY_TOKEN_ABI: Abi = [
  {
    type: 'constructor',
    inputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'BURNER_ROLE',
    inputs: [],
    outputs: [{ type: 'bytes32', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'DEFAULT_ADMIN_ROLE',
    inputs: [],
    outputs: [{ type: 'bytes32', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'MINTER_ROLE',
    inputs: [],
    outputs: [{ type: 'bytes32', name: '' }],
    stateMutability: 'view',
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
      { type: 'uint256', name: 'value' },
    ],
    outputs: [{ type: 'bool', name: '' }],
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
    name: 'burn',
    inputs: [
      { type: 'address', name: 'from' },
      { type: 'uint256', name: 'amount' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
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
    name: 'getRoleAdmin',
    inputs: [{ type: 'bytes32', name: 'role' }],
    outputs: [{ type: 'bytes32', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'grantRole',
    inputs: [
      { type: 'bytes32', name: 'role' },
      { type: 'address', name: 'account' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'hasRole',
    inputs: [
      { type: 'bytes32', name: 'role' },
      { type: 'address', name: 'account' },
    ],
    outputs: [{ type: 'bool', name: '' }],
    stateMutability: 'view',
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
    name: 'name',
    inputs: [],
    outputs: [{ type: 'string', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'renounceRole',
    inputs: [
      { type: 'bytes32', name: 'role' },
      { type: 'address', name: 'callerConfirmation' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revokeRole',
    inputs: [
      { type: 'bytes32', name: 'role' },
      { type: 'address', name: 'account' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'supportsInterface',
    inputs: [{ type: 'bytes4', name: 'interfaceId' }],
    outputs: [{ type: 'bool', name: '' }],
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
    name: 'totalSupply',
    inputs: [],
    outputs: [{ type: 'uint256', name: '' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'transfer',
    inputs: [
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'value' },
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
      { type: 'uint256', name: 'value' },
    ],
    outputs: [{ type: 'bool', name: '' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'Approval',
    inputs: [
      {
        type: 'address',
        name: 'owner',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'address',
        name: 'spender',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'uint256',
        name: 'value',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RoleAdminChanged',
    inputs: [
      { type: 'bytes32', name: 'role', indexed: true, internalType: 'bytes32' },
      {
        type: 'bytes32',
        name: 'previousAdminRole',
        indexed: true,
        internalType: 'bytes32',
      },
      {
        type: 'bytes32',
        name: 'newAdminRole',
        indexed: true,
        internalType: 'bytes32',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RoleGranted',
    inputs: [
      { type: 'bytes32', name: 'role', indexed: true, internalType: 'bytes32' },
      {
        type: 'address',
        name: 'account',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'address',
        name: 'sender',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RoleRevoked',
    inputs: [
      { type: 'bytes32', name: 'role', indexed: true, internalType: 'bytes32' },
      {
        type: 'address',
        name: 'account',
        indexed: true,
        internalType: 'address',
      },
      {
        type: 'address',
        name: 'sender',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { type: 'address', name: 'from', indexed: true, internalType: 'address' },
      { type: 'address', name: 'to', indexed: true, internalType: 'address' },
      {
        type: 'uint256',
        name: 'value',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'AccessControlBadConfirmation',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AccessControlUnauthorizedAccount',
    inputs: [
      { type: 'address', name: 'account', internalType: 'address' },
      { type: 'bytes32', name: 'neededRole', internalType: 'bytes32' },
    ],
  },
  {
    type: 'error',
    name: 'ERC20InsufficientAllowance',
    inputs: [
      { type: 'address', name: 'spender', internalType: 'address' },
      { type: 'uint256', name: 'allowance', internalType: 'uint256' },
      { type: 'uint256', name: 'needed', internalType: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'ERC20InsufficientBalance',
    inputs: [
      { type: 'address', name: 'sender', internalType: 'address' },
      { type: 'uint256', name: 'balance', internalType: 'uint256' },
      { type: 'uint256', name: 'needed', internalType: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'ERC20InvalidApprover',
    inputs: [{ type: 'address', name: 'approver', internalType: 'address' }],
  },
  {
    type: 'error',
    name: 'ERC20InvalidReceiver',
    inputs: [{ type: 'address', name: 'receiver', internalType: 'address' }],
  },
  {
    type: 'error',
    name: 'ERC20InvalidSender',
    inputs: [{ type: 'address', name: 'sender', internalType: 'address' }],
  },
  {
    type: 'error',
    name: 'ERC20InvalidSpender',
    inputs: [{ type: 'address', name: 'spender', internalType: 'address' }],
  },
];

// Staking Rewards ABI
export const STAKING_REWARDS_ABI: Abi = [
  {
    type: 'constructor',
    inputs: [
      { type: 'address', name: '_stakingToken', internalType: 'address' },
      { type: 'address', name: '_rewardToken', internalType: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ type: 'address', name: '', internalType: 'address' }],
    outputs: [{ type: 'uint256', name: '', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'duration',
    inputs: [],
    outputs: [{ type: 'uint256', name: '', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'earned',
    inputs: [{ type: 'address', name: '_account', internalType: 'address' }],
    outputs: [{ type: 'uint256', name: '', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'finishAt',
    inputs: [],
    outputs: [{ type: 'uint256', name: '', internalType: 'uint256' }],
    stateMutability: 'view',
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
    name: 'lastTimeRewardApplicable',
    inputs: [],
    outputs: [{ type: 'uint256', name: '', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'notifyRewardAmount',
    inputs: [{ type: 'uint256', name: '_amount', internalType: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ type: 'address', name: '', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'penalize',
    inputs: [{ type: 'address', name: '_user', internalType: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'rewardPerToken',
    inputs: [],
    outputs: [{ type: 'uint256', name: '', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'rewardPerTokenStored',
    inputs: [],
    outputs: [{ type: 'uint256', name: '', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'rewardRate',
    inputs: [],
    outputs: [{ type: 'uint256', name: '', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'rewards',
    inputs: [{ type: 'address', name: '', internalType: 'address' }],
    outputs: [{ type: 'uint256', name: '', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'rewardsToken',
    inputs: [],
    outputs: [{ type: 'address', name: '', internalType: 'contract IERC20' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'setRewardsDuration',
    inputs: [{ type: 'uint256', name: '_duration', internalType: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'stake',
    inputs: [{ type: 'uint256', name: '_amount', internalType: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'stakingToken',
    inputs: [],
    outputs: [{ type: 'address', name: '', internalType: 'contract IERC20' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalSupply',
    inputs: [],
    outputs: [{ type: 'uint256', name: '', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'updatedAt',
    inputs: [],
    outputs: [{ type: 'uint256', name: '', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'userRewardPerTokenPaid',
    inputs: [{ type: 'address', name: '', internalType: 'address' }],
    outputs: [{ type: 'uint256', name: '', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'withdraw',
    inputs: [{ type: 'uint256', name: '_amount', internalType: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'RewardNotified',
    inputs: [
      {
        type: 'uint256',
        name: 'newRate',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RewardPaid',
    inputs: [
      { type: 'address', name: 'user', indexed: true, internalType: 'address' },
      {
        type: 'uint256',
        name: 'reward',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RewardsDurationSet',
    inputs: [
      {
        type: 'uint256',
        name: 'newDuration',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Staked',
    inputs: [
      { type: 'address', name: 'user', indexed: true, internalType: 'address' },
      {
        type: 'uint256',
        name: 'amount',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Withdrawn',
    inputs: [
      { type: 'address', name: 'user', indexed: true, internalType: 'address' },
      {
        type: 'uint256',
        name: 'amount',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'ReentrancyGuardReentrantCall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'SafeERC20FailedOperation',
    inputs: [{ type: 'address', name: 'token', internalType: 'address' }],
  },
];

// Contract addresses (Polygon Amoy Testnet)
export const FREELANCER_CONTRACT_POLYGON_AMOY =
  '0x1f04977be437ade69ad867ecf8bfc3b3ae7abcc4';
export const FREELANCER_SBT_POLYGON_AMOY =
  '0xac0484c2361504ae8f71e95a149f7a81cd7bdda5';
export const NDA_SBT_POLYGON_AMOY =
  '0xc032155ef5cd589055c4015aeebebf8e188a3981';
export const MY_TOKEN_POLYGON_AMOY =
  '0x010f6eab067cbd0d3849db6d2fa86958414e3d3b';
export const STAKING_REWARDS_POLYGON_AMOY =
  '0xe36914d8ce3bcfa489fc9ad7e4fea0d43253b19a';

// Legacy aliases for backward compatibility
export const FREELANCER_CONTRACT_SEPOLIA = FREELANCER_CONTRACT_POLYGON_AMOY;
export const FREELANCER_SBT_SEPOLIA = FREELANCER_SBT_POLYGON_AMOY;
export const NDA_SBT_SEPOLIA = NDA_SBT_POLYGON_AMOY;
export const MY_TOKEN_SEPOLIA = MY_TOKEN_POLYGON_AMOY;
export const STAKING_REWARDS_SEPOLIA = STAKING_REWARDS_POLYGON_AMOY;
