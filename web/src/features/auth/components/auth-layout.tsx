import type { ReactNode } from 'react';
import { Backdrop } from '@/components/shared/backdrop';
import { Logo } from '@/components/shared/logo';
import { sceneBackground } from '@/lib/backgrounds';

interface AuthLayoutProps {
  eyebrow?: string;
  description?: ReactNode;
  children: ReactNode;
}

export function AuthLayout({ eyebrow, description, children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-dvh overflow-hidden">
      {/* On phones the form spans the full width, so the photo sits behind it: dim it there. */}
      <Backdrop src={sceneBackground} fade="side" imageClassName="opacity-35 sm:opacity-100" />

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
