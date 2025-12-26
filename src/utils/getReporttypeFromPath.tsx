export const getReportTypeFromPath = (path: string): string => {
  // Freelancer paths
  if (path.includes('/freelancer/interview/schedule'))
    return 'Freelancer Schedule Interview';
  if (path.includes('/freelancer/interview')) return 'Freelancer Interview';
  if (path.includes('/freelancer/market')) return 'Freelancer Marketplace';
  if (path.includes('/freelancer/project')) return 'Freelancer Project';
  if (path.includes('/freelancer/settings')) return 'Freelancer Settings';
  if (path.includes('/freelancer/talent')) return 'Freelancer Talent';
  if (path.includes('/freelancer/businessProfile'))
    return 'Freelancer Business Profile';
  if (path.includes('/freelancer/oracleDashboard/businessVerification'))
    return 'Freelancer Oracle Business Verification';
  if (path.includes('/freelancer/oracleDashboard/educationVerification'))
    return 'Freelancer Oracle Education Verification';
  if (path.includes('/freelancer/oracleDashboard/projectVerification'))
    return 'Freelancer Oracle Project Verification';
  if (path.includes('/freelancer/oracleDashboard/workExpVerification'))
    return 'Freelancer Oracle Work Experience Verification';
  if (path.includes('/freelancer/oracleDashboard'))
    return 'Freelancer Oracle Dashboard';
  if (path.includes('/freelancer/')) return 'Freelancer profile'; // fallback for /freelancer/[freelancer_id]
  if (path.includes('/chat')) return 'Chat'; // fallback for /freelancer/[freelancer_id]

  // Business paths
  if (path.includes('/dashboard/business')) return 'Business profile';
  if (path.includes('/business/market')) return 'Business Marketplace';

  return 'General';
};
