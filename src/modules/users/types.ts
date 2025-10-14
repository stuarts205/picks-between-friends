import { inferRouterOutputs } from "@trpc/server";
import type {AppRouter} from '@/trpc/routers/_app';

export type UserGetMany = inferRouterOutputs<AppRouter>['users']['getMany']['items'];
export type UserGetOne = inferRouterOutputs<AppRouter>['users']['getOne'];