import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  data: T;
  meta?: Record<string, any>;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((res) => {
        // If the controller returned an object with data and meta, preserve it
        if (res && typeof res === 'object' && 'data' in res && 'meta' in res) {
          return {
            statusCode,
            data: res.data,
            meta: res.meta,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          statusCode,
          data: res,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
