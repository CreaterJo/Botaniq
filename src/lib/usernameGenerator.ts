// Adjectives for username generation
const ADJECTIVES = [
  'grün', 'blau', 'rot', 'gelb', 'weiß', 'rosa', 'lila', 'orange',
  'frisch', 'blühend', 'wild', 'sanft', 'stark', 'schnell', 'leise',
  'gold', 'silber', 'kristall', 'marmor', 'samt', 'seide',
  'frühlings', 'sommer', 'herbst', 'winter', 'morgen', 'abend',
  'berg', 'tal', 'fluss', 'see', 'wald', 'wiese', 'garten',
  'sonnen', 'monden', 'sternen', 'wolken', 'regen', 'sturm',
  'blatt', 'blüte', 'wurzel', 'stamm', 'zweig', 'knospe',
  'minz', 'lavendel', 'rosen', 'lilien', 'tulpen', 'nelken'
];

// Nouns for username generation
const NOUNS = [
  'rose', 'tulpe', 'lilie', 'nelke', 'orchidee', 'lavendel',
  'farn', 'moos', 'eiche', 'birke', 'ahorn', 'kiefer',
  'schmetterling', 'biene', 'libelle', 'vogel', 'fuchs', 'hase',
  'stein', 'fluss', 'berg', 'tal', 'wald', 'wiese',
  'gärtner', 'botaniker', 'liebhaber', 'kenner', 'sammler', 'träumer',
  'blatt', 'blüte', 'wurzel', 'stamm', 'zweig', 'knospe',
  'tropfen', 'strahl', 'hauch', 'duft', 'farbe', 'glanz',
  'garten', 'park', 'allee', 'wiese', 'ufer', 'hang'
];

/**
 * Generate a unique username in format: adjective-noun-number
 * Examples: grün-rose-42, blühend-gärtner-1337
 */
export function generateUsername(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const number = Math.floor(Math.random() * 9999) + 1;

  return `${adjective}-${noun}-${number}`;
}

/**
 * Generate multiple unique usernames
 */
export function generateUsernames(count: number): string[] {
  const usernames = new Set<string>();

  while (usernames.size < count) {
    usernames.add(generateUsername());
  }

  return Array.from(usernames);
}

/**
 * Validate username format
 */
export function isValidUsername(username: string): boolean {
  const pattern = /^[a-zäöüß]+-[a-zäöüß]+-\d+$/;
  return pattern.test(username);
}
