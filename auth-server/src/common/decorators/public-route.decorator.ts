// ignore-expiration.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const PUBLIC_ROUTE_KEY = 'isPublicRoute';
export const IsPublicRoute = () => SetMetadata(PUBLIC_ROUTE_KEY, true);