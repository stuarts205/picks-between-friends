import { inferRouterOutputs } from "@trpc/server";
import type {AppRouter} from '@/trpc/routers/_app';

export type GameGetMany = inferRouterOutputs<AppRouter>['games']['getMany']['items'];
export type GameGetOne = inferRouterOutputs<AppRouter>['games']['getOne'];