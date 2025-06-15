
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { playerStatsTable } from '../db/schema';
import { type PlaceBetInput } from '../schema';
import { placeBet } from '../handlers/place_bet';

const testInput: PlaceBetInput = {
  amount: 10.50
};

describe('placeBet', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should place a bet successfully', async () => {
    const result = await placeBet(testInput);

    expect(result.state).toEqual('flying');
    expect(result.current_multiplier).toEqual(1.0);
    expect(result.bet_amount).toEqual(10.50);
    expect(result.crash_point).toBeDefined();
    expect(result.crash_point).toBeGreaterThanOrEqual(1.0);
    expect(result.crash_point).toBeLessThanOrEqual(10.0);
    expect(result.game_id).toBeDefined();
    expect(typeof result.crash_point).toBe('number');
  });

  it('should create player stats if none exist', async () => {
    await placeBet(testInput);

    const playerStats = await db.select()
      .from(playerStatsTable)
      .execute();

    expect(playerStats).toHaveLength(1);
    expect(parseFloat(playerStats[0].balance)).toEqual(1000.00 - 10.50);
    expect(playerStats[0].total_games).toEqual(0);
    expect(parseFloat(playerStats[0].total_winnings)).toEqual(0);
    expect(parseFloat(playerStats[0].total_losses)).toEqual(0);
  });

  it('should deduct bet amount from existing balance', async () => {
    // Create initial player stats
    await db.insert(playerStatsTable)
      .values({
        balance: '500.00',
        total_games: 5,
        total_winnings: '100.00',
        total_losses: '50.00'
      })
      .execute();

    await placeBet(testInput);

    const playerStats = await db.select()
      .from(playerStatsTable)
      .execute();

    expect(playerStats).toHaveLength(1);
    expect(parseFloat(playerStats[0].balance)).toEqual(500.00 - 10.50);
    expect(playerStats[0].total_games).toEqual(5); // Should remain unchanged
  });

  it('should throw error when insufficient balance', async () => {
    // Create player with low balance
    await db.insert(playerStatsTable)
      .values({
        balance: '5.00'
      })
      .execute();

    await expect(placeBet(testInput)).rejects.toThrow(/insufficient balance/i);
  });

  it('should update player stats timestamp', async () => {
    const beforeTime = new Date();
    
    await placeBet(testInput);

    const playerStats = await db.select()
      .from(playerStatsTable)
      .execute();

    expect(playerStats[0].updated_at).toBeInstanceOf(Date);
    expect(playerStats[0].updated_at.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
  });

  it('should handle maximum bet amount', async () => {
    const maxBetInput: PlaceBetInput = {
      amount: 10000
    };

    // Create player with sufficient balance
    await db.insert(playerStatsTable)
      .values({
        balance: '15000.00'
      })
      .execute();

    const result = await placeBet(maxBetInput);

    expect(result.state).toEqual('flying');
    expect(result.bet_amount).toEqual(10000);

    const playerStats = await db.select()
      .from(playerStatsTable)
      .execute();

    expect(parseFloat(playerStats[0].balance)).toEqual(15000 - 10000);
  });
});
