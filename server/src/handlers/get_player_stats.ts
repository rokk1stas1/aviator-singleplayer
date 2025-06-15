
import { db } from '../db';
import { playerStatsTable } from '../db/schema';
import { type PlayerStats } from '../schema';

export const getPlayerStats = async (): Promise<PlayerStats> => {
  try {
    // Get the first (and only) player stats record
    const result = await db.select()
      .from(playerStatsTable)
      .limit(1)
      .execute();

    if (result.length === 0) {
      // Create default player stats if none exist
      const newStats = await db.insert(playerStatsTable)
        .values({
          balance: '1000.00',
          total_games: 0,
          total_winnings: '0.00',
          total_losses: '0.00'
        })
        .returning()
        .execute();

      const stats = newStats[0];
      return {
        balance: parseFloat(stats.balance),
        total_games: stats.total_games,
        total_winnings: parseFloat(stats.total_winnings),
        total_losses: parseFloat(stats.total_losses)
      };
    }

    // Convert numeric fields back to numbers before returning
    const stats = result[0];
    return {
      balance: parseFloat(stats.balance),
      total_games: stats.total_games,
      total_winnings: parseFloat(stats.total_winnings),
      total_losses: parseFloat(stats.total_losses)
    };
  } catch (error) {
    console.error('Failed to get player stats:', error);
    throw error;
  }
};
