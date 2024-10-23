// USE these example api as refrence for creating different resource api helper service
// eslint-disable-next-line prettier/prettier

import { Api_Methods } from "@/utils/common/enum"; // Importing Api_Methods

import { apiService } from "./apiService";

export const apiHelperService = {
  getAllFreelancers: async (params = {}) => {
    return apiService({
      method: Api_Methods.GET,
      endpoint: "/freelancer/allfreelancer",
      params,
    });
  },
  getAllAdmin: async (params = {}) => {
    return apiService({
      method: Api_Methods.GET,
      endpoint: "/admin/all",
      params,
    });
  },
  getAllProject: async (params = {}) => {
    return apiService({
      method: Api_Methods.GET,
      endpoint: "/business/all_projects",
      params,
    });
  },
  getAllFaq: async (params = {}) => {
    return apiService({
      method: Api_Methods.GET,
      endpoint: "/faq/all",
      params,
    });
  },
  getAllNotification: async (params = {}) => {
    return apiService({
      method: Api_Methods.GET,
      endpoint: "/notification/all_notification",
      params,
    });
  },
  getAllDomain: async (params = {}) => {
    return apiService({
      method: Api_Methods.GET,
      endpoint: "/domain/all",
      params,
    });
  },
  getAllBusiness: async (params = {}) => {
    return apiService({
      method: Api_Methods.GET,
      endpoint: "/business/all",
      params,
    });
  },
  getAllBid: async (params = {}) => {
    return apiService({
      method: Api_Methods.GET,
      endpoint: "/bid/all",
      params,
    });
  },
  getDomainList: async (params = {}) => {
    return apiService({
      method: Api_Methods.GET,
      endpoint: "/domain/all",
      params,
    });
  },
  getAllBusinessProject: async (itemId: string) => {
    return apiService({
      method: Api_Methods.GET,
      endpoint: `/business/${itemId}/project`,
    });
  },
  getAllBusinessPersonalInfo: async (itemId: string) => {
    return apiService({
      method: Api_Methods.GET,
      endpoint: `/business/${itemId}`,
    });
  },
  getAllFreelancerPersonalInfo: async (itemId: string) => {
    return apiService({
      method: Api_Methods.GET,
      endpoint: `/freelancer/${itemId}`,
    });
  },

  createFaq: async (body: Record<string, any>) => {
    return apiService({
      method: Api_Methods.POST,
      endpoint: "/faq/createfaq",
      body,
    });
  },
  createAdmin: async (body: Record<string, any>) => {
    return apiService({
      method: Api_Methods.POST,
      endpoint: "/admin/create",
      body,
    });
  },
  createDomain: async (body: Record<string, any>) => {
    return apiService({
      method: Api_Methods.POST,
      endpoint: "/domain/createdomain",
      body,
    });
  },

  updateItem: async (itemId: string, body: Record<string, any>) => {
    return apiService({
      method: Api_Methods.PUT,
      endpoint: `/items/${itemId}`,
      body,
    });
  },

  deleteAdmin: async (itemId: string) => {
    return apiService({
      method: Api_Methods.DELETE,
      endpoint: `/admin/${itemId}`,
    });
  },
  deleteFaq: async (itemId: string) => {
    return apiService({
      method: Api_Methods.DELETE,
      endpoint: `/faq/${itemId}`,
    });
  },
  deleteDomain: async (itemId: string) => {
    return apiService({
      method: Api_Methods.DELETE,
      endpoint: `/domain/${itemId}`,
    });
  },
  deleteNotification: async (itemId: string) => {
    return apiService({
      method: Api_Methods.DELETE,
      endpoint: `/notification/${itemId}`,
    });
  },

  patchItem: async (itemId: string, body: Record<string, any>) => {
    return apiService({
      method: Api_Methods.PATCH,
      endpoint: `/items/${itemId}`,
      body,
    });
  },

  getCategories: async (params = {}) => {
    return apiService({
      method: Api_Methods.GET,
      endpoint: "/categories",
      params,
    });
  },
};
