
import { db } from '../db';
import { playerStatsTable } from '../db/schema';
import { type PlaceBetInput, type GameStatus } from '../schema';
import { eq } from 'drizzle-orm';

export const placeBet = async (input: PlaceBetInput): Promise<GameStatus> => {
  try {
    // Get or create player stats (assuming single player for now)
    let playerStats = await db.select()
      .from(playerStatsTable)
      .limit(1)
      .execute();

    if (playerStats.length === 0) {
      // Create initial player stats with default balance
      const newStats = await db.insert(playerStatsTable)
        .values({})
        .returning()
        .execute();
      playerStats = newStats;
    }

    const currentStats = playerStats[0];
    const currentBalance = parseFloat(currentStats.balance);

    // Check if player has sufficient balance
    if (currentBalance < input.amount) {
      throw new Error('Insufficient balance');
    }

    // Deduct bet amount from balance
    const newBalance = currentBalance - input.amount;

    await db.update(playerStatsTable)
      .set({ 
        balance: newBalance.toString(),
        updated_at: new Date()
      })
      .where(eq(playerStatsTable.id, currentStats.id))
      .execute();

    // Generate random crash point between 1.00 and 10.00
    const crashPoint = Math.random() * 9 + 1;

    // Return game status with flying state
    return {
      state: 'flying',
      current_multiplier: 1.0,
      crash_point: parseFloat(crashPoint.toFixed(2)),
      bet_amount: input.amount,
      game_id: Date.now() // Simple game ID for now
    };
  } catch (error) {
    console.error('Place bet failed:', error);
    throw error;
  }
};
