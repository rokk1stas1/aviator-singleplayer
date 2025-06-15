
import { z } from 'zod';

// Game state schema
export const gameStateSchema = z.enum(['waiting', 'flying', 'crashed', 'cashed_out']);
export type GameState = z.infer<typeof gameStateSchema>;

// Game round schema
export const gameRoundSchema = z.object({
  id: z.number(),
  bet_amount: z.number().positive(),
  crash_point: z.number().min(1),
  cash_out_point: z.number().min(1).optional(),
  result: z.enum(['win', 'loss']),
  payout: z.number().nonnegative(),
  created_at: z.coerce.date()
});

export type GameRound = z.infer<typeof gameRoundSchema>;

// Player stats schema
export const playerStatsSchema = z.object({
  balance: z.number().nonnegative(),
  total_games: z.number().int().nonnegative(),
  total_winnings: z.number().nonnegative(),
  total_losses: z.number().nonnegative()
});

export type PlayerStats = z.infer<typeof playerStatsSchema>;

// Input schemas
export const placeBetInputSchema = z.object({
  amount: z.number().positive().max(10000) // Max bet limit
});

export type PlaceBetInput = z.infer<typeof placeBetInputSchema>;

export const cashOutInputSchema = z.object({
  game_id: z.number(),
  multiplier: z.number().min(1)
});

export type CashOutInput = z.infer<typeof cashOutInputSchema>;

// Game status response schema
export const gameStatusSchema = z.object({
  state: gameStateSchema,
  current_multiplier: z.number().min(1),
  crash_point: z.number().min(1).optional(),
  bet_amount: z.number().positive().optional(),
  game_id: z.number().optional()
});

export type GameStatus = z.infer<typeof gameStatusSchema>;
