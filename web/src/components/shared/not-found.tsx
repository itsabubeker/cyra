import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { paths } from '@/lib/paths';
import { EmptyState } from './empty-state';

interface NotFoundProps {
  title?: string;
  description?: string;
  className?: string;
}

export function NotFound({
  title = 'This reel is missing',
  description = "The page you're looking for doesn't exist.",
  className,
}: NotFoundProps) {
  return (
    <EmptyState eyebrow="404" title={title} description={description} className={className}>
      <Button asChild>
        <Link to={paths.library}>Back to the library</Link>
      </Button>
    </EmptyState>
  );
}
