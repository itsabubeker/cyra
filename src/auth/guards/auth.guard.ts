import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from '../jwt-payload.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { UsersService } from '../../users/users.service.js';
import { User } from '../../users/entities/user.entity.js';
import { ALLOW_QUERY_TOKEN_KEY } from '../decorators/allow-query-token.decorator.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const allowQueryToken = this.reflector.getAllAndOverride<boolean>(
      ALLOW_QUERY_TOKEN_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: User }>();

    const token = this.extractToken(request, allowQueryToken);

    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.users.findByID(payload.sub);

    if (!user || payload.tokenVersion !== user.tokenVersion) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    request.user = user;

    return true;
  }

  private extractToken(
    request: Request,
    queryToken: boolean,
  ): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer' && token) return token;

    if (queryToken && typeof request.query.token === 'string') {
      return request.query.token;
    }
    return undefined;
  }
}
