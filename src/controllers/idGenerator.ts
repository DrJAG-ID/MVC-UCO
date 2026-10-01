/**
 * Generator for usernumber/ID format: YYYYMMDD-XYZ
 * YYYY = years in 4 digits
 * MM   = month in 2 digits
 * DD   = days in 2 digits
 * XYZ  = random Hexadecimal for 3 digits
 */
export function generateUserNumber(date: Date = new Date()): string {
  const yyyy = date.getFullYear().toString();
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');

  const hexChars = '0123456789ABCDEF';
  let xyz = '';
  for (let i = 0; i < 3; i++) {
    xyz += hexChars.charAt(Math.floor(Math.random() * hexChars.length));
  }

  return `${yyyy}${mm}${dd}-${xyz}`;
}

export function getCurrentDateStamp(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  const dd = d.getDate().toString().padStart(2, '0');
  const hh = d.getHours().toString().padStart(2, '0');
  const min = d.getMinutes().toString().padStart(2, '0');
  const ss = d.getSeconds().toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}
