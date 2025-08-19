export const getBadgeColor = (status: string) => {
  const normalizedStatus = status?.toLowerCase();

  switch (normalizedStatus) {
    case 'active':
    case 'verified':
    case 'added':
      return 'bg-green-500 text-white';
    case 'pending':
      return 'bg-yellow-500 text-black';
    case 'approved':
      return 'bg-green-500 text-black';
    case 'rejected':
      return 'bg-red-500 text-black';
    case 'mastery':
      return 'bg-purple-600 text-white';
    case 'proficient':
      return 'bg-blue-500 text-white';
    case 'beginner':
      return 'bg-green-400 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};
