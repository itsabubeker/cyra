import { Button } from '@/components/ui/button';
import { errorMessage } from '@/lib/errors';
import { EmptyState } from './empty-state';

interface ErrorStateProps {
  error: unknown;
  title?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ error, title = 'Something went wrong', onRetry, className }: ErrorStateProps) {
  return (
    <EmptyState
      className={className}
      indicator={<span className="size-2.5 rounded-full bg-danger shadow-[0_0_14px_var(--danger)]" />}
      title={title}
      description={errorMessage(error)}
    >
      {onRetry && <Button onClick={onRetry}>Try again</Button>}
    </EmptyState>
  );
}
