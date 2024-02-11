'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getFetch, httpBatchLink, loggerLink } from '@trpc/client';
import { useState } from 'react';
import superjson from 'superjson';
import { trpc } from '@/utils/api';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export const TrpcProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 5000 } }
      })
  );

  const url = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://santoadji21-nextjs13-trpc-todolist.vercel.app/api/trpc/`
    : 'http://localhost:3000/api/trpc/';

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink({
          enabled: () => true
        }),
        httpBatchLink({
          url,
          fetch: async (input, init?) => {
            const fetch = getFetch();
            const headers = new Headers(init?.headers);
            headers.set('Content-Type', 'application/json');
            headers.set('Accept', 'application/json');
            headers.set('Access-Control-Allow-Origin', '*');
            headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            headers.set('Access-Control-Allow-Headers', 'Content-Type');
            // Update init object with the modified headers
            init = {
              ...init,
              headers: headers
            };
            return fetch(input, {
              ...init,
              credentials: 'include'
            });
          }
        })
      ],
      transformer: superjson
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools />
      </QueryClientProvider>
    </trpc.Provider>
  );
};
