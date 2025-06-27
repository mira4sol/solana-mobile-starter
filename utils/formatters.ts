/**
 * Format a number as USD currency string
 * @param value Number to format as USD
 * @returns Formatted string with $ prefix
 */
export function formatUSD(value: number): string {
  if (!value && value !== 0) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Format a number with appropriate decimals based on its value
 * @param value Number to format
 * @param maxDecimals Maximum number of decimal places to show
 * @returns Formatted string
 */
export function formatNumber(value: number, maxDecimals: number = 6): string {
  if (!value && value !== 0) return '0';
  
  // For very small numbers, show more decimals
  const absValue = Math.abs(value);
  let decimals = maxDecimals;
  
  if (absValue < 0.0001) {
    decimals = 8;
  } else if (absValue < 0.01) {
    decimals = 6;
  } else if (absValue < 1) {
    decimals = 4;
  } else {
    decimals = 2;
  }
  
  return value.toLocaleString('en-US', {
    maximumFractionDigits: decimals
  });
}

/**
 * Abbreviate large numbers with K, M, B, T suffixes
 * @param value Number to abbreviate
 * @returns Abbreviated string
 */
export function abbreviateNumber(value: number): string {
  if (!value && value !== 0) return '0';
  
  if (Math.abs(value) < 1000) return value.toFixed(2);
  
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const suffixIndex = Math.floor(Math.log10(Math.abs(value)) / 3);
  const shortValue = value / Math.pow(10, suffixIndex * 3);
  
  return shortValue.toFixed(2) + suffixes[suffixIndex];
}

/**
 * Format a wallet address to show only beginning and end
 * @param address Full wallet address
 * @param startChars Number of characters to show from start
 * @param endChars Number of characters to show from end
 * @returns Formatted address string
 */
export function formatAddress(address: string, startChars: number = 4, endChars: number = 4): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}
