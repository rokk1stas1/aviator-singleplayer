
import { db } from '../db';
import { gameRoundsTable } from '../db/schema';
import { type GameRound } from '../schema';
import { desc } from 'drizzle-orm';

export const getGameHistory = async (limit: number = 50): Promise<GameRound[]> => {
  try {
    // Build query with limit and ordering by most recent first
    let query = db.select()
      .from(gameRoundsTable)
      .orderBy(desc(gameRoundsTable.created_at))
      .limit(limit);

    const results = await query.execute();

    // Convert numeric fields from strings to numbers
    return results.map(round => ({
      ...round,
      bet_amount: parseFloat(round.bet_amount),
      crash_point: parseFloat(round.crash_point),
      cash_out_point: round.cash_out_point ? parseFloat(round.cash_out_point) : undefined,
      payout: parseFloat(round.payout)
    }));
  } catch (error) {
    console.error('Get game history failed:', error);
    throw error;
  }
};
