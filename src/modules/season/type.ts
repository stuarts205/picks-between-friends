import { inferRouterOutputs } from "@trpc/server";
import type {AppRouter} from '@/trpc/routers/_app';

export type SeasonGetOne = inferRouterOutputs<AppRouter>['season']['getOne'];