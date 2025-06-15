
import { db } from '../db';
import { gameRoundsTable } from '../db/schema';
import { type CashOutInput, type GameRound } from '../schema';
import { eq } from 'drizzle-orm';

export const cashOut = async (input: CashOutInput): Promise<GameRound> => {
  try {
    // First, get the existing game round to calculate payout
    const existingRounds = await db.select()
      .from(gameRoundsTable)
      .where(eq(gameRoundsTable.id, input.game_id))
      .execute();

    if (existingRounds.length === 0) {
      throw new Error('Game round not found');
    }

    const existingRound = existingRounds[0];
    const betAmount = parseFloat(existingRound.bet_amount);
    const payout = betAmount * input.multiplier;

    // Update the game round with cash out information
    const result = await db.update(gameRoundsTable)
      .set({
        cash_out_point: input.multiplier.toString(),
        result: 'win',
        payout: payout.toString()
      })
      .where(eq(gameRoundsTable.id, input.game_id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error('Failed to update game round');
    }

    // Convert numeric fields back to numbers before returning
    const updatedRound = result[0];
    return {
      ...updatedRound,
      bet_amount: parseFloat(updatedRound.bet_amount),
      crash_point: parseFloat(updatedRound.crash_point),
      cash_out_point: updatedRound.cash_out_point ? parseFloat(updatedRound.cash_out_point) : undefined,
      payout: parseFloat(updatedRound.payout)
    };
  } catch (error) {
    console.error('Cash out failed:', error);
    throw error;
  }
};
