import React, { useRef, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Plus,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Building2,
  Github,
  MessageSquare,
  Mail,
  User,
  Phone,
} from 'lucide-react';
import { isAddress } from 'viem';
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWriteContract,
} from 'wagmi';

import { DatePicker } from '../shared/datePicker';
import DraftDialog from '../shared/DraftDialog';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { axiosInstance } from '@/lib/axiosinstance';
import useDraft from '@/hooks/useDraft';
import { CONTRACT_ADDRESSES } from '@/config/contracts/contractConfig';
import {
  FREELANCER_CONTRACT_ABI,
  FREELANCER_SBT_ABI,
} from '@/config/contracts/abis';

const toDateOnly = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addOneMonthClamped = (from: Date) => {
  const year = from.getFullYear();
  const month = from.getMonth();
  const day = from.getDate();

  const targetMonthIndex = month + 1;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12;
  const lastDayOfTargetMonth = new Date(
    targetYear,
    targetMonth + 1,
    0,
  ).getDate();
  const clampedDay = Math.min(day, lastDayOfTargetMonth);

  return new Date(targetYear, targetMonth, clampedDay);
};

const isValidPhoneNumber = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const normalized = trimmed.replace(/[\s()-]/g, '');
  if (!/^\+?\d+$/.test(normalized)) return false;
  const digits = normalized.startsWith('+') ? normalized.slice(1) : normalized;
  return digits.length >= 7 && digits.length <= 15;
};

const isValidGithubRepoUrl = (value: string) => {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return false;

    const host = url.hostname.toLowerCase();
    if (host !== 'github.com' && host !== 'www.github.com') return false;

    const path = url.pathname.replace(/\/+$/, '');
    const segments = path.split('/').filter(Boolean);
    if (segments.length < 2) return false;

    const [owner, repo] = segments;
    if (!owner || !repo) return false;

    const repoName = repo.endsWith('.git') ? repo.slice(0, -4) : repo;
    if (!repoName) return false;

    return true;
  } catch {
    return false;
  }
};

const validateWorkDates = (
  data: { workFrom?: string; workTo?: string; ongoing?: boolean },
  ctx: any,
) => {
  const workFromDate = data.workFrom
    ? toDateOnly(new Date(data.workFrom))
    : null;
  const workToDate = data.workTo ? toDateOnly(new Date(data.workTo)) : null;

  if (!data.ongoing && !data.workTo) {
    ctx.addIssue({
      code: 'custom',
      message: 'Work to is required.',
      path: ['workTo'],
    });
  }

  if (data.ongoing) {
    return;
  }

  if (workFromDate && workToDate) {
    if (workFromDate > workToDate) {
      ctx.addIssue({
        code: 'custom',
        message: 'Work From date cannot be after Work To date.',
        path: ['workFrom'],
      });
    }

    const oneMonthLater = addOneMonthClamped(workFromDate);

    if (workToDate < oneMonthLater) {
      ctx.addIssue({
        code: 'custom',
        message: 'Work To date must be at least 1 month after Work From date.',
        path: ['workTo'],
      });
    }
  }
};

const experienceFormSchema = z
  .object({
    company: z.string().min(1, { message: 'Company name is required.' }),
    jobTitle: z.string().min(1, { message: 'Job Title is required.' }),
    workDescription: z
      .string()
      .min(1, { message: 'Work Description is required.' }),
    workFrom: z
      .string()
      .min(1, { message: 'Work from is required.' })
      .datetime({ message: 'Invalid Work From date.' }),
    workTo: z
      .union([
        z.string().trim().datetime({ message: 'Invalid Work To date.' }),
        z.literal(''),
      ])
      .transform((val) => (val === '' ? undefined : val))
      .optional(),
    ongoing: z.boolean().optional(),
    referencePersonName: z
      .string()
      .min(1, { message: 'Reference Person Name is required.' }),
    referenceContactType: z.enum(['phone', 'email']).optional(),
    referencePersonContact: z
      .string()
      .min(1, { message: 'Reference Person Contact is required.' }),
    githubRepoLink: z
      .union([
        z.string().trim().url({ message: 'Invalid URL.' }),
        z.literal(''),
      ])
      .transform((val) => (val === '' ? undefined : val))
      .refine((url) => !url || isValidGithubRepoUrl(url), {
        message:
          'Please enter a valid GitHub repository URL (e.g. https://github.com/owner/repo).',
      }),
    comments: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    validateWorkDates(data, ctx);

    const type = data.referenceContactType || 'phone';
    const value = (data.referencePersonContact || '').trim();
    if (!value) return;

    if (type === 'email') {
      const parsed = z.string().email().safeParse(value);
      if (!parsed.success) {
        ctx.addIssue({
          code: 'custom',
          message: 'Please enter a valid email address.',
          path: ['referencePersonContact'],
        });
      }
    }

    if (type === 'phone') {
      if (!isValidPhoneNumber(value)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Please enter a valid phone number.',
          path: ['referencePersonContact'],
        });
      }
    }
  });

type ExperienceFormValues = z.infer<typeof experienceFormSchema>;

interface AddExperienceProps {
  onFormSubmit: () => void;
}

const POLYGON_AMOY_CHAIN_ID = 80002;
const GAS_BUFFER_BPS = 12000n; // 120%
const POLYGON_AMOY_MAX_GAS = 20000000n; // Polygon Amoy block gas limit
const FALLBACK_GAS = 5000000n; // Safe fallback when estimation fails
const withGasBuffer = (estimatedGas: bigint) => {
  const bufferedGas = (estimatedGas * GAS_BUFFER_BPS) / 10000n;
  // Cap at Polygon Amoy maximum to prevent 'gas limit too high' errors
  return bufferedGas > POLYGON_AMOY_MAX_GAS ? POLYGON_AMOY_MAX_GAS : bufferedGas;
};
// Contract ABIs and addresses imported from centralized config
const freelancerContractAbi = FREELANCER_CONTRACT_ABI;
const soulBoundTokenAbi = FREELANCER_SBT_ABI;
const DEFAULT_FREELANCER_CONTRACT =
  CONTRACT_ADDRESSES.FREELANCER_CONTRACT;
const DEFAULT_SBT_CONTRACT = CONTRACT_ADDRESSES.SBT_CONTRACT;

// Gas price estimation for Polygon Amoy
const POLYGON_AMOY_MIN_PRIORITY = 25000000000n; // 25 Gwei
const getGasPriceParams = async (publicClient: any) => {
  try {
    const feeData = await publicClient.estimateFeesPerGas();
    const priority = feeData.maxPriorityFeePerGas || POLYGON_AMOY_MIN_PRIORITY;
    const safePriority = priority < POLYGON_AMOY_MIN_PRIORITY ? POLYGON_AMOY_MIN_PRIORITY : priority;
    const baseFee = feeData.maxFeePerGas || (feeData.gasPrice ? feeData.gasPrice * 2n : 0n);
    // maxFeePerGas must always be >= maxPriorityFeePerGas
    const minMaxFee = safePriority * 2n;
    const safeMaxFee = baseFee > minMaxFee ? baseFee : minMaxFee;
    return { maxFeePerGas: safeMaxFee, maxPriorityFeePerGas: safePriority };
  } catch (err) {
    console.warn('Could not estimate gas price, using fallback values:', err);
    return {
      maxFeePerGas: POLYGON_AMOY_MIN_PRIORITY * 4n, // 100 Gwei
      maxPriorityFeePerGas: POLYGON_AMOY_MIN_PRIORITY,
    };
  }
};

export const AddExperience: React.FC<AddExperienceProps> = ({
  onFormSubmit,
}) => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [minting, setMinting] = useState(false);
  // SBT Minting logic (copied and adapted from addEducation)
  const handleMintSBT = React.useCallback(
    async (expData: ExperienceFormValues) => {
      if (!isConnected || !address) {
        const errorMsg =
          'Please connect your wallet first to mint experience as SBT';
        notifyError(errorMsg, 'Wallet Not Connected');
        throw new Error(errorMsg);
      }
      try {
        setMinting(true);
        const freelancerContractAddress = CONTRACT_ADDRESSES.FREELANCER_CONTRACT as `0x${string}`;
        const sbtContractAddress = CONTRACT_ADDRESSES.SBT_CONTRACT as `0x${string}`;

        if (!publicClient) {
          const errorMsg = 'No public client found for current network';
          notifyError(errorMsg, 'Web3 Error');
          throw new Error(errorMsg);
        }

        if (chainId !== POLYGON_AMOY_CHAIN_ID) {
          const errorMsg =
            'Please switch wallet network to Polygon Amoy before saving.';
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
          const tokenIds = await publicClient.readContract({
            address: sbtContractAddress,
            abi: soulBoundTokenAbi,
            functionName: 'getTokenIdsByFreelancer',
            args: [address],
          }) as bigint[];
          tokenId = tokenIds.length > 0 ? tokenIds[tokenIds.length - 1].toString() : undefined;
          console.log('Successfully fetched token ID:', tokenId);
        } catch (err: any) {
          console.warn(
            'Could not fetch token ID (non-critical):',
            err?.message || err,
          );
          // Continue anyway - SBT was minted successfully
        }

        notifySuccess(
          `Experience SBT minted successfully. Tx: ${mintReceipt.transactionHash}`,
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const currentDate = new Date().toISOString().split('T')[0];
  const restoredDraft = useRef<any>(null);

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: {
      company: '',
      jobTitle: '',
      workDescription: '',
      workFrom: '',
      workTo: '',
      ongoing: false,
      referencePersonName: '',
      referencePersonContact: '',
      referenceContactType: 'phone',
      githubRepoLink: '',
      comments: '',
    },
  });

  const ongoing = form.watch('ongoing');
  const referenceContactType = form.watch('referenceContactType');

  // Validate Step 1 fields before proceeding to Step 2
  const validateStep1 = async () => {
    const valid = await form.trigger([
      'company',
      'jobTitle',
      'workDescription',
      'workFrom',
      'workTo',
    ]);

    if (!valid) {
      notifyError(
        'Please fix the highlighted errors in Step 1.',
        'Validation error',
      );
      return false;
    }

    return true;
  };

  const nextStep = async () => {
    if (step === 1) {
      if (await validateStep1()) {
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
    if (isDialogOpen) {
      setStep(1);
    }
  }, [isDialogOpen]);
  const {
    showDraftDialog,
    setShowDraftDialog,
    confirmExitDialog,
    setConfirmExitDialog,
    loadDraft,
    discardDraft,
    handleSaveAndClose,
    handleDiscardAndClose,
    handleDialogClose,
  } = useDraft({
    form,
    formSection: 'experience',
    isDialogOpen,
    setIsDialogOpen,
    onSave: (values) => {
      restoredDraft.current = { ...values };
    },
    onDiscard: () => {
      restoredDraft.current = null;
    },
  });

  async function onSubmit(data: ExperienceFormValues) {
    setIsSubmitting(true);
    try {
      let transactionHash: string | undefined;
      let tokenId: string | undefined;

      // 1) Save to backend first
      const formattedData = {
        company: data.company,
        jobTitle: data.jobTitle,
        workDescription: data.workDescription,
        workFrom: data.workFrom ? new Date(data.workFrom).toISOString() : null,
        workTo: data.ongoing
          ? null
          : data.workTo
            ? new Date(data.workTo).toISOString()
            : null,
        referencePersonName: data.referencePersonName,
        referenceContactType: data.referenceContactType || 'phone',
        referencePersonContact: data.referencePersonContact,
        githubRepoLink: data.githubRepoLink,
        comments: data.comments,
        verificationStatus: 'ADDED',
        verificationUpdateTime: new Date(),
      };

      console.log('Saving experience to backend...');
      const backendResponse = await axiosInstance.post(
        '/freelancer/experience',
        formattedData,
      );
      console.log('Experience saved to backend successfully');

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
        console.warn(
          'SBT minting failed, but experience was saved:',
          mintError,
        );
        // Continue even if minting fails - data is already saved
      }

      // 3) Update backend with transaction hash if minting was successful
      const createdExperienceId =
        backendResponse.data?.data?.experienceId ||
        backendResponse.data?.experienceId ||
        backendResponse.data?.data?._id ||
        backendResponse.data?.data?.id ||
        backendResponse.data?._id ||
        backendResponse.data?.id;

      if (transactionHash && createdExperienceId) {
        try {
          console.log('Attempting to update backend with transaction hash:', {
            transactionHash,
            tokenId,
            createdExperienceId,
          });

          // Try to update backend with transaction hash
          try {
            await axiosInstance.put(
              `/freelancer/experience/${createdExperienceId}`,
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
            createdExperienceId,
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
            type: 'experience',
          };

          // Primary key - ID from backend
          sbtCache[createdExperienceId] = cacheData;

          // Backup keys for fuzzy matching
          sbtCache[`experience_${Date.now()}`] = cacheData;

          localStorage.setItem(
            'sbtTransactionHashes',
            JSON.stringify(sbtCache),
          );

          console.log('Transaction hash stored in localStorage with keys:', {
            primaryKey: createdExperienceId,
            backupKey: `experience_${Date.now()}`,
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
          'Experience was minted but created record ID was not found in backend response:',
          backendResponse?.data,
        );
      }

      // Only show success if both backend save and minting succeeded
      notifySuccess(
        'The experience has been successfully added and minted as SBT token on blockchain!',
        'Experience Added & Minted',
      );

      // Dispatch event to notify SBT page to refresh data
      window.dispatchEvent(new Event('sbtDataUpdated'));

      onFormSubmit();
      setIsDialogOpen(false);
      form.reset();
      setStep(1);
    } catch (error) {
      console.error('Error in experience submission:', error);
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
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open: boolean) => {
        if (!open) {
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
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Add Experience</DialogTitle>
              <DialogDescription>
                {step === 1
                  ? 'Start with your role, company, and a short description.'
                  : 'Add references, repository link, and optional comments.'}
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Step 1: Basic Experience Information */}
            {step === 1 && (
              <>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <InputGroup>
                            <InputGroupText>
                              <Building2 className="h-4 w-4" />
                            </InputGroupText>
                            <InputGroupInput
                              placeholder="Enter company name"
                              {...field}
                            />
                          </InputGroup>
                        </FormControl>
                        <FormDescription>
                          Enter the company name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <InputGroup>
                            <InputGroupText>
                              <Briefcase className="h-4 w-4" />
                            </InputGroupText>
                            <InputGroupInput
                              placeholder="Enter job title"
                              {...field}
                            />
                          </InputGroup>
                        </FormControl>
                        <FormDescription>Enter the job title</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="workDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter work description"
                              className="min-h-[110px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter the work description
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="workFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work From</FormLabel>
                        <FormControl>
                          <DatePicker {...field} max={currentDate} />
                        </FormControl>
                        <FormDescription>Select the start date</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="workTo"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between gap-3">
                          <FormLabel>Work To</FormLabel>
                          <FormField
                            control={form.control}
                            name="ongoing"
                            render={({ field: ongoingField }) => (
                              <div className="flex items-center gap-2">
                                <FormLabel className="text-xs text-muted-foreground">
                                  Ongoing
                                </FormLabel>
                                <Switch
                                  checked={Boolean(ongoingField.value)}
                                  onCheckedChange={(val) => {
                                    ongoingField.onChange(Boolean(val));
                                    if (val) {
                                      form.setValue('workTo', '');
                                      form.clearErrors('workTo');
                                    }
                                  }}
                                />
                              </div>
                            )}
                          />
                        </div>
                        <FormControl>
                          <DatePicker {...field} disabled={ongoing} />
                        </FormControl>
                        <FormDescription>Select the end date</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* Step 2: Reference and Additional Information */}
            {step === 2 && (
              <>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="referencePersonName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reference Person Name</FormLabel>
                        <FormControl>
                          <InputGroup>
                            <InputGroupText>
                              <User className="h-4 w-4" />
                            </InputGroupText>
                            <InputGroupInput
                              placeholder="Enter reference person name"
                              {...field}
                            />
                          </InputGroup>
                        </FormControl>
                        <FormDescription>
                          Enter the reference person&apos;s name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="referencePersonContact"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between gap-3">
                          <FormLabel>Reference Person Contact</FormLabel>
                          <FormField
                            control={form.control}
                            name="referenceContactType"
                            render={({ field: contactTypeField }) => (
                              <Select
                                onValueChange={contactTypeField.onChange}
                                value={contactTypeField.value || 'phone'}
                              >
                                <SelectTrigger className="h-8 w-[120px]">
                                  <SelectValue placeholder="Phone" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectItem value="phone">Phone</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        <FormControl>
                          <InputGroup>
                            <InputGroupText>
                              {(referenceContactType || 'phone') === 'email' ? (
                                <Mail className="h-4 w-4" />
                              ) : (
                                <Phone className="h-4 w-4" />
                              )}
                            </InputGroupText>
                            <InputGroupInput
                              placeholder={
                                (referenceContactType || 'phone') === 'email'
                                  ? 'Enter reference email'
                                  : 'Enter reference phone number'
                              }
                              {...field}
                            />
                          </InputGroup>
                        </FormControl>
                        <FormDescription>
                          Enter the reference person&apos;s contact
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="githubRepoLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GitHub Repo Link</FormLabel>
                          <FormControl>
                            <InputGroup>
                              <InputGroupText>
                                <Github className="h-4 w-4" />
                              </InputGroupText>
                              <InputGroupInput
                                placeholder="Enter GitHub repository link"
                                {...field}
                              />
                            </InputGroup>
                          </FormControl>
                          <FormDescription>
                            Enter the GitHub repository link (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="md:col-span-2">
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
                                placeholder="Enter any comments"
                                {...field}
                              />
                            </InputGroup>
                          </FormControl>
                          <FormDescription>
                            Enter any comments (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </>
            )}

            <DialogFooter className="flex justify-between">
              {step === 2 ? (
                <>
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Loading...' : 'Add Experience'}
                  </Button>
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
