import { Button } from '@/components/ui/button';
import { signOut } from '@/features/auth/api';
import { useCurrentUser } from '@/features/auth/use-current-user';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { ChangePasswordForm } from './change-password-form';

export function AccountPage() {
  useDocumentTitle('Account');
  const user = useCurrentUser();

  return (
    <main className="grid min-h-dvh pt-(--nav-height) pb-28 md:grid-cols-2 md:pb-0">
      <section className="flex flex-col gap-3.5 border-[#1c1c1f] px-5 py-10 md:border-r md:px-11 md:py-12">
        <p className="eyebrow">Signed in as</p>
        <h1 className="display text-6xl md:text-8xl md:leading-[0.85]">{user.username}</h1>
        <p className="font-mono text-xs tracking-[0.1em] text-amber uppercase">{user.role}</p>
        <div className="flex-1" />
        <Button variant="outline" size="lg" className="mt-6 self-start text-sm font-medium" onClick={signOut}>
          Sign out
        </Button>
      </section>
      <section className="px-5 py-10 md:px-11 md:py-12">
        <ChangePasswordForm />
      </section>
    </main>
  );
}
