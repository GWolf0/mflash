export function strStripUnderscores(str: string) { return str.replaceAll("_", " "); }

export function strFormName(str: string) { return strStripUnderscores(str); }

export function strTruncate(str: string, maxLen: number) { return str.substring(0, Math.min(str.length, maxLen)); }

