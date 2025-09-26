export const formatCurrency = (
  value: string | number,
  currency: string = 'USD',
  maximumFractionDigits: number = 0,
): string => {
  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num))
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits,
    }).format(0);
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits,
  }).format(num as number);
};
