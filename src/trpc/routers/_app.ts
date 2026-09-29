import { createTRPCRouter } from '../init';
import { usersRouter } from '@/modules/users/server/procedures';
import { gamesRouter } from '@/modules/games/server/procedures';
import { teamsRouter } from '@/modules/teams/server/procedures';
import { seasonRouter } from '@/modules/season/procedures';
import { picksRouter } from '@/modules/picks/server/procedures';
import { resultsRouter } from '@/modules/results/server/procedures';
import { analyticsRouter } from '@/modules/analytics/server/procedures';
import { commentRouter } from '@/modules/comment/server/procedures';


export const appRouter = createTRPCRouter({  
  users: usersRouter,
  games: gamesRouter,
  teams: teamsRouter,
  season: seasonRouter,
  picks: picksRouter,
  results: resultsRouter,
  analytics: analyticsRouter,
  comment: commentRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;