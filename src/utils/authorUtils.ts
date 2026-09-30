/**
 * Extracts only the author's first name for clean single article bylines.
 * Handles standard spaced names ("Alex Rider" -> "Alex"),
 * underscore names ("Sarah_Chen" -> "Sarah"),
 * CamelCase usernames ("AlexRider" -> "Alex", "ElenaVance" -> "Elena"),
 * and professional prefixes ("DrGraceNjeri" -> "Grace").
 */
export const getAuthorFirstName = (authorName?: string): string => {
  if (!authorName) return 'Author';
  let clean = authorName.replace(/^u\//i, '').replace(/^@/, '').trim();

  // Strip common academic/professional prefixes if present
  if (/^(Dr\.?|Prof\.?|Eng\.?)\s+/i.test(clean)) {
    clean = clean.replace(/^(Dr\.?|Prof\.?|Eng\.?)\s+/i, '');
  } else if (/^(Dr|Prof|Eng)([A-Z][a-z]+)/.test(clean)) {
    const titleMatch = clean.match(/^(?:Dr|Prof|Eng)([A-Z][a-z]+)/);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1];
    }
  }

  // Check common delimiters
  if (clean.includes(' ')) return clean.split(' ')[0];
  if (clean.includes('_')) return clean.split('_')[0];
  if (clean.includes('.')) return clean.split('.')[0];
  if (clean.includes('-')) return clean.split('-')[0];

  // Check CamelCase (e.g. AlexRider -> Alex, QuantumEngineer -> Quantum)
  const camelMatch = clean.match(/^([A-Z]?[a-z]+)[A-Z]/);
  if (camelMatch && camelMatch[1]) {
    return camelMatch[1];
  }

  return clean;
};
