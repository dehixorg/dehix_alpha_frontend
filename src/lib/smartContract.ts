// /lib/constants.ts
export const CONTRACT_ADDRESS: string =
  '0xe4473a35CF1557FE41Cec0aEe9AE03E082Bc6A5b';
export const DXUT_NFT_ADDRESS: string =
  '0xEb80d1978225aCf580e256d13CCef0846d00F66c'; // Replace with actual DXUT NFT contract address

// Import the DXUTPlatform ABI
import { DXUT_PLATFORM_ABI } from './dxutPlatformABI';

// ABI for DXUTPlatform contract
export const CONTRACT_ABI: any[] = DXUT_PLATFORM_ABI;

// Contract interaction functions
export const getContract = async () => {
  if (typeof window === 'undefined') return null;


  const { ethers } = await import('ethers');


  // Check if MetaMask is installed
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();


  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

// Contract functions
export const contractFunctions = {
  // Create escrow for a project
  createEscrow: async (freelancerAddress: string, amount: string) => {
    const contract = await getContract();
    if (!contract) throw new Error('Contract not available');


    const { ethers } = await import('ethers');
    const tx = await contract.createEscrow(freelancerAddress, {
      value: ethers.parseEther(amount),
    });
    return await tx.wait();
  },

  // Release escrow to freelancer
  releaseEscrow: async (escrowId: number) => {
    const contract = await getContract();
    if (!contract) throw new Error('Contract not available');


    const tx = await contract.releaseEscrow(escrowId);
    return await tx.wait();
  },

  // Refund client
  refundClient: async (escrowId: number) => {
    const contract = await getContract();
    if (!contract) throw new Error('Contract not available');


    const tx = await contract.refundClient(escrowId);
    return await tx.wait();
  },

  // Mint interview NFT
  mintInterviewNFT: async (freelancerAddress: string) => {
    const contract = await getContract();
    if (!contract) throw new Error('Contract not available');


    const tx = await contract.mintInterviewNFT(freelancerAddress);
    return await tx.wait();
  },

  // Give reward tokens
  reward: async (toAddress: string) => {
    const contract = await getContract();
    if (!contract) throw new Error('Contract not available');


    const tx = await contract.reward(toAddress);
    return await tx.wait();
  },

  // Check if address is registered
  isAddressRegistered: async (userAddress: string) => {
    const contract = await getContract();
    if (!contract) throw new Error('Contract not available');


    return await contract.isAddressRegistered(userAddress);
  },

  // Get user's token balance
  getBalance: async (userAddress: string) => {
    const contract = await getContract();
    if (!contract) throw new Error('Contract not available');


    const { ethers } = await import('ethers');
    const balance = await contract.balanceOf(userAddress);
    return ethers.formatEther(balance);
  },

  // Get escrow details
  getEscrow: async (escrowId: number) => {
    const contract = await getContract();
    if (!contract) throw new Error('Contract not available');


    return await contract.escrows(escrowId);
  },

  // Get escrow counter
  getEscrowCounter: async () => {
    const contract = await getContract();
    if (!contract) throw new Error('Contract not available');


    return await contract.escrowCounter();
  },
};
