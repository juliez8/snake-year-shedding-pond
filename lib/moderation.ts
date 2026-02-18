/**
 * Message moderation using leo-profanity plus simple normalization.
 * Normalization handles repeated characters, substitutions, and separators.
 */
import leoProfanity from 'leo-profanity';

leoProfanity.loadDictionary('en');

leoProfanity.add([
  'stfu', 'gtfo', 'kys', 'kms', 'pedo',
]);
function normalizeForCheck(text: string): string {
  let normalized = text.toLowerCase();

  // Replace common letter substitutions (e.g. 1→i, @→a).
  const subs: Record<string, string> = {
    '@': 'a', '4': 'a', '3': 'e', '1': 'i', '!': 'i',
    '0': 'o', '5': 's', '$': 's', '7': 't', '+': 't', '8': 'b',
  };
  for (const [char, replacement] of Object.entries(subs)) {
    normalized = normalized.split(char).join(replacement);
  }

  // Remove separators between letters (e.g. d.o.t.s, d-a-s-h-e-s).
  normalized = normalized.replace(/[.\-_*~\s]/g, '');

  // Collapse repeated characters (e.g. xxx → xx).
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
  if (leoProfanity.check(message)) {
    return 'Your message contains inappropriate language. Please rephrase it.';
  }

  const normalized = normalizeForCheck(message);
  if (leoProfanity.check(normalized)) {
    return 'Your message contains inappropriate language. Please rephrase it.';
  }

  // Also check with all repeated chars fully collapsed.
  const fullyCollapsed = normalized.replace(/(.)\1+/g, '$1');
  if (leoProfanity.check(fullyCollapsed)) {
    return 'Your message contains inappropriate language. Please rephrase it.';
  }

  return null;
}
