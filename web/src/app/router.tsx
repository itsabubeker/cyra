import { createBrowserRouter, Outlet, ScrollRestoration, useRouteError, type RouteObject } from 'react-router';
import { AppLayout, type RouteHandle } from '@/components/layout/app-layout';
import { ErrorState } from '@/components/shared/error-state';
import { NotFound } from '@/components/shared/not-found';
import { BootGate } from '@/features/auth/components/boot-gate';
import { GuestOnly, RequireAdmin, RequireAuth, SetupOnly } from '@/features/auth/guards';
import { LibraryPage } from '@/features/movies/pages/library-page';
import { MoviePage } from '@/features/movies/pages/movie-page';

const heroNav: RouteHandle = { heroNav: true };

function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}

function RouteError() {
  return (
    <ErrorState
      className="min-h-dvh"
      error={useRouteError()}
      title="Something broke"
      onRetry={() => window.location.reload()}
    />
  );
}

const adminRoutes: RouteObject[] = [
  {
    index: true,
    lazy: () => import('@/features/admin/dashboard/dashboard-page').then((m) => ({ Component: m.DashboardPage })),
  },
  {
    path: 'files',
    lazy: () => import('@/features/admin/files/files-page').then((m) => ({ Component: m.FilesPage })),
  },
  {
    path: 'users',
    lazy: () => import('@/features/admin/users/users-page').then((m) => ({ Component: m.UsersPage })),
  },
  {
    path: 'review',
    lazy: () => import('@/features/admin/matching/review-page').then((m) => ({ Component: m.ReviewPage })),
  },
];

const appRoutes: RouteObject[] = [
  { index: true, element: <LibraryPage />, handle: heroNav },
  { path: 'movie/:movieId', element: <MoviePage />, handle: heroNav },
  {
    path: 'account',
    lazy: () => import('@/features/account/account-page').then((m) => ({ Component: m.AccountPage })),
  },
  {
    path: 'admin',
    element: <RequireAdmin />,
    children: [
      {
        lazy: () => import('@/features/admin/admin-layout').then((m) => ({ Component: m.AdminLayout })),
        children: adminRoutes,
      },
    ],
  },
  { path: '*', element: <NotFound className="min-h-dvh" /> },
];

const authenticatedRoutes: RouteObject[] = [
  {
    path: 'watch/:fileId',
    lazy: () => import('@/features/player/pages/watch-page').then((m) => ({ Component: m.WatchPage })),
  },
  { element: <AppLayout />, children: appRoutes },
];

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      {
        element: <BootGate />,
        children: [
          {
            element: <SetupOnly />,
            children: [
              {
                path: 'setup',
                lazy: () => import('@/features/auth/pages/setup-page').then((m) => ({ Component: m.SetupPage })),
              },
            ],
          },
          {
            element: <GuestOnly />,
            children: [
              {
                path: 'login',
                lazy: () => import('@/features/auth/pages/login-page').then((m) => ({ Component: m.LoginPage })),
              },
            ],
          },
          { element: <RequireAuth />, children: authenticatedRoutes },
        ],
      },
    ],
  },
]);
