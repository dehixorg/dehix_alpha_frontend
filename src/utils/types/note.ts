// Define an enum for note entity types
export enum EntityType {
  BUSINESS = 'BUSINESS',
  FREELANCER = 'FREELANCER',
  TRANSACTION = 'TRANSACTION',
  PROJECT = 'PROJECT',
  BID = 'BID',
  INTERVIEW = 'INTERVIEW',
  DEHIX_TALENT = 'DEHIX_TALENT',
}

// Define an enum for label types (labels)
export enum LabelType {
  PERSONAL = 'PERSONAL',
  WORK = 'WORK',
  REMINDER = 'REMINDER',
  TASK = 'TASK',
}
// Define an enum for note types
export enum NoteType {
  NOTE = 'NOTE',
  TRASH = 'TRASH',
  ARCHIVE = 'ARCHIVE',
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
  noteType: NoteType;
  createdAt?: Date;
};

export const badgeColors: { [key: string]: string } = {
  PERSONAL: 'bg-blue-500 text-white hover:text-black',
  WORK: 'bg-green-500 text-white hover:text-black',
  REMINDER: 'bg-yellow-500 text-black hover:text-black',
  TASK: 'bg-red-500 text-white hover:text-black',
};
