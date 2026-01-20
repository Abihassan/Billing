function toCamelCase(s: string) {
  return s.replace(/_([a-z])/g, (_m, p1) => p1.toUpperCase());
}
function toSnakeCase(s: string) {
  return s.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}

export function toCamel<T = any>(obj: any): T {
  if (!obj || typeof obj !== 'object') return obj;
  const out: any = Array.isArray(obj) ? [] : {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const newKey = toCamelCase(key);
    out[newKey] = val && typeof val === 'object' && !Array.isArray(val) ? toCamel(val) : val;
  }
  return out;
}

export function toSnake<T = any>(obj: any): T {
  if (!obj || typeof obj !== 'object') return obj;
  const out: any = Array.isArray(obj) ? [] : {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const newKey = toSnakeCase(key);
    out[newKey] = val && typeof val === 'object' && !Array.isArray(val) ? toSnake(val) : val;
  }
  return out;
}
