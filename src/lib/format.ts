export const formatPrice = (cents: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format((cents || 0) / 100);
};

export const PROJECT_ID = '6a266a1da78e16ead3558256';
