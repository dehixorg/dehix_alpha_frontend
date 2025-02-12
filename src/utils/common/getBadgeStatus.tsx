export const getBadgeColor = (status: string) => {
  const normalizedStatus = status?.toLowerCase();

  switch (normalizedStatus) {
    case 'active':
    case 'verified':
    case 'added':
      return 'bg-green-500 text-white';
    case 'pending':
      return 'bg-yellow-500 text-black';
    default:
      return 'bg-gray-500 text-white';
  }
};
