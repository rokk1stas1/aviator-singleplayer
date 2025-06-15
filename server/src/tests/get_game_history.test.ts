
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { gameRoundsTable } from '../db/schema';
import { getGameHistory } from '../handlers/get_game_history';

// Test data for game rounds
const testRounds = [
  {
    bet_amount: '100.00',
    crash_point: '2.50',
    cash_out_point: '2.00',
    result: 'win' as const,
    payout: '200.00'
  },
  {
    bet_amount: '50.00',
    crash_point: '1.20',
    cash_out_point: null,
    result: 'loss' as const,
    payout: '0.00'
  },
  {
    bet_amount: '75.00',
    crash_point: '3.00',
    cash_out_point: '2.75',
    result: 'win' as const,
    payout: '206.25'
  }
];

describe('getGameHistory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no game history exists', async () => {
    const result = await getGameHistory();
    
    expect(result).toEqual([]);
  });

  it('should return game history with correct data types', async () => {
    // Insert test data
    await db.insert(gameRoundsTable)
      .values(testRounds)
      .execute();

    const result = await getGameHistory();

    expect(result).toHaveLength(3);
    
    // Check first round
    const firstRound = result[0];
    expect(typeof firstRound.bet_amount).toBe('number');
    expect(typeof firstRound.crash_point).toBe('number');
    expect(typeof firstRound.payout).toBe('number');
    expect(firstRound.cash_out_point).toBeDefined();
    expect(typeof firstRound.cash_out_point).toBe('number');
    expect(firstRound.created_at).toBeInstanceOf(Date);
    expect(firstRound.id).toBeDefined();
    expect(['win', 'loss']).toContain(firstRound.result);
  });

  it('should handle null cash_out_point correctly', async () => {
    // Insert test data
    await db.insert(gameRoundsTable)
      .values(testRounds)
      .execute();

    const result = await getGameHistory();
    
    // Find the round with null cash_out_point
    const lossRound = result.find(round => round.result === 'loss');
    expect(lossRound).toBeDefined();
    expect(lossRound!.cash_out_point).toBeUndefined();
    expect(lossRound!.bet_amount).toBe(50);
    expect(lossRound!.crash_point).toBe(1.2);
    expect(lossRound!.payout).toBe(0);
  });

  it('should return results ordered by most recent first', async () => {
    // Insert test data with slight delay to ensure different timestamps
    await db.insert(gameRoundsTable)
      .values([testRounds[0]])
      .execute();
    
    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await db.insert(gameRoundsTable)
      .values([testRounds[1]])
      .execute();

    const result = await getGameHistory();

    expect(result).toHaveLength(2);
    // Most recent should be first (loss round which was inserted second)
    expect(result[0].result).toBe('loss');
    expect(result[1].result).toBe('win');
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should respect the limit parameter', async () => {
    // Insert test data
    await db.insert(gameRoundsTable)
      .values(testRounds)
      .execute();

    const result = await getGameHistory(2);

    expect(result).toHaveLength(2);
  });

  it('should use default limit when no limit provided', async () => {
    // Create more than 50 records to test default limit
    const manyRounds = Array.from({ length: 60 }, (_, i) => ({
      bet_amount: '10.00',
      crash_point: '2.00',
      cash_out_point: '1.50',
      result: 'win' as const,
      payout: '15.00'
    }));

    await db.insert(gameRoundsTable)
      .values(manyRounds)
      .execute();

    const result = await getGameHistory();

    expect(result).toHaveLength(50); // Default limit
  });
});
