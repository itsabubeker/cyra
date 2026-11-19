import { VIDEO_EXTS } from '../scanner/video-extensions.js';
import { MIME_TYPES } from './stream.service.js';

// Every extension the scanner picks up must stream with a real Content-Type,
// not application/octet-stream.
describe('MIME_TYPES', () => {
  it.each(VIDEO_EXTS)('has a type for .%s', (ext) => {
    expect(MIME_TYPES[`.${ext}`]).toMatch(/^video\//);
  });
});
