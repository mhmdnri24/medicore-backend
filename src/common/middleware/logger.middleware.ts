import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const user = (req as Request & { user?: { employeeId?: string } }).user;
    const actor = user?.employeeId ?? 'anonymous';
    const timestamp = new Date().toISOString();

    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl} — ${req.ip || '::1'} — ${actor}`,
    );

    next();
  }
}
