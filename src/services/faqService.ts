import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface FAQ {
  id?: string;
  question: string;
  answer: string;
  type: 'BUSINESS' | 'FREELANCER';
  status: 'ACTIVE' | 'INACTIVE';
  importantUrl: Array<{
    urlName: string;
    url: string;
  }>;
  views?: number;
  helpfulVotes?: number;
  lastUpdated?: string;
  badges?: string[];
}

export const faqService = {
  // Fetch all FAQs
  async getFAQs(): Promise<FAQ[]> {
    const response = await axios.get(`${API_BASE_URL}/faqs`);
    return response.data;
  },

  // Fetch single FAQ by ID
  async getFAQById(id: string): Promise<FAQ> {
    const response = await axios.get(`${API_BASE_URL}/faqs/${id}`);
    return response.data;
  },

  // Create new FAQ
  async createFAQ(data: Omit<FAQ, 'id'>): Promise<FAQ> {
    const response = await axios.post(`${API_BASE_URL}/faqs`, data);
    return response.data;
  },

  // Update FAQ
  async updateFAQ(id: string, data: Partial<FAQ>): Promise<FAQ> {
    const response = await axios.patch(`${API_BASE_URL}/faqs/${id}`, data);
    return response.data;
  },

  // Delete FAQ
  async deleteFAQ(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/faqs/${id}`);
  },

  // Update FAQ badges
  async updateFAQBabges(id: string, badges: string[]): Promise<FAQ> {
    const response = await axios.patch(`${API_BASE_URL}/faqs/${id}/badges`, {
      badges,
    });
    return response.data;
  },

  // Mark FAQ as helpful
  async markAsHelpful(id: string): Promise<{ success: boolean }> {
    const response = await axios.post(`${API_BASE_URL}/faqs/${id}/helpful`);
    return response.data;
  },
};
