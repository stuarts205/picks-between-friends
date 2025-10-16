import { inferRouterOutputs } from "@trpc/server";
import type {AppRouter} from '@/trpc/routers/_app';

export type GameGetMany = inferRouterOutputs<AppRouter>['games']['getMany']['items'];
export type GameGetOne = inferRouterOutputs<AppRouter>['games']['getOne'];
// export enum GameStatus {
//     'STATUS_SCHEDULED' = "STATUS_SCHEDULED",
//     'STATUS_IN_PROGRESS' = "STATUS_IN_PROGRESS",
//     'STATUS_FINAL' = "STATUS_FINAL",
// }