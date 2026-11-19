import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { JobDto, JobKind, JobStatus } from './dto/job.dto.js';
import { randomUUID } from 'node:crypto';
import { ScannerResponseDto } from '../scanner/dto/scanner-response.dto.js';
import { MatchAllResponseDto } from '../metadata/dto/metadata-response.dto.js';

@Injectable()
export class JobsService {
  private current: JobDto | null = null;
  private logger = new Logger(JobsService.name);

  getCurrent() {
    return this.current;
  }
  start<T extends ScannerResponseDto | MatchAllResponseDto>(
    kind: JobKind,
    work: (report: (done: number, total: number) => void) => Promise<T>,
  ) {
    if (this.current?.status === JobStatus.Running) {
      throw new ConflictException('A job is already running');
    }
    const job: JobDto = {
      id: randomUUID(),
      status: JobStatus.Running,
      startedAt: new Date(),
      finishedAt: null,
      error: null,
      kind,
      progress: null,
      result: null,
    };
    this.current = job;

    const report = (done: number, total: number) => {
      job.progress = { done, total };
    };

    void Promise.resolve()
      .then(() => work(report))
      .then((result) => {
        job.status = JobStatus.Completed;
        job.result = result;
        job.finishedAt = new Date();
      })
      .catch((err: unknown) => {
        this.logger.error(err);
        job.status = JobStatus.Failed;
        job.finishedAt = new Date();

        if (err instanceof Error) {
          job.error = err.message;
        } else if (typeof err === 'string') {
          job.error = err;
        } else {
          job.error = 'Unknown error';
        }
      });

    return job;
  }
}
