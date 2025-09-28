export function strStripUnderscores(str: string) { return str.replaceAll("_", " "); }

export function strFormName(str: string) { return strStripUnderscores(str); }

export function strMaxLen(str: string, maxLen: number) { return str.substring(0, Math.min(str.length, maxLen)); }

