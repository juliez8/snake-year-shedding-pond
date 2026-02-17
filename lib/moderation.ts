import leoProfanity from 'leo-profanity';

// Load the default English dictionary
leoProfanity.loadDictionary('en');

// Add extra words the default list might miss
leoProfanity.add([
  'stfu', 'gtfo', 'kys', 'kms', 'pedo',
]);

/**
 * Content moderation using leo-profanity.
 * Free, no API key needed, runs entirely in-process.
 * Returns null if the message is clean, or an error string if flagged.
 */
export function moderateMessage(message: string): string | null {
  if (leoProfanity.check(message)) {
    return 'Your message contains inappropriate language. Please rephrase it.';
  }

  return null;
}
