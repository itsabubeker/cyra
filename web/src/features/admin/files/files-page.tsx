import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { Pagination } from '@/components/shared/pagination';
import type { MatchStatus, MediaFile } from '@/api/types';
import { FILES_PAGE_SIZE, fileListQuery } from '@/features/files/api';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { AdminPageHeader } from '../admin-layout';
import { FixMatchDialog } from '../matching/fix-match-dialog';
import { FileDrawer } from './file-drawer';
import { FilesTable } from './files-table';
import { StatusTabs } from './status-tabs';

const STATUSES: MatchStatus[] = ['matched', 'manual', 'unmatched'];

function parseStatus(value: string | null): MatchStatus | undefined {
  return STATUSES.find((status) => status === value);
}

function parsePositive(value: string | null): number | undefined {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : undefined;
}

export function FilesPage() {
  useDocumentTitle('Files');
  const [params, setParams] = useSearchParams();
  const status = parseStatus(params.get('status'));
  const page = parsePositive(params.get('page')) ?? 1;
  const openFileId = parsePositive(params.get('file'));
  const [fixing, setFixing] = useState<MediaFile | null>(null);

  const query = useQuery(fileListQuery(status, page));
  const pageCount = query.data ? Math.ceil(query.data.total / FILES_PAGE_SIZE) : 0;

  const update = (changes: Record<string, string | number | undefined>, replace = false) =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        for (const [key, value] of Object.entries(changes)) {
          if (value === undefined || (key === 'page' && value === 1)) next.delete(key);
          else next.set(key, String(value));
        }
        return next;
      },
      { replace },
    );

  return (
    <>
      <AdminPageHeader title="Files">
        <StatusTabs value={status} onChange={(next) => update({ status: next, page: undefined, file: undefined })} />
      </AdminPageHeader>

      <div className="mx-4 mt-6 md:mx-11">
        {query.isError ? (
          <ErrorState error={query.error} title="Couldn't load files" onRetry={() => query.refetch()} />
        ) : query.data?.total === 0 ? (
          <EmptyState
            title={status ? `No ${status} files` : 'No files yet'}
            description={status ? undefined : 'Run a scan from the dashboard to index your media folder.'}
          />
        ) : (
          <>
            <FilesTable
              files={query.data?.items}
              selectedId={openFileId}
              onSelect={(file) => update({ file: file.id }, true)}
            />
            <Pagination
              page={page}
              pageCount={pageCount}
              onPageChange={(next) => update({ page: next })}
              className="mt-5"
            />
          </>
        )}
      </div>

      <FileDrawer fileId={openFileId} onClose={() => update({ file: undefined }, true)} onFixMatch={setFixing} />
      <FixMatchDialog file={fixing} onOpenChange={(open) => !open && setFixing(null)} />
    </>
  );
}
