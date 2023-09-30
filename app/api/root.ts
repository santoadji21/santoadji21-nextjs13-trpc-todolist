import { todoRouters } from '@/app/api/trpc/routers/todo';
import { createTrpcRouter } from '@/app/api/trpc/trpc';

export const appRouter = createTrpcRouter({
  todo: todoRouters
});

export type AppRouter = typeof appRouter;
