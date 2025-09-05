const ThousandthsRegex = /\B(?=(\d{3})+(?!\d))/g;

export function formatCurrency(value: number, log: boolean = false): string | null {
  if (value === null || value === undefined) return null;
  if (log) console.log("Formatting currency:", value);
  return `$${Number(value).toFixed(2).replace(ThousandthsRegex, ",")}`;
}

export function formatPercentage(value: number): string | null {
  if (value === null || value === undefined) return null;
  return `${Number(value).toFixed(2)}%`;
}

// adds a comma for every 1000ths place
export function formatNumber(value: number): string | null {
  if (value === null || value === undefined) return null;
  return Number(value).toString().replace(ThousandthsRegex, ",");
}
