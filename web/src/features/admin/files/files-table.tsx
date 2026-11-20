import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { MediaFile } from '@/api/types';
import { formatBytes } from '@/lib/format';
import { fileName, isLowConfidence } from '@/lib/media-file';
import { cn } from '@/lib/utils';
import { MatchScore, MatchStatusLabel } from './match-status';

interface FilesTableProps {
  files: MediaFile[] | undefined;
  selectedId: number | undefined;
  onSelect: (file: MediaFile) => void;
}

const headClass = 'h-auto py-2.5 font-mono text-[10px] font-medium tracking-[0.12em] text-subtle uppercase';

export function FilesTable({ files, selectedId, onSelect }: FilesTableProps) {
  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className={cn(headClass, 'w-[45%] md:w-[40%]')}>File</TableHead>
          <TableHead className={cn(headClass, 'hidden md:table-cell')}>Parsed as</TableHead>
          <TableHead className={cn(headClass, 'hidden w-24 sm:table-cell')}>Size</TableHead>
          <TableHead className={cn(headClass, 'w-32')}>Status</TableHead>
          <TableHead className={cn(headClass, 'w-16')}>Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files === undefined
          ? Array.from({ length: 8 }, (_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={5}>
                  <Skeleton className="h-6" />
                </TableCell>
              </TableRow>
            ))
          : files.map((file) => (
              <TableRow
                key={file.id}
                data-state={file.id === selectedId ? 'selected' : undefined}
                onClick={() => onSelect(file)}
                className={cn(
                  'cursor-pointer border-[#1c1c1f] data-[state=selected]:bg-amber-surface',
                  isLowConfidence(file) && 'shadow-[inset_2px_0_0_var(--amber)]',
                )}
              >
                <TableCell className="py-3">
                  <button
                    type="button"
                    title={file.relativePath}
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelect(file);
                    }}
                    className="block w-full cursor-pointer truncate text-left font-mono text-xs outline-none focus-visible:text-amber"
                  >
                    {fileName(file.relativePath)}
                  </button>
                </TableCell>
                <TableCell className="hidden truncate md:table-cell">
                  <span className="display text-[19px]">{file.parsedTitle}</span>{' '}
                  {file.parsedYear && <span className="font-mono text-[11px] text-subtle">{file.parsedYear}</span>}
                </TableCell>
                <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">
                  {formatBytes(file.sizeBytes)}
                </TableCell>
                <TableCell>
                  <MatchStatusLabel file={file} />
                </TableCell>
                <TableCell>
                  <MatchScore file={file} />
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
}
