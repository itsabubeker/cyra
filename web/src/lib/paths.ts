export const paths = {
  library: '/',
  movie: (movieId: number) => `/movie/${movieId}`,
  watch: (fileId: number) => `/watch/${fileId}`,
  account: '/account',
  login: '/login',
  setup: '/setup',
  admin: {
    dashboard: '/admin',
    files: '/admin/files',
    users: '/admin/users',
    review: '/admin/review',
  },
} as const;
