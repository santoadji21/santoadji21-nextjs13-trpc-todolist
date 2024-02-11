import { appRouter } from '@/app/api/root';
import { FetchCreateContextFnOptions, fetchRequestHandler } from '@trpc/server/adapters/fetch';

const VERCEL_BASE_URL = process.env.VERCEL_BASE_URL;

// if (!VERCEL_BASE_URL) {
//   throw new Error('VERCEL_BASE_URL environment variable is not set');
// }

const handler = (request: Request) => {
  console.log(`incoming request ${request.url}`);
  return fetchRequestHandler({
    endpoint: `/api/trpc`,
    // endpoint: `${VERCEL_BASE_URL}/api/trpc`,
    req: request,
    router: appRouter,
    createContext: function (opts: FetchCreateContextFnOptions): object | Promise<object> {
      return {};
    }
  });
};

export { handler as GET, handler as POST };
