import { createTRPCRouter } from '../init';
import { usersRouter } from '@/modules/users/server/procedures';
import { gamesRouter } from '@/modules/games/server/procedures';
import { teamsRouter } from '@/modules/teams/server/procedures';
import { seasonRouter } from '@/modules/season/procedures';
import { picksRouter } from '@/modules/picks/server/procedures';
import { resultsRouter } from '@/modules/results/server/procedures';

export const appRouter = createTRPCRouter({  
  users: usersRouter,
  games: gamesRouter,
  teams: teamsRouter,
  season: seasonRouter,
  picks: picksRouter,
  results: resultsRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;