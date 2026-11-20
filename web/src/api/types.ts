import type { components } from './schema';

type Schemas = components['schemas'];

export type User = Schemas['UserResponseDto'];
export type Role = User['role'];

export type MovieListItem = Schemas['MovieListItemDto'];
export type MovieDetail = Schemas['MovieDetailDto'];
export type Movie = Schemas['Movie'];

export type MediaFile = Schemas['MediaFile'];
export type MatchStatus = MediaFile['matchStatus'];

export type Job = Schemas['JobDto'];
export type JobKind = Job['kind'];
export type ScanResult = Schemas['ScannerResponseDto'];
export type MatchAllResult = Schemas['MatchAllResponseDto'];
export type UnmatchedFile = Schemas['UnmatchedFileDto'];
export type FailedFile = Schemas['FailedFileDto'];
export type MatchCandidate = Schemas['MatchCandidateDto'];

export type TmdbMovie = Schemas['TmdbMovieDto'];
export type TmdbSearchResponse = Schemas['SearchTmdbResponseDto'];

export type CreateUserInput = Schemas['CreateUserDto'];
export type Credentials = Schemas['LoginDto'];
export type ChangePasswordInput = Schemas['ChangePasswordDto'];

export interface Paginated<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

export interface HealthResponse {
  status: string;
}
