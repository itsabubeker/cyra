import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role, User } from '../../users/entities/user.entity.js';
import { JwtPayload } from '../jwt-payload.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const role = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!role || role.length === 0) return true;
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: User }>();

    if (!request.user) {
      throw new ForbiddenException('No role found');
    }

    const userRole = request.user?.role;

    if (role.includes(userRole)) {
      return true;
    } else {
      throw new ForbiddenException();
    }
  }
}
