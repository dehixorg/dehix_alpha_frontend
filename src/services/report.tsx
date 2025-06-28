import { Api_Methods } from "../utils/common/enum"; // Importing Api_Methods
import { apiService } from "./apiService";

export const apiHelperService = {

getAllReports: async (params = {}) => {
  return apiService({
    method: Api_Methods.GET,
    endpoint: "/reports", 
    params,              
  });


  },
  updateReportStatus: async (Id: string, status: string) => {
    return apiService({
      method: Api_Methods.PUT,
      endpoint: `/report/${Id}`,
      body: {
        status,
      },
    });
  },

  // add report
  createReport: async (data: any) => {
    return apiService({
      method: Api_Methods.POST,
      endpoint: "/reports",
      body: data,
    });
  },
  sendMessageToReport: async (reportId: string, data: { sender: string; text: string }) => {
    return apiService({
      method: Api_Methods.POST,
      endpoint: `/reports/${reportId}/messages`, // adjust if your backend endpoint differs
      body: data,
    });
  },
  getSingleReport: async (id: string) => {
    return apiService({
      method: Api_Methods.GET,
      endpoint: `/reports/${id}`,
    });
  },

  getReportsByUser: async (userId: string, params = {}) => {
  return apiService({
    method: Api_Methods.GET,
    endpoint: `/reports/user/${userId}`, // ✅ Correct path param
    params, // page, limit etc. can stay as query params
  });
},



};
