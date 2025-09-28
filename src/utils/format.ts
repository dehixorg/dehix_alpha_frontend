export const formatCurrency = (
  value: string | number,
  currency: string = 'USD',
  maximumFractionDigits: number = 2,
  minimumFractionDigits: number = 2,
): string => {
  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num))
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits,
      minimumFractionDigits,
    }).format(0);
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits,
    minimumFractionDigits,
  }).format(num as number);
};
