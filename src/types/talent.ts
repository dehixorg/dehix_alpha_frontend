export interface FreelancerApplication {
  _id: string;
  freelancerId: string;
  freelancerProfessionalProfileId: string;
  status: 'INVITED' | 'SELECTED' | 'REJECTED' | 'APPLIED';
  cover_letter?: string;
  interviewIds?: string[];
  updatedAt: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePic?: string;
  domainName?: string;
  role?: string;
  professionalInfo?: {
    workFrom: string;
    workTo: string;
    jobTitle?: string;
  }[];
  skills?: {
    _id: string;
    name: string;
  }[];
  location?: string;
  phone?: string;
  githubLink?: string;
  kyc?: unknown;
}
