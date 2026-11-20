import { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/shared/form-alert';

interface ExternalPlayerPanelProps {
  streamUrl: string;
  fileName: string;
  reason: 'unsupported' | 'failed';
}

const REASONS = {
  unsupported: "Browsers can't play this file format.",
  failed:
    "Your browser couldn't play this file. It may use a codec the browser doesn't support, or the file can't be found on the server.",
};

export function ExternalPlayerPanel({ streamUrl, fileName, reason }: ExternalPlayerPanelProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(streamUrl);
      setCopied(true);
      toast.success('Stream URL copied');
    } catch {
      toast.error("Couldn't copy. Select the link and copy it manually.");
    }
  };

  return (
    <section className="flex w-full max-w-lg flex-col gap-5 rounded-2xl border border-input bg-card/90 p-6 backdrop-blur-md">
      <div className="flex flex-col gap-2">
        <p className="eyebrow text-amber">External player</p>
        <h2 className="display text-4xl leading-none">Open in an external player</h2>
        <p className="text-sm leading-relaxed text-body">
          {REASONS[reason]} Play it with a desktop player like VLC: copy the stream URL and open it as a network stream,
          or download the file.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={copy}>
          {copied ? <Check /> : <Copy />}
          {copied ? 'Copied' : 'Copy stream URL'}
        </Button>
        <Button variant="outline" asChild>
          <a href={streamUrl} download={fileName}>
            <Download /> Download
          </a>
        </Button>
      </div>
      <FormAlert tone="warning">
        This link contains your sign-in token. Anyone with it can stream as you until it expires or you change your
        password. Don't share it.
      </FormAlert>
    </section>
  );
}
