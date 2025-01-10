// 'use client';
// import { zodResolver } from '@hookform/resolvers/zod';
// import {
//   Briefcase,
//   CheckCircle2,
//   ChevronDown,
//   ChevronUp,
//   Eye,
//   EyeOff,
//   LoaderCircle,
//   Rocket,
//   Shield,
//   User,
// } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import React, { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { z } from 'zod';
// import PropTypes from 'prop-types';

// import countries from '../../../country-codes.json';

// import PhoneNumberForm from './phoneNumberChecker';

// import TextInput from '@/components/shared/input';
// import OtpLogin from '@/components/shared/otpDialog';
// import { Button } from '@/components/ui/button';
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormMessage,
// } from '@/components/ui/form';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { toast } from '@/components/ui/use-toast';
// import { axiosInstance } from '@/lib/axiosinstance';

// interface Step {
//   id: number;
//   label: string;
//   icon: React.ElementType; // The type for React components
// }

// interface SignupStepperProps {
//   currentStep?: number;
// }

// const SignupStepper: React.FC<SignupStepperProps> = ({ currentStep = 1 }) => {
//   const steps: Step[] = [
//     { id: 1, label: 'Personal Info', icon: User },
//     { id: 2, label: 'Professional Info', icon: Briefcase },
//     { id: 3, label: 'Verification', icon: Shield },
//   ];

//   return (
//     <div className="w-full py-6 mb-8">
//       <div className="flex items-center justify-center">
//         {steps.map((step, index) => (
//           <React.Fragment key={step.id}>
//             <div className="relative">
//               <div
//                 className={`w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all duration-300
//                   ${
//                     currentStep > step.id
//                       ? 'bg-primary border-primary dark:bg-primary dark:border-primary'
//                       : currentStep === step.id
//                         ? 'border-primary bg-background text-primary dark:bg-background dark:text-primary'
//                         : 'border-muted bg-background text-muted dark:border-muted dark:bg-background dark:text-muted'
//                   }`}
//               >
//                 {currentStep > step.id ? (
//                   <CheckCircle2 className="w-6 h-6 text-background dark:text-background" />
//                 ) : (
//                   <step.icon className="w-6 h-6" />
//                 )}
//               </div>
//               <span
//                 className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-sm whitespace-nowrap font-medium
//                 ${currentStep >= step.id ? 'text-primary dark:text-primary' : 'text-muted-foreground dark:text-muted-foreground'}`}
//               >
//                 {step.label}
//               </span>
//             </div>
//             {index < steps.length - 1 && (
//               <div className="w-24 mx-2 h-[2px] bg-muted dark:bg-muted">
//                 <div
//                   className="h-full bg-primary dark:bg-primary transition-all duration-500"
//                   style={{ width: currentStep > step.id ? '100%' : '0%' }}
//                 />
//               </div>
//             )}
//           </React.Fragment>
//         ))}
//       </div>
//     </div>
//   );
// };

// const formSchema = z.object({
//   step1: z
//     .object({
//       firstName: z
//         .string()
//         .min(2, { message: 'First Name must be at least 2 characters.' }),
//       lastName: z
//         .string()
//         .min(2, { message: 'Last Name must be at least 2 characters.' }),
//       email: z
//         .string()
//         .email({ message: 'Please enter a valid email address.' }),
//       userName: z
//         .string()
//         .min(3, { message: 'Username must be at least 3 characters.' })
//         .regex(/^[a-zA-Z0-9_]+$/, {
//           message:
//             'Username can only contain letters, numbers, and underscores.',
//         }),
//       password: z
//         .string()
//         .min(6, { message: 'Password must be at least 6 characters.' }),
//       confirmPassword: z.string(),
//       dob: z.string().min(1, { message: 'Date of birth is required.' }),
//     })
//     .refine((data) => data.password === data.confirmPassword, {
//       message: "Passwords don't match",
//       path: ['confirmPassword'],
//     }),
//   step2: z.object({
//     perHourPrice: z.number().min(1, { message: 'Hourly rate is required.' }),
//     workExperience: z
//       .number()
//       .min(1, { message: 'Work experience is required.' }),
//     githubLink: z.string().url().optional().or(z.literal('')),
//     linkedin: z.string().url().optional().or(z.literal('')),
//     personalWebsite: z.string().url().optional().or(z.literal('')),
//   }),
//   step3: z.object({
//     phone: z
//       .string()
//       .min(10, { message: 'Phone number must be at least 10 digits.' }),
//   }),
// });

// const FreelancerRegisterForm = () => {
//   const router = useRouter();
//   const [currentStep, setCurrentStep] = useState(1);
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [showOptionalInfo, setShowOptionalInfo] = useState(false);
//   const [code, setCode] = useState('IN');
//   const [phone, setPhone] = useState('');
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isVerified, setIsVerified] = useState(false);

//   const form = useForm({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       step1: {
//         firstName: '',
//         lastName: '',
//         email: '',
//         userName: '',
//         password: '',
//         confirmPassword: '',
//         dob: '',
//       },
//       step2: {
//         perHourPrice: 0,
//         workExperience: 0,
//         githubLink: '',
//         linkedin: '',
//         personalWebsite: '',
//       },
//       step3: {
//         phone: '',
//       },
//     },
//     mode: 'onBlur',
//     shouldUnregister: false, // Add this line
//   });

//   // Modify handleNext to preserve values
//   const handlePrevious = () => {
//     setCurrentStep((prev) => prev - 1);
//   };

//   const handleVerification = () => {
//     setIsModalOpen(true);
//     // Simulate OTP verification after 5 seconds
//     setTimeout(() => {
//       setIsVerified(true);
//       setIsModalOpen(false);
//       toast({
//         title: 'Phone number verified successfully!',
//         description: 'You can now create your account.',
//       });
//     }, 5000);
//   };

//   const handleNext = async () => {
//     const currentStepData = form.getValues(
//       `step${currentStep}` as 'step1' | 'step2' | 'step3',
//     );
//     const stepSchema =
//       formSchema.shape[`step${currentStep}` as 'step1' | 'step2' | 'step3'];

//     try {
//       // Validate the data for the current step
//       await stepSchema.parseAsync(currentStepData);

//       // If valid, go to the next step
//       if (currentStep < 3) {
//         setCurrentStep((prev) => prev + 1);
//       }
//     } catch (error) {
//       // Trigger validation for each field on failure
//       Object.keys(currentStepData).forEach((field) => {
//         form.trigger(
//           `step${currentStep}.${field}` as keyof typeof formSchema.shape,
//         );
//       });
//     }
//   };

//   const onSubmit: (
//     values: z.infer<typeof formSchema>,
//   ) => Promise<void> = async (values) => {
//     console.log('clicked on create account');

//     if (!isVerified) {
//       toast({
//         variant: 'destructive',
//         title: 'Verification required',
//         description: 'Please verify your phone number first.',
//       });
//       return;
//     }

//     setIsLoading(true);

//     // Combine all form data

//     const formData = {
//       firstName: values?.step1?.firstName,
//       lastName: values?.step1?.lastName,
//       email: values?.step1?.email,
//       userName: values?.step1?.userName,
//       password: values?.step1?.password,
//       dob: values?.step1 ? new Date(values.step1?.dob).toISOString() : null,
//       perHourPrice: values?.step2?.perHourPrice,
//       workExperience: values?.step2?.workExperience,
//       githubLink: values?.step2?.githubLink || '',
//       linkedin: values?.step2?.linkedin || '',
//       personalWebsite: values?.step2?.personalWebsite || '',
//       phone: `${countries.find((c) => c.code === code)?.dialCode}${values?.step3?.phone}`,
//       role: 'freelancer',
//       resume: '',
//       connects: 0,
//       professionalInfo: {},
//       skills: [],
//       domain: [],
//       education: {},
//       projects: {},
//       isFreelancer: true,
//       refer: { name: 'string', contact: 'string' },
//       pendingProject: [],
//       rejectedProject: [],
//       acceptedProject: [],
//       oracleProject: [],
//       userDataForVerification: [],
//       interviewsAligned: [],
//       // oracleStatus: 'notApplied',
//     };
//     console.log(formData);
//     try {
//       await axiosInstance.post('/register/freelancer', formData);
//       toast({
//         title: 'Account created successfully!',
//         description: 'Redirecting to login page...',
//       });

//       setTimeout(() => {
//         router.push('/login');
//       }, 1500);
//     } catch (error: any) {
//       console.log(error);
//       toast({
//         variant: 'destructive',
//         title: 'Registration failed',
//         description: error.response?.data?.message || 'Something went wrong',
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const renderStep = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <div className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <TextInput
//                 control={form.control}
//                 name="step1.firstName"
//                 label="First Name"
//                 placeholder="Max"
//                 className="w-full"
//               />
//               <TextInput
//                 control={form.control}
//                 name="step1.lastName"
//                 label="Last Name"
//                 placeholder="Robinson"
//                 className="w-full"
//               />
//             </div>

//             <TextInput
//               control={form.control}
//               name="step1.email"
//               label="Email"
//               type="email"
//               placeholder="m@example.com"
//               className="w-full"
//             />

//             <TextInput
//               control={form.control}
//               name="step1.userName"
//               label="Username"
//               placeholder="your_username"
//               className="w-full"
//             />

//             <TextInput
//               control={form.control}
//               name="step1.dob"
//               label="Date of Birth"
//               type="date"
//               className="w-full"
//             />

//             <div className="space-y-6">
//               <FormField
//                 control={form.control}
//                 name="step1.password"
//                 render={({ field }) => (
//                   <FormItem>
//                     <Label>Password</Label>
//                     <FormControl>
//                       <div className="relative">
//                         <Input
//                           type={showPassword ? 'text' : 'password'}
//                           placeholder="Enter your password"
//                           {...field}
//                           className="w-full pr-10"
//                         />
//                         <button
//                           type="button"
//                           onClick={() => setShowPassword(!showPassword)}
//                           className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
//                         >
//                           {showPassword ? (
//                             <Eye className="h-5 w-5" />
//                           ) : (
//                             <EyeOff className="h-5 w-5" />
//                           )}
//                         </button>
//                       </div>
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="step1.confirmPassword"
//                 render={({ field }) => (
//                   <FormItem>
//                     <Label>Confirm Password</Label>
//                     <FormControl>
//                       <div className="relative">
//                         <Input
//                           type={showConfirmPassword ? 'text' : 'password'}
//                           placeholder="Confirm your password"
//                           {...field}
//                           className="w-full pr-10"
//                         />
//                         <button
//                           type="button"
//                           onClick={() =>
//                             setShowConfirmPassword(!showConfirmPassword)
//                           }
//                           className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
//                         >
//                           {showConfirmPassword ? (
//                             <Eye className="h-5 w-5" />
//                           ) : (
//                             <EyeOff className="h-5 w-5" />
//                           )}
//                         </button>
//                       </div>
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>
//           </div>
//         );

//       case 2:
//         return (
//           <div className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <TextInput
//                 control={form.control}
//                 name="step2.perHourPrice"
//                 label="Hourly Rate ($)"
//                 type="number"
//                 placeholder="0"
//                 className="w-full"
//               />
//               <TextInput
//                 control={form.control}
//                 name="step2.workExperience"
//                 label="Work Experience (Years)"
//                 type="number"
//                 placeholder="0"
//                 className="w-full"
//               />
//             </div>

//             <div className="border rounded-lg p-4 dark:border-muted">
//               <button
//                 type="button"
//                 onClick={() => setShowOptionalInfo(!showOptionalInfo)}
//                 className="flex items-center justify-between w-full text-left"
//               >
//                 <span className="font-medium">Optional Information</span>
//                 {showOptionalInfo ? (
//                   <ChevronUp className="h-5 w-5" />
//                 ) : (
//                   <ChevronDown className="h-5 w-5" />
//                 )}
//               </button>

//               {showOptionalInfo && (
//                 <div className="space-y-6 mt-6">
//                   <TextInput
//                     control={form.control}
//                     name="step2.githubLink"
//                     label="GitHub"
//                     type="url"
//                     placeholder="https://github.com/yourusername"
//                     className="w-full"
//                   />
//                   <TextInput
//                     control={form.control}
//                     name="step2.linkedin"
//                     label="LinkedIn"
//                     type="url"
//                     placeholder="https://linkedin.com/in/yourprofile"
//                     className="w-full"
//                   />
//                   <TextInput
//                     control={form.control}
//                     name="step2.personalWebsite"
//                     label="Personal Website"
//                     type="url"
//                     placeholder="https://www.yourwebsite.com"
//                     className="w-full"
//                   />
//                 </div>
//               )}
//             </div>
//           </div>
//         );

//       case 3:
//         return (
//           <div className="space-y-6">
//             <div>
//               <Label>Phone Number</Label>
//               <PhoneNumberForm
//                 control={form.control}
//                 setCode={setCode}
//                 code={code}
//               />
//             </div>
//             <Button
//               type="button"
//               onClick={handleVerification}
//               className="w-full"
//               disabled={isVerified}
//             >
//               {isVerified ? 'Phone Number Verified ✓' : 'Verify Phone Number'}
//             </Button>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <Form {...form}>
//       <form
//         onSubmit={form.handleSubmit(onSubmit)}
//         className="w-full max-w-2xl mx-auto p-6 space-y-8"
//       >
//         <div className="text-center space-y-2">
//           <h1 className="text-2xl font-bold">Create Your Freelancer Account</h1>
//           <p className="text-muted-foreground">
//             Join our community and start your freelancing journey
//           </p>
//         </div>

//         <SignupStepper currentStep={currentStep} />

//         <div className="bg-card dark:bg-card rounded-lg p-6 shadow-sm border dark:border-muted">
//           {renderStep()}
//         </div>

//         <div className="flex justify-between gap-4">
//           {currentStep > 1 && (
//             <Button
//               type="button"
//               variant="outline"
//               onClick={handlePrevious}
//               className="min-w-[100px]"
//             >
//               Previous
//             </Button>
//           )}

//           <Button
//             type="submit"
//             onClick={(event) => {
//               event.preventDefault();
//               if (currentStep === 3) {
//                 onSubmit(form.getValues()); // Ensure formValues is defined and accessible
//               } else {
//                 handleNext();
//               }
//             }}
//             className={`min-w-[100px] ${currentStep === 1 ? 'w-full' : 'ml-auto'}`}
//             disabled={isLoading || (currentStep === 3 && !isVerified)}
//           >
//             {isLoading ? (
//               <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
//             ) : currentStep === 3 ? (
//               <>
//                 <Rocket className="mr-2 h-4 w-4" />
//                 Create Account
//               </>
//             ) : (
//               'Next'
//             )}
//           </Button>
//         </div>

//         <OtpLogin
//           phoneNumber={phone}
//           isModalOpen={isModalOpen}
//           setIsModalOpen={setIsModalOpen}
//         />
//       </form>
//     </Form>
//   );
// };

// export default FreelancerRegisterForm;
