export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export type InvitationStatusFilter = 'ALL' | InvitationStatus;

export type InvitationSortField =
  | 'createdAt'
  | 'projectName'
  | 'freelancerName';

export type SortDirection = 'asc' | 'desc';

export interface ProjectInvitation {
  _id: string;
  projectId: string;
  projectName: string;
  projectStatus?: string;
  profileId?: string;
  profileDomain?: string;
  profileDescription?: string;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail?: string;
  freelancerProfilePic?: string;
  status: InvitationStatus;
  invitedAt: string | Date;
  respondedAt?: string | Date;
  hireId?: string;
  freelancerEntryId?: string;
}
