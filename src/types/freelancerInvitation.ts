export enum FreelancerInvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export interface FreelancerInvitation {
  hireId: string;
  projectId: string;
  projectName: string;
  companyName: string;
  projectStatus: string;
  profileId: string;
  profileDomain: string;
  profileDescription?: string;
  status: FreelancerInvitationStatus;
  invitedAt: string | Date;
  freelancerEntryId: string;
}

export interface FreelancerInvitationsResponse {
  pending: FreelancerInvitation[];
  accepted: FreelancerInvitation[];
  rejected: FreelancerInvitation[];
}
