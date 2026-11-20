import type { ReactNode } from 'react';
import { Logo } from '@/components/shared/logo';

interface AuthLayoutProps {
  eyebrow?: string;
  description?: ReactNode;
  children: ReactNode;
}

export function AuthLayout({ eyebrow, description, children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-dvh overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_40%,#3a3328,#0a0a0b_65%)] opacity-80"
      />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,#0a0a0b_35%,transparent)]" />

      <main className="relative flex w-full max-w-md flex-col justify-center gap-8 px-6 py-12 sm:px-12">
        <div className="flex flex-col gap-3">
          <Logo className="text-6xl" />
          {eyebrow && <p className="eyebrow text-amber">{eyebrow}</p>}
          {description && <p className="text-[15px] leading-relaxed text-muted-foreground">{description}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}
