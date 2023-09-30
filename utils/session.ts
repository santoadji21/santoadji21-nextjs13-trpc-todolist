import { getSession } from 'next-auth/react';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Session } from 'next-auth';

interface ContextArgs {
  req: NextApiRequest;
  res: NextApiResponse;
}

interface SessionContext {
  session: Session | null;
}

export const createSessionContext = async ({ req, res }: ContextArgs): Promise<SessionContext> => {
  const session = await getSession({ req });
  return { session };
};
