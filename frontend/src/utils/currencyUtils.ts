// Centralized utility for currency conversion and formatting

// USD to INR conversion rate (can be updated from an API in a production app)
export const USD_TO_INR_RATE = 83;

/**
 * Convert USD to INR
 * @param usdAmount - The amount in USD
 * @returns The equivalent amount in INR
 */
export const convertUSDtoINR = (usdAmount: number): number => {
  return usdAmount * USD_TO_INR_RATE;
};

/**
 * Format a number as INR currency
 * @param amount - The amount to format
 * @returns Formatted currency string with ₹ symbol
 */
export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format a number as USD currency
 * @param amount - The amount to format
 * @returns Formatted currency string with $ symbol
 */
export const formatUSD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(amount);
};
