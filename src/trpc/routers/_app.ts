import { gamesRouter } from '@/modules/games/server/procedures';
import { createTRPCRouter } from '../init';
import { usersRouter } from '@/modules/users/server/procedures';

export const appRouter = createTRPCRouter({  
  users: usersRouter,
  games: gamesRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;