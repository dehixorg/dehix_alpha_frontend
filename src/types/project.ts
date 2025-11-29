import { StatusEnum } from '@/utils/freelancer/enum'; // ✅ Import instead of redefining

export interface Project {
  _id: string;
  projectName: string;
  description: string;
  email: string;
  verified?: boolean;
  isVerified?: string;
  companyName: string;
  companyId: string;
  projectDomain: string;
  start?: Date;
  end?: Date;
  skillsRequired: string[];
  experience?: string;
  role: string;
  projectType: string;
  totalNeedOfFreelancer?: {
    category?: string;
    needOfFreelancer?: number;
    appliedCandidates?: string[];
    rejected?: string[];
    accepted?: string[];
    status?: string;
  }[];
  status?: StatusEnum; // ✅ Now it uses the imported enum
  team?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  _id: string;
  domain: string;
  description: string;
  profileType: string;
  freelancersRequired?: number;
  required?: number;
}

export interface ProjectWithProfiles {
  _id: string;
  projectName: string;
  companyName: string;
  status: string;
  profiles?: Profile[];
}
