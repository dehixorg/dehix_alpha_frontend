import { Api_Methods } from '../utils/common/enum';

import { apiService } from './apiService';

export const projectInvitationService = {
  getInvitations: async (isFreelancer: boolean) => {
    return apiService({
      method: Api_Methods.GET,
      endpoint: isFreelancer ? '/freelancer/invite' : '/business/invite',
    });
  },

  deleteInvitation: async (inviteId: string) => {
    return apiService({
      method: Api_Methods.DELETE,
      endpoint: `/business/invite/${inviteId}`,
    });
  },

  respondInvitation: async (
    inviteId: string,
    status: 'ACCEPTED' | 'REJECTED',
  ) => {
    return apiService({
      method: Api_Methods.PATCH,
      endpoint: `/freelancer/invite/${inviteId}/respond`,
      body: { status },
    });
  },
};
