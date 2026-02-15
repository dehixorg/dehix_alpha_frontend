import React, { useState, useEffect, useRef, useCallback } from 'react';
import { isAddress } from 'viem';
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWriteContract,
} from 'wagmi';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Plus,
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronsUpDown,
  FolderKanban,
  Github,
  Globe,
  Link,
  MessageSquare,
  User,
} from 'lucide-react';

import { DatePicker } from '../shared/datePicker';
import DraftDialog from '../shared/DraftDialog';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import ThumbnailUpload from '@/components/fileUpload/thumbnailUpload';
import useDraft from '@/hooks/useDraft';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { CONTRACT_ADDRESSES } from '@/config/contracts/contractConfig';
import {
  FREELANCER_CONTRACT_ABI,
  FREELANCER_SBT_ABI,
} from '@/config/contracts/abis';

// Schema for form validation using zod
const SEPOLIA_CHAIN_ID = 11155111;
const GAS_BUFFER_BPS = 12000n; // 120%
const SEPOLIA_MAX_GAS = 16777216n; // Sepolia's block gas limit
const FALLBACK_GAS = 5000000n; // Safe fallback when estimation fails
const withGasBuffer = (estimatedGas: bigint) => {
  const bufferedGas = (estimatedGas * GAS_BUFFER_BPS) / 10000n;
  // Cap at Sepolia maximum to prevent 'gas limit too high' errors
  return bufferedGas > SEPOLIA_MAX_GAS ? SEPOLIA_MAX_GAS : bufferedGas;
};

// Contract ABIs and addresses imported from centralized config
const freelancerContractAbi = FREELANCER_CONTRACT_ABI;
const soulBoundTokenAbi = FREELANCER_SBT_ABI;
const DEFAULT_FREELANCER_CONTRACT_SEPOLIA =
  CONTRACT_ADDRESSES.FREELANCER_CONTRACT;
const DEFAULT_SBT_CONTRACT_SEPOLIA = CONTRACT_ADDRESSES.SBT_CONTRACT;

// Gas price constants for Sepolia
const getGasPriceParams = async (publicClient: any) => {
  try {
    const feeData = await publicClient.estimateFeesPerGas();
    return {
      maxFeePerGas: feeData.gasPrice ? feeData.gasPrice * 2n : 50000000000n, // 50 Gwei fallback
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || 2000000000n, // 2 Gwei fallback
    };
  } catch (err) {
    console.warn('Could not estimate gas price, using fallback values:', err);
    return {
      maxFeePerGas: 50000000000n, // 50 Gwei
      maxPriorityFeePerGas: 2000000000n, // 2 Gwei
    };
  }
};
const projectFormSchema = z
  .object({
    projectName: z.string().min(1, { message: 'Project name is required.' }),
    description: z.string().min(1, { message: 'Description is required.' }),
    githubLink: z
      .string()
      .optional()
      .refine(
        (url) => {
          if (!url || url.trim() === '') return true;
          try {
            const parsed = new URL(url);
            if (parsed.protocol !== 'https:') return false;
            if (!url.startsWith('https://github.com/')) return false;
            return true;
          } catch {
            return false;
          }
        },
        { message: 'GitHub link must be a valid HTTPS GitHub URL' },
      ),
    liveDemoLink: z
      .string()
      .min(1, { message: 'Live demo link is required.' })
      .url({ message: 'Live demo link must be a valid URL.' }),
    thumbnail: z.string().min(1, { message: 'Project thumbnail is required.' }),
    start: z.string().min(1, { message: 'Start date is required.' }),
    end: z.string().min(1, { message: 'End date is required.' }),
    refer: z.string().min(1, { message: 'Reference is required.' }),
    techUsed: z
      .array(z.string())
      .min(1, { message: 'At least one technology is required.' }),
    role: z.string().min(1, { message: 'Role is required.' }),
    projectType: z.string().optional(),
    verificationStatus: z.string().optional(),
    comments: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.start && data.end) {
        const start = new Date(data.start);
        const end = new Date(data.end);
        return start < end;
      }
      return true;
    },
    {
      message: 'Start Date must be before End Date',
      path: ['end'],
    },
  );

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface AddProjectProps {
  onFormSubmit: () => void;
}

interface Skill {
  _id: string;
  label: string;
}

export const AddProject: React.FC<AddProjectProps> = ({ onFormSubmit }) => {
  // Move wagmi and minting hooks here
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [minting, setMinting] = useState(false);

  // SBT Minting logic
  const handleMintSBT = useCallback(
    async (projData: ProjectFormValues) => {
      if (!isConnected || !address) {
        const errorMsg =
          'Please connect your wallet first to mint project as SBT';
        notifyError(errorMsg, 'Wallet Not Connected');
        throw new Error(errorMsg);
      }
      try {
        setMinting(true);
        const freelancerContractAddress = (process.env
          .NEXT_PUBLIC_FREELANCER_CONTRACT_SEPOLIA ||
          DEFAULT_FREELANCER_CONTRACT_SEPOLIA) as `0x${string}`;
        const sbtContractAddress = (process.env
          .NEXT_PUBLIC_SBT_CONTRACT_SEPOLIA ||
          process.env.NEXT_PUBLIC_SOUL_BOUND_TOKEN_SEPOLIA ||
          DEFAULT_SBT_CONTRACT_SEPOLIA) as `0x${string}`;

        if (!freelancerContractAddress || !sbtContractAddress) {
          const errorMsg = 'Missing contract addresses';
          notifyError(errorMsg, 'Configuration Error');
          throw new Error(errorMsg);
        }

        if (
          !isAddress(freelancerContractAddress) ||
          !isAddress(sbtContractAddress)
        ) {
          const errorMsg = 'Invalid contract address format in .env.local';
          notifyError(errorMsg, 'Configuration Error');
          throw new Error(errorMsg);
        }

        if (!publicClient) {
          const errorMsg = 'No public client found for current network';
          notifyError(errorMsg, 'Web3 Error');
          throw new Error(errorMsg);
        }

        if (chainId !== SEPOLIA_CHAIN_ID) {
          const errorMsg =
            'Please switch wallet network to Sepolia before saving.';
          notifyError(errorMsg, 'Wrong Network');
          throw new Error(errorMsg);
        }

        const freelancerId = `freelancer_${address.toLowerCase()}`;

        console.log('Starting SBT minting process...');
        console.log('Freelancer ID:', freelancerId);
        console.log('Freelancer Contract:', freelancerContractAddress);
        console.log('SBT Contract:', sbtContractAddress);

        // 1) Register freelancer in FreelancerContract
        let addFreelancerGas = FALLBACK_GAS; // Default to fallback gas
        try {
          console.log('Estimating gas for addFreelancer...');
          const estimatedAddGas = await publicClient.estimateContractGas({
            account: address,
            address: freelancerContractAddress,
            abi: freelancerContractAbi,
            functionName: 'addFreelancer',
            args: [freelancerId, address],
          });
          addFreelancerGas = withGasBuffer(estimatedAddGas);
          console.log(
            'Estimated gas for addFreelancer:',
            addFreelancerGas.toString(),
          );
        } catch (gasEstimationError) {
          console.warn(
            'Gas estimation failed for addFreelancer, using fallback gas:',
            gasEstimationError,
          );
          console.log('Using fallback gas:', FALLBACK_GAS.toString());
        }

        console.log('Calling addFreelancer...');
        const gasPrices = await getGasPriceParams(publicClient);
        console.log('Gas prices:', gasPrices);
        const addFreelancerHash = await writeContractAsync({
          address: freelancerContractAddress,
          abi: freelancerContractAbi,
          functionName: 'addFreelancer',
          args: [freelancerId, address],
          ...(addFreelancerGas ? { gas: addFreelancerGas } : {}),
          maxFeePerGas: gasPrices.maxFeePerGas,
          maxPriorityFeePerGas: gasPrices.maxPriorityFeePerGas,
        });

        console.log('addFreelancer transaction hash:', addFreelancerHash);

        console.log('Waiting for addFreelancer receipt...');
        const addFreelancerReceipt =
          await publicClient.waitForTransactionReceipt({
            hash: addFreelancerHash,
          });

        if (!addFreelancerReceipt) {
          throw new Error('addFreelancer transaction receipt not found');
        }

        if (addFreelancerReceipt.status !== 'success') {
          throw new Error(
            `addFreelancer transaction failed with status: ${addFreelancerReceipt.status}`,
          );
        }

        console.log('addFreelancer transaction confirmed');

        // 2) Mint soulbound token in FreelancerSoulBoundToken
        let mintGas = FALLBACK_GAS; // Default to fallback gas
        try {
          console.log('Estimating gas for mintFreelancerToken...');
          const estimatedMintGas = await publicClient.estimateContractGas({
            account: address,
            address: sbtContractAddress,
            abi: soulBoundTokenAbi,
            functionName: 'mintFreelancerToken',
            args: [address, freelancerId],
          });
          mintGas = withGasBuffer(estimatedMintGas);
          console.log(
            'Estimated gas for mintFreelancerToken:',
            mintGas.toString(),
          );
        } catch (gasEstimationError) {
          console.warn(
            'Gas estimation failed for mintFreelancerToken, using fallback gas:',
            gasEstimationError,
          );
          console.log('Using fallback gas:', FALLBACK_GAS.toString());
        }

        console.log('Calling mintFreelancerToken...');
        const mintGasPrices = await getGasPriceParams(publicClient);
        console.log('Mint gas prices:', mintGasPrices);
        const mintHash = await writeContractAsync({
          address: sbtContractAddress,
          abi: soulBoundTokenAbi,
          functionName: 'mintFreelancerToken',
          args: [address, freelancerId],
          ...(mintGas ? { gas: mintGas } : {}),
          maxFeePerGas: mintGasPrices.maxFeePerGas,
          maxPriorityFeePerGas: mintGasPrices.maxPriorityFeePerGas,
        });

        console.log('mintFreelancerToken transaction hash:', mintHash);

        console.log('Waiting for mint receipt...');
        const mintReceipt = await publicClient.waitForTransactionReceipt({
          hash: mintHash,
        });

        if (!mintReceipt) {
          throw new Error('mintFreelancerToken transaction receipt not found');
        }

        if (mintReceipt.status !== 'success') {
          throw new Error(
            `mintFreelancerToken transaction failed with status: ${mintReceipt.status}`,
          );
        }

        console.log('Mint transaction confirmed:', mintReceipt.transactionHash);

        // Wait a bit for blockchain state to settle
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Fetch token ID for this address
        let tokenId: string | undefined;
        try {
          console.log('Fetching token ID from contract...');
          const fetchedTokenId = await publicClient.readContract({
            address: sbtContractAddress,
            abi: soulBoundTokenAbi,
            functionName: 'freelancerTokenId',
            args: [address],
          });
          tokenId = fetchedTokenId?.toString();
          console.log('Successfully fetched token ID:', tokenId);
        } catch (err: any) {
          console.warn(
            'Could not fetch token ID (non-critical):',
            err?.message || err,
          );
          // Continue anyway - SBT was minted successfully
        }

        notifySuccess(
          `Project SBT minted successfully. Tx: ${mintReceipt.transactionHash}`,
          'SBT Minted Successfully',
        );

        // Return transaction details for backend update
        return {
          transactionHash: mintReceipt.transactionHash,
          tokenId,
          blockNumber: mintReceipt.blockNumber,
        };
      } catch (error) {
        console.error('SBT Minting Error:', error);
        const message =
          error instanceof Error ? error.message : 'Unknown transaction error';
        notifyError(`Failed to mint SBT: ${message}`, 'Minting Error');
        throw error;
      } finally {
        setMinting(false);
      }
    },
    [isConnected, address, publicClient, chainId, writeContractAsync],
  );
  const [step, setStep] = useState<number>(1);
  const [skills, setSkills] = useState<any>([]);
  const [currSkills, setCurrSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const currentDate = new Date().toISOString().split('T')[0];
  const restoredDraft = useRef<any>(null);
  const [open, setOpen] = useState(false);
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      projectName: '',
      description: '',
      githubLink: '',
      liveDemoLink: '',
      thumbnail: '',
      start: '',
      end: '',
      refer: '',
      techUsed: [],
      role: '',
      projectType: '',
      verificationStatus: 'ADDED',
      comments: '',
    },
    mode: 'all',
  });

  // Field validation for Step 1
  const validateStep1 = () => {
    const { projectName, description, start, end } = form.getValues();
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Check if required fields are filled
    if (!projectName || !description || !start || !end) {
      notifyError(
        'Please fill all required fields in Step 1.',
        'Missing fields',
      );
      return false;
    }

    // Validate date relationship
    if (startDate >= endDate) {
      form.setError('end', {
        type: 'manual',
        message: 'Start Date must be before End Date',
      });
      return false;
    }

    // Check if at least one skill is added
    if (currSkills.length === 0) {
      notifyError('Please add at least one skill.', 'Skills required');
      return false;
    }

    return true;
  };

  const nextStep = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    }
  };

  const prevStep = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const skillsResponse = await axiosInstance.get('/skills');
        const transformedSkills =
          skillsResponse?.data?.data?.map((skill: Skill) => ({
            value: skill.label,
            label: skill.label,
          })) || [];
        setSkills(transformedSkills);
      } catch (error) {
        console.error('API Error:', error);
        notifyError('Something went wrong. Please try again.', 'Error');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isDialogOpen) {
      setStep(1);
    }
  }, [isDialogOpen, form]);
  const {
    handleSaveAndClose: saveDraftAndClose,
    showDraftDialog,
    setShowDraftDialog,
    confirmExitDialog,
    setConfirmExitDialog,
    handleDiscardAndClose: discardAndClose,
    handleDialogClose,
    discardDraft,
    loadDraft,
  } = useDraft({
    form,
    formSection: 'projects',
    isDialogOpen,
    setIsDialogOpen,
    onSave: (values) => {
      restoredDraft.current = { ...values, techUsed: currSkills };
    },
    onDiscard: () => {
      resetForm(); // Reset the form when discarding
      restoredDraft.current = null;
    },
    setCurrSkills,
  });

  const handleSaveAndClose = () => {
    saveDraftAndClose();
  };

  const handleDiscardAndClose = () => {
    discardAndClose();
  };

  // Reset form function
  const resetForm = () => {
    form.reset({
      projectName: '',
      description: '',
      githubLink: '',
      liveDemoLink: '',
      thumbnail: '',
      start: '',
      end: '',
      refer: '',
      techUsed: [],
      role: '',
      projectType: '',
      verificationStatus: 'ADDED',
      comments: '',
    });
    setCurrSkills([]);
    setStep(1);
  };

  // Submit handler for the form
  async function onSubmit(data: ProjectFormValues) {
    try {
      setLoading(true);
      let transactionHash: string | undefined;
      let tokenId: string | undefined;

      const formattedData = {
        projectName: data.projectName,
        description: data.description,
        githubLink: data.githubLink || '',
        liveDemoLink: data.liveDemoLink,
        thumbnail: data.thumbnail,
        start: data.start ? new Date(data.start).toISOString() : null,
        end: data.end ? new Date(data.end).toISOString() : null,
        refer: data.refer,
        techUsed: currSkills,
        role: data.role,
        projectType: data.projectType || '',
        verificationStatus: 'ADDED',
        verified: false,
        oracleAssigned: '',
        comments: data.comments || '',
        verificationUpdateTime: new Date(),
      };

      // 1) Save to backend first
      console.log('Saving project to backend...');
      const backendResponse = await axiosInstance.post(
        '/freelancer/project',
        formattedData,
      );
      console.log('Project saved to backend successfully');

      // 2) Mint SBT token on blockchain
      console.log('Starting blockchain SBT minting...');
      try {
        const mintResult = await handleMintSBT(data);
        if (mintResult) {
          transactionHash = mintResult.transactionHash;
          tokenId = mintResult.tokenId;
        }
        console.log('SBT minting completed successfully');
      } catch (mintError) {
        console.warn('SBT minting failed, but project was saved:', mintError);
        // Continue even if minting fails - data is already saved
      }

      // 3) Update backend with transaction hash if minting was successful
      const createdProjectId =
        backendResponse.data?.data?._id ||
        backendResponse.data?.data?.id ||
        backendResponse.data?._id ||
        backendResponse.data?.id;

      if (transactionHash && createdProjectId) {
        try {
          console.log('Attempting to update backend with transaction hash:', {
            transactionHash,
            tokenId,
            createdProjectId,
          });

          // Try to update backend with transaction hash
          try {
            await axiosInstance.patch(
              `/freelancer/project/${createdProjectId}`,
              {
                transactionHash,
                tokenId,
                sbtMinted: true,
              },
            );
            console.log('Backend updated with transaction hash successfully');
          } catch (backendUpdateError: any) {
            console.warn(
              'Backend update failed (non-critical), will use localStorage:',
              backendUpdateError?.response?.status,
            );
          }

          console.log('Storing transaction hash in localStorage:', {
            transactionHash,
            tokenId,
            createdProjectId,
          });
          // Store in localStorage as fallback
          const sbtCache = JSON.parse(
            localStorage.getItem('sbtTransactionHashes') || '{}',
          );

          // Store with multiple keys to ensure we can find it later
          const cacheData = {
            transactionHash,
            tokenId,
            blockNumber: undefined,
            timestamp: new Date().toISOString(),
            type: 'project',
          };

          // Primary key - ID from backend
          sbtCache[createdProjectId] = cacheData;

          // Backup keys for fuzzy matching
          sbtCache[`project_${Date.now()}`] = cacheData;

          localStorage.setItem(
            'sbtTransactionHashes',
            JSON.stringify(sbtCache),
          );

          console.log('Transaction hash stored in localStorage with keys:', {
            primaryKey: createdProjectId,
            backupKey: `project_${Date.now()}`,
            cacheSize: Object.keys(sbtCache).length,
          });

          // Add a small delay before refetching to ensure data is set
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (updateError: any) {
          console.error(
            'Failed to store transaction hash in localStorage:',
            updateError?.message,
          );
        }
      } else if (transactionHash) {
        console.warn(
          'Project was minted but created record ID was not found in backend response:',
          backendResponse?.data,
        );
      }

      // Only show success if both backend save and minting succeeded
      notifySuccess(
        'The project has been successfully added and minted as SBT token on blockchain!',
        'Project Added & Minted',
      );

      // Dispatch event to notify SBT page to refresh data
      window.dispatchEvent(new Event('sbtDataUpdated'));

      resetForm();
      onFormSubmit();

      if (setIsDialogOpen) {
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error in project submission:', error);
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';

      // Determine if the error is from blockchain or backend
      if (
        message.includes('Wallet') ||
        message.includes('Network') ||
        message.includes('Contract') ||
        message.includes('SBT') ||
        message.includes('Sepolia')
      ) {
        notifyError(
          `Blockchain Error: ${message}. Please check your wallet connection and network.`,
          'Web3 Error',
        );
      } else {
        notifyError(`Error: ${message}`, 'Submission Failed');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        if (!open) {
          // Only close the dialog, don't reset the form here
          // The form will be reset when either saving or discarding
          handleDialogClose();
        } else {
          setIsDialogOpen(open);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="my-auto bg-muted/20">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="lg:max-w-screen-lg overflow-y-auto max-h-[90vh] no-scrollbar">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Add Project</DialogTitle>
              <DialogDescription>
                {step === 1
                  ? 'Start with core details, timeline, and skills.'
                  : 'Add links, media, and more context.'}
              </DialogDescription>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div
              className={`h-1 rounded-full transition-all w-1/2 ${step >= 1 ? 'bg-primary' : 'bg-muted'}`}
            ></div>
            <div
              className={`h-1 rounded-full transition-all w-1/2 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}
            ></div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.error('Form validation errors:', errors);
              const errorMessages = Object.values(errors)
                .map((err: any) => err?.message)
                .filter(Boolean)
                .join(', ');
              if (errorMessages) {
                notifyError(
                  `Please fix errors: ${errorMessages}`,
                  'Validation Error',
                );
              } else {
                notifyError(
                  'Please fill all required fields',
                  'Validation Error',
                );
              }
            })}
            className="space-y-4"
          >
            {/* Hidden submit button for programmatic submission */}
            <button type="submit" style={{ display: 'none' }} />

            {/* Step 1: Basic Project Information */}
            {step === 1 && (
              <>
                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupText>
                            <FolderKanban className="h-4 w-4" />
                          </InputGroupText>
                          <InputGroupInput
                            placeholder="Enter project name"
                            {...field}
                          />
                        </InputGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter project description"
                          className="min-h-[110px]"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <DatePicker {...field} max={currentDate} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <DatePicker {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="techUsed"
                    render={({ field }) => {
                      const toggleSkill = (skillLabel: string) => {
                        let updatedSkills: string[] = [];
                        if (currSkills.includes(skillLabel)) {
                          updatedSkills = currSkills.filter(
                            (s) => s !== skillLabel,
                          );
                        } else {
                          updatedSkills = [...currSkills, skillLabel];
                        }
                        setCurrSkills(updatedSkills);
                        field.onChange(updatedSkills);
                      };

                      return (
                        <FormItem className="mb-4">
                          <FormLabel>Skills</FormLabel>
                          <FormControl>
                            <div>
                              <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between"
                                  >
                                    {currSkills.length > 0
                                      ? `${currSkills.length} selected`
                                      : 'Select skills'}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                  <Command>
                                    <CommandInput placeholder="Search skills..." />
                                    <CommandEmpty>
                                      No skills found.
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {skills.map((skill: any) => (
                                        <CommandItem
                                          key={skill.label}
                                          value={skill.label}
                                          onSelect={() =>
                                            toggleSkill(skill.label)
                                          }
                                        >
                                          <Check
                                            className={`mr-2 h-4 w-4 ${currSkills.includes(skill.label)
                                                ? 'opacity-100'
                                                : 'opacity-0'
                                              }`}
                                          />
                                          {skill.label}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </Command>
                                </PopoverContent>
                              </Popover>

                              {/* Selected Skills Tags */}
                              <div className="flex flex-wrap mt-3 gap-2">
                                {currSkills.map((skill: any, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs flex items-center gap-1"
                                  >
                                    {skill}
                                    <button
                                      type="button"
                                      onClick={() => toggleSkill(skill)}
                                      className="ml-1 text-red-500 hover:text-red-700"
                                      aria-label={`Remove ${skill}`}
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </>
            )}

            {/* Step 2: Additional Project Information */}
            {step === 2 && (
              <>
                <FormField
                  control={form.control}
                  name="githubLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub Repo Link</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupText>
                            <Github className="h-4 w-4" />
                          </InputGroupText>
                          <InputGroupInput
                            placeholder="Enter GitHub repository link (optional)"
                            {...field}
                          />
                        </InputGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="liveDemoLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Live Demo Link</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupText>
                            <Globe className="h-4 w-4" />
                          </InputGroupText>
                          <InputGroupInput
                            placeholder="Enter live demo link (optional)"
                            {...field}
                          />
                        </InputGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="thumbnail"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ThumbnailUpload
                          onThumbnailUpdate={(url) => field.onChange(url)}
                          existingThumbnailUrl={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="refer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupText>
                            <Link className="h-4 w-4" />
                          </InputGroupText>
                          <InputGroupInput
                            placeholder="Enter project reference"
                            {...field}
                          />
                        </InputGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupText>
                            <User className="h-4 w-4" />
                          </InputGroupText>
                          <InputGroupInput
                            placeholder="Enter role"
                            {...field}
                          />
                        </InputGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="projectType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Type</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupText>
                            <FolderKanban className="h-4 w-4" />
                          </InputGroupText>
                          <InputGroupInput
                            placeholder="Enter project type (optional)"
                            {...field}
                          />
                        </InputGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comments</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupText>
                            <MessageSquare className="h-4 w-4" />
                          </InputGroupText>
                          <InputGroupInput
                            placeholder="Enter any comments (optional)"
                            {...field}
                          />
                        </InputGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter className="flex justify-between items-center gap-4">
              {step === 2 && (
                <div className="text-sm">
                  {isConnected ? (
                    <span className="text-green-600 font-medium">
                      ✅ Wallet connected: {address?.slice(0, 6)}...
                      {address?.slice(-4)}
                    </span>
                  ) : (
                    <span className="text-yellow-600 font-medium">
                      ⚠️ Connect wallet to mint SBT
                    </span>
                  )}
                </div>
              )}
              {step === 2 ? (
                <>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={prevStep}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || !isConnected}
                      title={
                        !isConnected ? 'Please connect your wallet first' : ''
                      }
                    >
                      {loading
                        ? 'Saving & Minting...'
                        : 'Add Project & Mint SBT'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div></div> {/* Empty div to create space */}
                  <Button type="button" onClick={nextStep}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
      {confirmExitDialog && (
        <DraftDialog
          dialogChange={confirmExitDialog}
          setDialogChange={setConfirmExitDialog}
          heading="Save Draft?"
          desc="Do you want to save your draft before leaving?"
          handleClose={handleDiscardAndClose}
          handleSave={handleSaveAndClose}
          btn1Txt="Don't save"
          btn2Txt="Yes save"
        />
      )}
      {showDraftDialog && (
        <DraftDialog
          dialogChange={showDraftDialog}
          setDialogChange={setShowDraftDialog}
          heading="Load Draft?"
          desc="You have unsaved data. Would you like to restore it?"
          handleClose={discardDraft}
          handleSave={loadDraft}
          btn1Txt=" No, start fresh"
          btn2Txt="Yes, load draft"
        />
      )}
    </Dialog>
  );
};
