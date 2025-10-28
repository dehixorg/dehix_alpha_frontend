export enum InterviewLevel {
  Mastery = 'Mastery',
  Proficient = 'Proficient',
  Beginner = 'Beginner',
}

export enum ProjectStatus {
  ACTIVE = 'Active',
  PENDING = 'Pending',
  REJECTED = 'Rejected',
  COMPLETED = 'Completed',
}

export enum StatusEnum {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

export enum InterviewPermission {
  NOT_VERIFIED = 'NOT_VERIFIED',
  VERIFIED = 'VERIFIED',
}

export const kycBadgeColors: { [key: string]: string } = {
  APPLIED: 'bg-blue-500 text-white hover:text-black',
  PENDING: 'bg-green-500 text-white hover:text-black',
  VERIFIED: 'bg-yellow-500 text-black hover:text-black',
  REUPLOAD: 'bg-red-500 text-white hover:text-black',
  STOPPED: 'bg-red-500 text-white hover:text-black',
};
