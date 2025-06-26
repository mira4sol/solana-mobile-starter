// export const formatBalance = (balance: number, symbol?: string) => {
// export const formatBalance = (balance: number) => {
//   if (balance >= 1000000000) {
//     return `${(balance / 1000000000).toFixed(2)}B`
//     // return `${(balance / 1000000000).toFixed(2)}B ${symbol || ''}`
//   } else if (balance >= 1000000) {
//     return `${(balance / 1000000).toFixed(2)}M`
//     // return `${(balance / 1000000).toFixed(2)}M ${symbol || ''}`
//   } else if (balance >= 1000) {
//     return `${(balance / 1000).toFixed(2)}K`
//     // return `${(balance / 1000).toFixed(2)}K ${symbol || ''}`
//   } else if (balance < 0.01 && balance > 0) {
//     // Show up to two significant digits after leading zeros, no exponential
//     const balanceStr = balance.toFixed(8) // up to 8 decimals for safety
//     const match = balanceStr.match(/^0\.0*(\d{1,2})/)
//     const digits = match
//       ? match[1]
//       : balanceStr.split('.')[1]?.slice(0, 2) || '00'
//     return `0.${'0'.repeat(balanceStr.split('.')[1]?.indexOf(digits) ?? 0)}${digits}`
//     // return `0.${'0'.repeat(balanceStr.split('.')[1]?.indexOf(digits) ?? 0)}${digits} ${symbol || ''}`
//   } else {
//     return `${balance.toFixed(balance >= 1 ? 2 : 4)}`
//     // return `${balance.toFixed(balance >= 1 ? 2 : 4)} ${symbol || ''}`
//   }
// }

export const formatValue = (value?: number) => {
  if (!value) return '$0.00';

  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`;
  } else if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  } else if (value < 0.01 && value > 0) {
    // Show zeros and first two non-zero digits for small values, e.g. 0.00034 -> $0.00034
    const valueStr = value.toFixed(8); // up to 8 decimals for safety
    const match = valueStr.match(/^0\.0*(\d{1,2})/);
    const digits = match
      ? match[1]
      : valueStr.split('.')[1]?.slice(0, 2) || '00';
    return `$0.${'0'.repeat(valueStr.split('.')[1]?.indexOf(digits) ?? 0)}${digits}`;
  } else {
    return `$${value.toFixed(2)}`;
  }
};

export const formatPriceChange = (change?: number) => {
  if (!change) return '+0.0%';
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
};

export const toTitleCase = (str: string) => {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
};
