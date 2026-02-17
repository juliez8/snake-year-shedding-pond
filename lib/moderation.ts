import leoProfanity from 'leo-profanity';

// Load the default English dictionary
leoProfanity.loadDictionary('en');

// Add extra words the default list might miss
leoProfanity.add([
  'stfu', 'gtfo', 'kys', 'kms', 'pedo',
]);

/**
 * Normalize text to catch evasion tactics:
 * - Collapse repeated letters: "shittt" → "shit", "fuuuck" → "fuck"
 * - Remove common separators: "s.h.i.t" → "shit"
 * - Replace common letter substitutions: "sh1t" → "shit", "@ss" → "ass"
 */
function normalizeForCheck(text: string): string {
  let normalized = text.toLowerCase();

  // Replace common letter substitutions
  const subs: Record<string, string> = {
    '@': 'a', '4': 'a', '3': 'e', '1': 'i', '!': 'i',
    '0': 'o', '5': 's', '$': 's', '7': 't', '+': 't', '8': 'b',
  };
  for (const [char, replacement] of Object.entries(subs)) {
    normalized = normalized.split(char).join(replacement);
  }

  // Remove separators used for evasion: "f.u.c.k", "s-h-i-t", "f_u_c_k"
  normalized = normalized.replace(/[.\-_*~\s]/g, '');

  // Collapse repeated characters: "shittt" → "shit", "assss" → "ass"
  normalized = normalized.replace(/(.)\1{2,}/g, '$1$1');

  return normalized;
}

/**
 * Content moderation using leo-profanity.
 * Free, no API key needed, runs entirely in-process.
 * Checks both the original message and a normalized version to catch evasion.
 * Returns null if the message is clean, or an error string if flagged.
 */
export function moderateMessage(message: string): string | null {
  // Check original message
  if (leoProfanity.check(message)) {
    return 'Your message contains inappropriate language. Please rephrase it.';
  }

  // Check normalized version to catch evasion (substitutions, separators)
  const normalized = normalizeForCheck(message);
  if (leoProfanity.check(normalized)) {
    return 'Your message contains inappropriate language. Please rephrase it.';
  }

  // Also check with ALL repeated chars fully collapsed: "shittt" → "shit"
  const fullyCollapsed = normalized.replace(/(.)\1+/g, '$1');
  if (leoProfanity.check(fullyCollapsed)) {
    return 'Your message contains inappropriate language. Please rephrase it.';
  }

  return null;
}
