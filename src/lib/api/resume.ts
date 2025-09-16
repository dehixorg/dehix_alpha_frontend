import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/resume',
});

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city?: string;
  country?: string;
  linkedin?: string;
  github?: string;
}

export interface WorkExperience {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface Education {
  degree: string;
  school: string;
  startDate: string;
  endDate?: string;
  grade?: string;
}

export interface Project {
  title: string;
  description: string;
}

export interface Achievement {
  achievementDescription: string;
}

export interface Resume {
  _id: string;
  userId: string;
  personalInfo?: PersonalInfo;
  workExperience?: WorkExperience[];
  education?: Education[];
  projects?: Project[];
  skills?: string[];
  achievements?: Achievement[];
  professionalSummary?: string;
  selectedTemplate?: string;
  selectedColor?: string;
  status?: 'active' | 'inactive';
}

export const getResumes = async (userId: string): Promise<Resume[]> => {
  const res = await API.get('/get', { params: { userId } });
  return res.data.resumes;
};

export const updateResume = async (resumeId: string, data: Partial<Resume>) => {
  const res = await API.put(`/update/${resumeId}`, data);
  return res.data.resume;
};

export const createResume = async (data: Partial<Resume>) => {
  const res = await API.post('/create', data);
  return res.data.resume;
};

export const deleteResume = async (resumeId: string) => {
  await API.delete(`/delete/${resumeId}`);
};
