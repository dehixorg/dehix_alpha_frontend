// Define an enum for entity types
export enum EntityType {
  BUSINESS = 'business',
  FREELANCER = 'freelancer',
  TRANSACTION = 'transaction',
  PROJECT = 'project',
  BID = 'bid',
  INTERVIEW = 'interview',
  DEHIX_TALENT = 'dehix_talent',
}

// Define an enum for note types (labels)
export enum LabelType {
  PERSONAL = 'personal',
  WORK = 'work',
  REMINDER = 'reminder',
  TASK = 'task',
}

// Updated Note type
export type Note = {
  _id: string;
  title: string;
  content: string;
  bgColor?: string; // Optional color for note display
  banner?: string; // Optional banner image for the note
  isHTML: boolean; // Indicates if the content is HTML
  entityID?: string; // Used for fetching related notes
  entityType?: EntityType; // Type of the entity associated with the note
  type?: LabelType; // Label or type of the note
  noteType?: string;
  createdAt?: Date;
};

export const badgeColors: { [key: string]: string } = {
  personal: 'bg-blue-500 text-white hover:text-black',
  work: 'bg-green-500 text-white hover:text-black',
  reminder: 'bg-yellow-500 text-black',
  task: 'bg-red-500 text-white hover:text-black',
};
