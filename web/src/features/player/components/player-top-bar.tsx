import { useLocation, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlayerTopBarProps {
  title: string;
  subtitle: string;
  fallbackPath: string;
}

export function PlayerTopBar({ title, subtitle, fallbackPath }: PlayerTopBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const goBack = () => (location.key === 'default' ? navigate(fallbackPath) : navigate(-1));

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center gap-4 bg-linear-to-b from-black/75 to-transparent px-4 pt-5 pb-12 md:px-9 md:pt-6">
      <Button
        variant="outline"
        size="icon-lg"
        aria-label="Back"
        onClick={goBack}
        className="pointer-events-auto shrink-0 border-foreground/30 bg-black/50"
      >
        <ArrowLeft />
      </Button>
      <div className="flex min-w-0 flex-col gap-0.5">
        <h1 className="display truncate text-3xl leading-none">{title}</h1>
        <p className="truncate font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">{subtitle}</p>
      </div>
    </div>
  );
}
