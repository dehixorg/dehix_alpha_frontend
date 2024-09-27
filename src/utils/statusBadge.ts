export const getStatusBadge = (status: string | undefined) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return { text: 'ACTIVE', className: 'bg-blue-500 hover:bg-blue-600' };
    case 'pending':
      return { text: 'PENDING', className: 'bg-warning hover:bg-warning' };
    case 'completed':
      return { text: 'COMPLETED', className: 'bg-success hover:bg-success' };
    case 'rejected':
      return { text: 'REJECTED', className: 'bg-red-500 hover:bg-red-600' };
    default:
      return { text: 'UNKNOWN', className: 'bg-gray-500 hover:bg-gray-600' };
  }
};
