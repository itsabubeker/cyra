import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import type { MediaFile } from '@/api/types';
import { fileName } from '@/lib/media-file';
import { paths } from '@/lib/paths';
import { MatchSummary } from '../files/match-status';
import { FixMatchDialog } from './fix-match-dialog';

interface AdminMatchPanelProps {
  movieId: number;
  files: MediaFile[];
}

export function AdminMatchPanel({ movieId, files }: AdminMatchPanelProps) {
  const [fixing, setFixing] = useState<MediaFile | null>(null);
  const navigate = useNavigate();

  // The server removes a movie once its last file is matched elsewhere, so follow the file.
  const followIfMovieRemoved = (updated: MediaFile) => {
    const newMovieId = updated.movie?.id;
    if (files.length === 1 && newMovieId !== undefined && newMovieId !== movieId) {
      navigate(paths.movie(newMovieId), { replace: true });
    }
  };

  return (
    <section
      aria-label="Admin match details"
      className="flex flex-col gap-3 rounded-lg border border-dashed border-[#3a3a3e] p-4"
    >
      <h2 className="eyebrow flex justify-between">
        <span>Admin · Match</span>
        <span className="text-amber">
          {files.length} {files.length === 1 ? 'file' : 'files'}
        </span>
      </h2>
      <ul className="flex flex-col gap-3">
        {files.map((file) => (
          <li key={file.id} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate text-[13px]" title={file.relativePath}>
                {fileName(file.relativePath)}
              </span>
              <MatchSummary file={file} />
            </div>
            <Button variant="outline" size="sm" className="self-start" onClick={() => setFixing(file)}>
              Fix match…
            </Button>
          </li>
        ))}
      </ul>
      <FixMatchDialog
        file={fixing}
        onOpenChange={(open) => !open && setFixing(null)}
        onMatched={followIfMovieRemoved}
      />
    </section>
  );
}
