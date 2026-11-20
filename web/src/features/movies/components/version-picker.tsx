import type { MediaFile } from '@/api/types';
import { DetailList } from '@/components/shared/detail-list';
import { ExtensionBadge, PlaybackBadge } from '@/components/shared/playback-badge';
import { formatBytes } from '@/lib/format';
import { fileExtension, fileName } from '@/lib/media-file';
import { cn } from '@/lib/utils';

interface VersionPickerProps {
  files: MediaFile[];
  selectedId: number | undefined;
  onSelect: (fileId: number) => void;
}

export function VersionPicker({ files, selectedId, onSelect }: VersionPickerProps) {
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="eyebrow mb-2.5">Versions · {files.length}</legend>
      {files.map((file) => {
        const selected = file.id === selectedId;
        return (
          <label
            key={file.id}
            className={cn(
              'flex cursor-pointer flex-col gap-2 rounded-lg border px-4 py-3.5 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring',
              selected ? 'border-amber-border bg-amber-surface' : 'border-border bg-card hover:border-input',
            )}
          >
            <span className="flex items-start gap-2.5">
              <input
                type="radio"
                name="version"
                value={file.id}
                checked={selected}
                onChange={() => onSelect(file.id)}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className={cn(
                  'mt-0.5 grid size-3.5 shrink-0 place-items-center rounded-full border-[1.5px]',
                  selected ? 'border-amber' : 'border-subtle',
                )}
              >
                {selected && <span className="size-1.5 rounded-full bg-amber" />}
              </span>
              <span className="text-[13px] font-medium break-all">{fileName(file.relativePath)}</span>
            </span>
            <FileFacts file={file} className="pl-6" />
          </label>
        );
      })}
    </fieldset>
  );
}

export function FileInfo({ file }: { file: MediaFile }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="eyebrow">File info</h2>
      <p className="text-[13px] font-medium break-all">{fileName(file.relativePath)}</p>
      <FileFacts file={file} />
      <DetailList
        items={[{ label: 'Path', value: <span className="text-muted-foreground">{file.relativePath}</span> }]}
      />
    </section>
  );
}

function FileFacts({ file, className }: { file: MediaFile; className?: string }) {
  return (
    <span className={cn('flex flex-wrap items-center gap-2 font-mono text-[11px]', className)}>
      <ExtensionBadge extension={fileExtension(file.relativePath)} />
      <span className="text-muted-foreground">{formatBytes(file.sizeBytes)}</span>
      <PlaybackBadge relativePath={file.relativePath} />
    </span>
  );
}
