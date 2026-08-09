export function normPhone(raw: string): string {
  let s = raw.replace(/[\s\-()]/g, "");
  if (/^\+9665\d{8}$/.test(s)) s = "0" + s.slice(4);
  else if (/^9665\d{8}$/.test(s)) s = "0" + s.slice(3);
  else if (/^5\d{8}$/.test(s)) s = "0" + s;
  else if (/^1\d{8}$/.test(s)) s = "0" + s;
  return s;
}

export function isPhoneLike(v: string): boolean {
  return /^[+\d][\d\s\-()]{6,}$/.test(v.trim());
}

export function isUrlLike(v: string): boolean {
  const s = v.trim();
  return /^https?:\/\//i.test(s) || s.includes("maps.");
}
