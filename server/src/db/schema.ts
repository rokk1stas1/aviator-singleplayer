
import { serial, text, pgTable, timestamp, numeric, integer } from 'drizzle-orm/pg-core';

export const gameRoundsTable = pgTable('game_rounds', {
  id: serial('id').primaryKey(),
  bet_amount: numeric('bet_amount', { precision: 10, scale: 2 }).notNull(),
  crash_point: numeric('crash_point', { precision: 6, scale: 2 }).notNull(),
  cash_out_point: numeric('cash_out_point', { precision: 6, scale: 2 }),
  result: text('result', { enum: ['win', 'loss'] }).notNull(),
  payout: numeric('payout', { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const playerStatsTable = pgTable('player_stats', {
  id: serial('id').primaryKey(),
  balance: numeric('balance', { precision: 12, scale: 2 }).notNull().default('1000.00'),
  total_games: integer('total_games').notNull().default(0),
  total_winnings: numeric('total_winnings', { precision: 12, scale: 2 }).notNull().default('0.00'),
  total_losses: numeric('total_losses', { precision: 12, scale: 2 }).notNull().default('0.00'),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript types for the table schemas
export type GameRound = typeof gameRoundsTable.$inferSelect;
export type NewGameRound = typeof gameRoundsTable.$inferInsert;
export type PlayerStats = typeof playerStatsTable.$inferSelect;
export type NewPlayerStats = typeof playerStatsTable.$inferInsert;

// Export all tables for proper query building
export const tables = { 
  gameRounds: gameRoundsTable,
  playerStats: playerStatsTable
};
