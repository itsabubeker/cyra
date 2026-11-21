// Film stills shown behind screens that have little else on them (sign-in,
// setup, empty library, error pages). Files live in public/assets/backgrounds.
// Only dark, full-bleed images belong here: the fades assume a dark photo.
const FILES = [
  'dqK9Hag1054tghRQSqLSfrkvQnA', // The Dark Knight
  'hZkgoQYus5vegHoetLkCJzb17zJ', // Fight Club
  'ii8QGacT3MXESqBckQlyrATY0lT', // Inception
  'jhk6D8pim3yaByu1801kMoxXFaX', // Gladiator
  'ttnlkfAihfMmm34WWMsg2WUns3u', // Whiplash
  'v4u9FnSOpLEjPIAhbKClM45LJoJ', // Memento
  'v8xVDqt8uCul3c3mgx4VpGCwxJC', // The Shawshank Redemption
  'yCnJT53HMXAK87xzPAdjdYhZ3JE', // The Prestige
];

/**
 * One background per page load, so moving between screens (setup → login →
 * empty library) keeps the same image instead of flashing a new one.
 */
export const sceneBackground = `${import.meta.env.BASE_URL}assets/backgrounds/${
  FILES[Math.floor(Math.random() * FILES.length)]
}.webp`;
