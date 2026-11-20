import { useDocumentTitle } from '@/hooks/use-document-title';
import { AdminPageHeader } from '../admin-layout';
import { JobPipeline } from './job-pipeline';
import { LibraryStats } from './library-stats';
import { LowConfidenceMatches } from './low-confidence-matches';

export function DashboardPage() {
  useDocumentTitle('Admin');

  return (
    <>
      <AdminPageHeader title="Projection room" />
      <LibraryStats />
      <JobPipeline />
      <LowConfidenceMatches />
    </>
  );
}
