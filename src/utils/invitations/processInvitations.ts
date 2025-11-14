import { ProjectInvitation, InvitationStatus } from '@/types/invitation';

/** Map hire freelancer status to InvitationStatus */
export const mapFreelancerStatus = (s: string): InvitationStatus => {
  if (!s) return InvitationStatus.PENDING;
  const up = s.toUpperCase();
  if (up === 'INVITED') return InvitationStatus.PENDING;
  if (up === 'SELECTED' || up === 'ACCEPTED') return InvitationStatus.ACCEPTED;
  if (up === 'REJECTED') return InvitationStatus.REJECTED;
  if (up === 'APPLIED') return InvitationStatus.PENDING;
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

  // Build project lookup map keyed by project._id
  const projectLookup = new Map<string, any>();
  for (const proj of projects || []) {
    if (proj._id) {
      projectLookup.set(proj._id, proj);
    }
  }

  // Build profile lookup map keyed by profile._id
  const profileLookup = new Map<string, { project: any; profile: any }>();
  for (const proj of projects || []) {
    const profiles = proj.profiles || [];
    for (const pr of profiles) {
      if (pr._id) {
        profileLookup.set(pr._id, { project: proj, profile: pr });
      }
      // Also index by domain_id/domainId for legacy support
      if (pr.domain_id)
        profileLookup.set(pr.domain_id, { project: proj, profile: pr });
      if (pr.domainId)
        profileLookup.set(pr.domainId, { project: proj, profile: pr });
    }
  }

  for (const hire of hires || []) {
    let project: any = null;
    let profile: any = null;

    // Primary matching strategy: use projectId and profileId from hire
    if (hire.projectId && hire.profileId) {
      project = projectLookup.get(hire.projectId);
      const profileMatch = profileLookup.get(hire.profileId);
      if (profileMatch) {
        profile = profileMatch.profile;
        // Ensure project consistency
        if (!project) {
          project = profileMatch.project;
        }
      }
    }

    // Fallback matching strategy: use legacy talentId
    if (!project || !profile) {
      const talentId = hire.talentId || hire.talent_id || hire.talent || '';
      if (talentId) {
        const found = profileLookup.get(talentId);
        if (found) {
          project = found.project;
          profile = found.profile;
        }
      }
    }

    // Skip if no match found
    if (!project || !profile) continue;

    // Extract freelancers from the canonical freelancers array
    const freelancers = (hire.freelancers || []).filter((f: any) => {
      const s = (f.status || '').toUpperCase();
      return (
        s === 'INVITED' ||
        s === 'SELECTED' ||
        s === 'REJECTED' ||
        s === 'APPLIED'
      );
    });

    for (const entry of freelancers) {
      const freelancerId =
        entry.freelancerId || entry.freelancer_id || entry.freelancer || '';
      const freelancerInfo = freelancersMap[freelancerId] || {};

      const status = mapFreelancerStatus(entry.status || 'INVITED');

      invitations.push({
        _id: `${hire._id}_${entry._id || freelancerId}`,
        projectId: project._id,
        projectName: project.projectName || project.name || 'Untitled Project',
        projectStatus: project.status,
        profileId: profile._id,
        profileDomain: profile.domain || profile.domainName || 'Profile',
        profileDescription: profile.description || '',
        freelancerId: freelancerId,
        freelancerName:
          freelancerInfo.userName ||
          freelancerInfo.name ||
          entry.name ||
          entry.freelancerName ||
          'Unknown',
        freelancerEmail: freelancerInfo.email || entry.email || '',
        freelancerProfilePic:
          freelancerInfo.profilePic ||
          freelancerInfo.avatar ||
          entry.avatar ||
          '',
        status,
        invitedAt:
          entry.updatedAt || hire.updatedAt || new Date().toISOString(),
        respondedAt: entry.respondedAt,
        hireId: hire._id,
        freelancerEntryId: entry._id || '',
      });
    }
  }

  return invitations;
};

export default processInvitations;
