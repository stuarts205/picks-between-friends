import { createTRPCRouter } from '../init';
import { usersRouter } from '@/modules/users/server/procedures';
import { gamesRouter } from '@/modules/games/server/procedures';
import { teamsRouter } from '@/modules/teams/server/procedures';

export const appRouter = createTRPCRouter({  
  users: usersRouter,
  games: gamesRouter,
  teams: teamsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;