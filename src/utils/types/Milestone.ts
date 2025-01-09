export enum MilestoneStatus {
  NOT_STARTED = 'NOT_STARTED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

export interface IStories {
  _id: string;
  summary: string;
  importantUrl: string[];
  title: string;
  taskStatus: MilestoneStatus;
}

export interface IPayment {
  amount: number | undefined;
  status: PaymentStatus;
}

export interface MilestoneFormData {
  title: string;
  description: string;
  startDate: {
    expected: string;
    actual?: string;
  };
  endDate: {
    expected: string;
    actual?: string;
  };
  amount: number | undefined;
  status: MilestoneStatus;
  stories: IStories[];
  payment: IPayment;
}
