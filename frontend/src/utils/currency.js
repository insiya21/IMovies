/**
 * Centralized Currency Formatting Utility for IMovies
 * Formats all financial amounts consistently in Indian Rupees (₹ INR)
 * using the standard Indian numbering system (e.g. ₹250.00, ₹1,250.00).
 */

/**
 * Format a number or string amount in Indian Rupees (₹ INR)
 * @param {number|string} amount - The amount to format
 * @param {boolean} includeDecimals - Whether to enforce 2 decimal places (default: true)
 * @returns {string} Formatted INR currency string (e.g., "₹250.00", "₹1,250.00")
 */
export const formatINR = (amount, includeDecimals = true) => {
  const num = Number(amount);
  if (isNaN(num)) return includeDecimals ? '₹0.00' : '₹0';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(num);
};

export const formatCurrency = formatINR;

export default formatINR;
