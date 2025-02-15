export enum MilestoneStatus {
  NOT_STARTED = 'NOT_STARTED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

// export interface IStories {
//   _id: string;
//   summary: string;
//   importantUrl: string[];
//   title: string;
//   taskStatus: MilestoneStatus;
// }

// export interface IPayment {
//   amount: number | undefined;
//   status: PaymentStatus;
// }

// export interface MilestoneFormData {
//   title: string;
//   description: string;
//   startDate: {
//     expected: string;
//     actual?: string;
//   };
//   endDate: {
//     expected: string;
//     actual?: string;
//   };
//   amount: number | undefined;
//   status: MilestoneStatus;
// }

export interface Milestone {
  _id?: string; // Optional for creation
  date?: string; // Optional for creation
  title: string;
  description: string;
  status: string;
  stories?: Story[]; // Optional for creation
  createdAt?: string; // Optional for creation
  startDate: {
    expected: string;
    actual?: string;
  };
  endDate: {
    expected: string;
    actual?: string;
  };
  amount: number | undefined;
}

export interface Story {
  _id?: string;
  title: string;
  summary: string;
  storyStatus: string;
  tasks: Task[];
  importantUrls: { urlName: string; url: string }[];
}

export interface Task {
  _id: string;
  title: string;
  summary: string;
  taskStatus: string;
  freelancers?: any;
}

export interface importantUrl {
  urlName: string;
  url: string;
}
