import { ProjectInvitation, InvitationStatus } from '@/types/invitation';

/** Map hire freelancer status to InvitationStatus */
export const mapFreelancerStatus = (s: string): InvitationStatus => {
  if (!s) return InvitationStatus.PENDING;
  const up = s.toUpperCase();
  if (up === 'INVITED') return InvitationStatus.PENDING;
  if (up === 'SELECTED' || up === 'ACCEPTED') return InvitationStatus.ACCEPTED;
  if (up === 'REJECTED') return InvitationStatus.REJECTED;
  return InvitationStatus.PENDING;
};

/**
 * Join hires and projects to produce a flat list of invitations.
 * hires: array returned from GET /business/hire-dehixtalent
 * projects: array returned from GET /project/business
 * freelancersMap: optional map of freelancerId -> { name, email, avatar }
 */
const processInvitations = (
  hires: any[] = [],
  projects: any[] = [],
  freelancersMap: Record<string, any> = {},
): ProjectInvitation[] => {
  const invitations: ProjectInvitation[] = [];

  // Build a lookup map keyed by profile.domain_id and profile.domainId for O(1) matching
  const profileLookup = new Map<string, { project: any; profile: any }>();
  for (const proj of projects || []) {
    const profiles = proj.profiles || [];
    for (const pr of profiles) {
      if (pr.domain_id)
        profileLookup.set(pr.domain_id, { project: proj, profile: pr });
      if (pr.domainId)
        profileLookup.set(pr.domainId, { project: proj, profile: pr });
    }
  }

  for (const hire of hires || []) {
    const talentId = hire.talentId || hire.talent_id || hire.talent || '';
    const found = profileLookup.get(talentId);
    if (!found) continue;
    const { project, profile } = found;

    // Only include actual invitation statuses for sent invitations
    const freelancers = (hire.freelancers || []).filter((f: any) => {
      const s = (f.status || '').toUpperCase();
      return s === 'INVITED' || s === 'SELECTED' || s === 'REJECTED';
    });

    for (const fr of freelancers) {
      const status = mapFreelancerStatus(fr.status || 'INVITED');
      const freelancerId =
        fr.freelancerId || fr.freelancer_id || fr.freelancer || '';
      const freelancerInfo = freelancersMap[freelancerId] || {};

      invitations.push({
        _id: `${hire._id}_${fr._id || freelancerId}`,
        projectId: project._id,
        projectName: project.projectName || project.name || 'Untitled Project',
        projectStatus: project.status,
        profileId: profile._id,
        profileDomain: profile.domain || profile.domainName || 'Profile',
        profileDescription: profile.description || '',
        freelancerId: freelancerId,
        freelancerName:
          freelancerInfo.name || fr.name || fr.freelancerName || 'Unknown',
        freelancerEmail: freelancerInfo.email || fr.email,
        freelancerProfilePic: freelancerInfo.avatar || fr.avatar,
        status,
        invitedAt:
          fr.updatedAt ||
          fr.createdAt ||
          hire.updatedAt ||
          new Date().toISOString(),
        respondedAt: fr.respondedAt,
        hireId: hire._id,
        freelancerEntryId: fr._id || '',
      });
    }
  }

  return invitations;
};

export default processInvitations;
