import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { use } from "react";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  week: integer("week"),
  weeklyPoints: integer("weekly_points"),
  overAllPoints: integer("overall_points"),
  role: integer("role"), // 0 = user, 1 = admin
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
});

export const team = pgTable("team", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nickname: text("nickname").notNull(),
  abbreviation: text("abbreviation"),
  conference: text("conference"),
  logo: text("logo"),
});

export const game = pgTable("game", {
  id: text("id").primaryKey(),
  gameid: text("gameid"),
  week: integer("week").notNull(),
  home: text("home").notNull(),
  away: text("away").notNull(),
  spread: text("spread").notNull(),
  league: text("league").notNull(),
  homeId: text("home_id")
    .notNull()
    .references(() => team.id),
  awayId: text("away_id")
    .notNull()
    .references(() => team.id),
  favorite: text("favorite").notNull(),
  selected: boolean("selected"),
  winner: text("winner"),
  favoriteWin: boolean("favorite_win"),
});

export const season = pgTable("season", {
  id: text("id").primaryKey(),
  year: integer("year").notNull(),
  week: integer("week").notNull(),
  startDate: text("start_date").notNull(),
});

export const pick = pgTable("pick", {
  id: text("id").primaryKey(),
  teamId: text("team_id")
    .notNull()
    .references(() => team.id),
  gameId: text("game_id")
    .notNull()
    .references(() => game.id),
  win: boolean("win"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  userName: text("user_name"),
  week: integer("week").notNull(),
});
