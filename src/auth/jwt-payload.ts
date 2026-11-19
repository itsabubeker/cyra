import { Role } from '../users/entities/user.entity.js';

export interface JwtPayload {
  sub: number;
  role: Role;
  tokenVersion: number;
}
