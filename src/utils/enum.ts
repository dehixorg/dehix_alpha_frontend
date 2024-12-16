// created by Tushar Rajput
// date: 24/9/2024

export const Dehix_Talent_Card_Pagination = {
  BATCH: 3,
};

// Enum for Notification Type
export enum UserNotificationTypeEnum {
  PROJECT_HIRING = 'Project_Hiring',
  SKILL_INTERVIEW = 'Skill_Interview',
  DOMAIN_INTERVIEW = 'Domain_Interview',
  TALENT_INTERVIEW = 'Talent_Interview',
}

export interface UserNotification {
  id: string;
  message: string;
  type: UserNotificationTypeEnum;
  entity: string;
  path: string;
  userId: string;
}

export enum HireDehixTalentStatusEnum {
  ADDED = 'Added',
  APPROVED = 'Approved',
  CLOSED = 'Closed',
  COMPLETED = 'Completed',
}

export enum BusinessStatusEnum {
  ACTIVE = 'Active',
  IN_ACTIVE = 'Inactive',
  NOT_VERIFIED = 'Not Verified',
}

export enum NotificationTypeEnum {
  BUSINESS = 'Business',
  FREELANCER = 'Freelancer',
  BOTH = 'Both',
}
export enum NotificationStatusEnum {
  ACTIVE = 'Active',
  IN_ACTIVE = 'Inactive',
}

// Enum for Oracle Status
export enum OracleStatusEnum {
  NOT_APPLICABLE = 'Not Applicaple',
  APPLICABLE = 'Applicable',
  STOPPED = 'Stopped',
}

// Enum for Bid Status
export enum BidstatusEnum {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
  PANEL = 'Panel',
  INTERVIEW = 'Interview',
}

export enum DomainStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  ARCHIVED = 'Archieved',
}

export enum FreelancerStatusEnum {
  ACTIVE = 'Active',
  PENDING = 'Pending',
  INACTIVE = 'Inactive',
  CLOSED = 'Closed',
}

export enum Type {
  FREELANCER = 'Freelancer',
  ADMIN = 'Admin',
  BUSINESS = 'Business',
}

export enum TicketStatus {
  CREATED = 'Created',
  CLOSED = 'Closed',
  ACTIVE = 'Active',
}
