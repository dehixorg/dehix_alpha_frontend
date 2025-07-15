export interface Skill {
  _id?: string;
  name: string;
  level?: string;
  experience?: string;
}

export interface Domain {
  _id?: string;
  name: string;
  level?: string;
}

export interface Project {
  _id?: string;
  projectName: string;
  description: string;
  role: string;
  start: string;
  end: string;
  techUsed: string[];
  githubLink?: string;
  liveDemoLink?: string;
  projectType?: string;
  verified?: boolean;
  referencePersonName?: string;
  referencePersonContact?: string;
  githubRepoLink?: string;
}

export interface ProfessionalExperience {
  _id?: string;
  company: string;
  jobTitle: string;
  workDescription: string;
  workFrom: string;
  workTo: string;
  referencePersonName?: string;
  referencePersonContact?: string;
  githubRepoLink?: string;
}

export interface Education {
  _id?: string;
  degree: string;
  universityName: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  grade: string;
}

export interface FreelancerProfile {
  _id?: string;
  profileName: string;
  description?: string;
  skills?: Skill[];
  domains?: Domain[];
  projects?: {
    _id: string;
    projectName: string;
    description: string;
    role: string;
    start: string;
    end: string;
    techUsed: string[];
    githubLink?: string;
    projectType?: string;
    verified?: boolean;
  }[];
  experiences?: {
    _id: string;
    company: string;
    jobTitle: string;
    workDescription: string;
    workFrom: string;
    workTo: string;
    referencePersonName?: string;
    referencePersonContact?: string;
    githubRepoLink?: string;
  }[];
  education?: Education[];
  portfolioLinks?: string[];
  githubLink?: string;
  linkedinLink?: string;
  personalWebsite?: string;
  hourlyRate?: number;
  availability?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
