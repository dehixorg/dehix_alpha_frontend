import React, { useRef, useState, useCallback } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  GraduationCap,
  Plus,
  School,
} from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
//import { isAddress } from 'viem';
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWriteContract,
} from 'wagmi';

import DraftDialog from '../shared/DraftDialog';
import { DatePicker } from '../shared/datePicker';

import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { axiosInstance } from '@/lib/axiosinstance';
import useDraft from '@/hooks/useDraft';
import { CONTRACT_ADDRESSES } from '@/config/contracts/contractConfig';
import {
  FREELANCER_CONTRACT_ABI,
  FREELANCER_SBT_ABI,
} from '@/config/contracts/abis';

const toDateOnly = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const POLYGON_AMOY_CHAIN_ID = 80002;
const GAS_BUFFER_BPS = 12000n; // 120%
const POLYGON_AMOY_MAX_GAS = 20000000n; // Polygon Amoy block gas limit
const FALLBACK_GAS = 5000000n; // Safe fallback when estimation fails
const withGasBuffer = (estimatedGas: bigint) => {
  const bufferedGas = (estimatedGas * GAS_BUFFER_BPS) / 10000n;
  // Cap at Polygon Amoy maximum to prevent 'gas limit too high' errors
  return bufferedGas > POLYGON_AMOY_MAX_GAS
    ? POLYGON_AMOY_MAX_GAS
    : bufferedGas;
};

// Contract ABIs and addresses imported from centralized config
const freelancerContractAbi = FREELANCER_CONTRACT_ABI;
const soulBoundTokenAbi = FREELANCER_SBT_ABI;

// Gas price estimation for Polygon Amoy (requires minimum 25 Gwei priority fee)
const POLYGON_AMOY_MIN_PRIORITY = 25000000000n; // 25 Gwei
const getGasPriceParams = async (publicClient: any) => {
  try {
    const feeData = await publicClient.estimateFeesPerGas();
    const priority = feeData.maxPriorityFeePerGas || POLYGON_AMOY_MIN_PRIORITY;
    const safePriority =
      priority < POLYGON_AMOY_MIN_PRIORITY
        ? POLYGON_AMOY_MIN_PRIORITY
        : priority;
    const baseFee =
      feeData.maxFeePerGas || feeData.gasPrice * 2n || 100000000000n;
    const safeMaxFee =
      baseFee < safePriority * 2n ? safePriority * 2n : baseFee;
    return { maxFeePerGas: safeMaxFee, maxPriorityFeePerGas: safePriority };
  } catch {
    return {
      maxFeePerGas: POLYGON_AMOY_MIN_PRIORITY * 4n, // 100 Gwei
      maxPriorityFeePerGas: POLYGON_AMOY_MIN_PRIORITY,
    };
  }
};

const FormSchema = z
  .object({
    degree: z.string().min(1, { message: 'Degree is required' }),
    universityName: z
      .string()
      .min(1, { message: 'University name is required' }),
    fieldOfStudy: z.string().min(1, { message: 'Field of study is required' }),
    startDate: z
      .string()
      .min(1, { message: 'Start date is required' })
      .datetime({ message: 'Invalid Start date.' }),
    endDate: z
      .union([
        z.string().trim().datetime({ message: 'Invalid End date.' }),
        z.literal(''),
      ])
      .transform((val) => (val === '' ? undefined : val))
      .optional(),
    ongoing: z.boolean().optional(),
    grade: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.ongoing && !data.endDate) {
      ctx.addIssue({
        code: 'custom',
        message: 'End date is required',
        path: ['endDate'],
      });
    }

    if (data.startDate) {
      const start = toDateOnly(new Date(data.startDate));
      const today = toDateOnly(new Date());

      if (start > today) {
        ctx.addIssue({
          code: 'custom',
          message: 'Start date cannot be in the future',
          path: ['startDate'],
        });
      }

      if (!data.ongoing && data.endDate) {
        const end = toDateOnly(new Date(data.endDate));
        if (start >= end) {
          ctx.addIssue({
            code: 'custom',
            message: 'Start Date must be before End Date',
            path: ['endDate'],
          });
        }
      }
    }
  });

interface AddEducationProps {
  onFormSubmit: () => void;
}

export const AddEducation: React.FC<AddEducationProps> = ({ onFormSubmit }) => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [minting, setMinting] = useState(false);

  // SBT Minting logic
  const handleMintSBT = useCallback(
    async (eduData: z.infer<typeof FormSchema>) => {
      if (!isConnected || !address) {
        const errorMsg =
          'Please connect your wallet first to mint education as SBT';
        notifyError(errorMsg, 'Wallet Not Connected');
        throw new Error(errorMsg);
      }
      try {
        setMinting(true);
        const freelancerContractAddress =
          CONTRACT_ADDRESSES.FREELANCER_CONTRACT as `0x${string}`;
        const sbtContractAddress =
          CONTRACT_ADDRESSES.SBT_CONTRACT as `0x${string}`;

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

        // Check existing SBTs for this address
        let existingTokenId: string | undefined;
        try {
          const balance = await publicClient.readContract({
            address: sbtContractAddress,
            abi: soulBoundTokenAbi,
            functionName: 'balanceOf',
            args: [address],
          });
          if (balance && BigInt(balance as bigint) > 0n) {
            const tokenIds = (await publicClient.readContract({
              address: sbtContractAddress,
              abi: soulBoundTokenAbi,
              functionName: 'getTokenIdsByFreelancer',
              args: [address],
            })) as bigint[];
            existingTokenId =
              tokenIds.length > 0
                ? tokenIds[tokenIds.length - 1].toString()
                : undefined;
            console.log(
              'Existing SBTs for this address. Latest Token ID:',
              existingTokenId,
            );
          }
        } catch (err) {
          console.log('No existing SBT found, proceeding with minting...');
        }

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
          const tokenIds = (await publicClient.readContract({
            address: sbtContractAddress,
            abi: soulBoundTokenAbi,
            functionName: 'getTokenIdsByFreelancer',
            args: [address],
          })) as bigint[];
          tokenId =
            tokenIds.length > 0
              ? tokenIds[tokenIds.length - 1].toString()
              : undefined;
          console.log('Successfully fetched token ID:', tokenId);
        } catch (err: any) {
          console.warn(
            'Could not fetch token ID (non-critical):',
            err?.message || err,
          );
          // Continue anyway - SBT was minted successfully
        }

        notifySuccess(
          `Education SBT minted successfully. Tx: ${mintReceipt.transactionHash}`,
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

  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [step, setStep] = useState<number>(1);
  const currentDate = new Date().toISOString().split('T')[0];
  const restoredDraft = useRef<any>(null);

  React.useEffect(() => {
    if (isDialogOpen) {
      setStep(1);
    }
  }, [isDialogOpen]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      degree: '',
      universityName: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      ongoing: false,
      grade: '',
    },
  });

  const ongoing = form.watch('ongoing');

  const resetForm = useCallback(() => {
    form.reset({
      degree: '',
      universityName: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      ongoing: false,
      grade: '',
    });
    restoredDraft.current = null;
  }, [form]);

  const validateStep1 = () => {
    const { degree, universityName, fieldOfStudy } = form.getValues();
    if (!degree || !universityName || !fieldOfStudy) {
      notifyError(
        'Please fill degree, university and field of study.',
        'Missing fields',
      );
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    }
  };
  const prevStep = () => {
    if (step === 2) setStep(1);
  };

  const {
    showDraftDialog,
    setShowDraftDialog,
    confirmExitDialog,
    setConfirmExitDialog,
    loadDraft,
    discardDraft,
    handleSaveAndClose,
    handleDiscardAndClose: handleDiscardAndCloseDraft,
    handleDialogClose,
  } = useDraft({
    form,
    formSection: 'education',
    isDialogOpen,
    setIsDialogOpen,
    onSave: (values) => {
      restoredDraft.current = { ...values };
    },
    onDiscard: () => {
      resetForm();
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      setLoading(true);
      let transactionHash: string | undefined;
      let tokenId: string | undefined;

      const formattedData = {
        degree: data.degree,
        universityName: data.universityName,
        fieldOfStudy: data.fieldOfStudy,
        startDate: data.startDate
          ? new Date(data.startDate).toISOString()
          : null,
        endDate: data.ongoing
          ? null
          : data.endDate
            ? new Date(data.endDate).toISOString()
            : null,
        grade: data.grade,
        oracleAssigned: '',
        verificationStatus: 'ADDED',
        verificationUpdateTime: new Date(),
        comments: '',
      };

      // Save to backend first
      console.log('Saving education to backend...');
      const backendResponse = await axiosInstance.post(
        '/freelancer/education',
        formattedData,
      );
      console.log(
        'Education saved to backend successfully:',
        JSON.stringify(backendResponse.data, null, 2),
      );

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
        console.warn('SBT minting failed, but education was saved:', mintError);
        // Continue even if minting fails - data is already saved
      }

      // 3) Update backend with transaction hash if minting was successful
      const createdEducationId =
        backendResponse.data?.data?.educationId ||
        backendResponse.data?.educationId ||
        backendResponse.data?.data?._id ||
        backendResponse.data?.data?.id ||
        backendResponse.data?._id ||
        backendResponse.data?.id;

      console.log('Extracted education ID for update:', {
        createdEducationId,
        fullResponse: backendResponse.data,
        dataData: backendResponse.data?.data,
      });

      if (transactionHash && createdEducationId) {
        try {
          console.log('Attempting to update backend with transaction hash:', {
            transactionHash,
            tokenId,
            createdEducationId,
          });

          // Try to update backend with transaction hash
          try {
            await axiosInstance.put(
              `/freelancer/education/${createdEducationId}`,
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
            createdEducationId,
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
            type: 'education',
          };

          // Primary key - ID from backend
          sbtCache[createdEducationId] = cacheData;

          // Backup keys for fuzzy matching
          sbtCache[`education_${Date.now()}`] = cacheData;

          localStorage.setItem(
            'sbtTransactionHashes',
            JSON.stringify(sbtCache),
          );

          console.log('Transaction hash stored in localStorage with keys:', {
            primaryKey: createdEducationId,
            backupKey: `education_${Date.now()}`,
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
          'Education was minted but created record ID was not found in backend response:',
          backendResponse?.data,
        );
      }

      // Only show success if both backend save and minting succeeded
      notifySuccess(
        'The education has been successfully added and minted as SBT token on blockchain!',
        'Education Added & Minted',
      );

      // Dispatch event to notify SBT page to refresh data
      window.dispatchEvent(new Event('sbtDataUpdated'));

      resetForm();
      onFormSubmit();

      if (setIsDialogOpen) {
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error in education submission:', error);
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
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Add Education</DialogTitle>
              <DialogDescription>
                {step === 1
                  ? 'Tell us about your degree and institute.'
                  : 'Add the timeline and optional grade.'}
              </DialogDescription>
            </div>
          </div>
          {/* Stepper */}
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
            onSubmit={form.handleSubmit(onSubmit, () => {
              notifyError(
                'Please fill in all required fields',
                'Validation Error',
              );
            })}
            className="space-y-4"
          >
            <button type="submit" style={{ display: 'none' }} />
            {step === 1 && (
              <>
                <FormField
                  control={form.control}
                  name="degree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Degree</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupText>
                            <GraduationCap className="h-4 w-4" />
                          </InputGroupText>
                          <InputGroupInput
                            placeholder="e.g., B.Tech in Computer Science"
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
                  name="universityName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>University / Institute</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupText>
                            <School className="h-4 w-4" />
                          </InputGroupText>
                          <InputGroupInput
                            placeholder="e.g., IIT Delhi"
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
                  name="fieldOfStudy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field of Study</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupText>
                            <BookOpen className="h-4 w-4" />
                          </InputGroupText>
                          <InputGroupInput
                            placeholder="e.g., Computer Science"
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

            {step === 2 && (
              <>
                <FormField
                  control={form.control}
                  name="startDate"
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
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-3">
                        <FormLabel>End Date</FormLabel>
                        <FormField
                          control={form.control}
                          name="ongoing"
                          render={({ field: ongoingField }) => (
                            <div className="flex items-center gap-2">
                              <FormLabel className="text-xs text-muted-foreground">
                                Currently studying
                              </FormLabel>
                              <Switch
                                checked={Boolean(ongoingField.value)}
                                onCheckedChange={(val) => {
                                  ongoingField.onChange(Boolean(val));
                                  if (val) {
                                    form.setValue('endDate', '');
                                    form.clearErrors('endDate');
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade (optional)</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupText>
                            <Award className="h-4 w-4" />
                          </InputGroupText>
                          <InputGroupInput
                            placeholder="e.g., 8.5 CGPA / A"
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

            <DialogFooter className="flex justify-between pt-4">
              {step === 2 ? (
                <>
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                </>
              ) : (
                <>
                  <div />
                  <Button type="button" onClick={nextStep}>
                    Next <ArrowRight className="h-4 w-4 ml-2" />
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
          handleClose={handleDiscardAndCloseDraft}
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
