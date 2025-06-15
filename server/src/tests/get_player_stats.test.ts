
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { playerStatsTable } from '../db/schema';
import { getPlayerStats } from '../handlers/get_player_stats';

describe('getPlayerStats', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create default stats when none exist', async () => {
    const result = await getPlayerStats();

    // Verify default values
    expect(result.balance).toEqual(1000);
    expect(result.total_games).toEqual(0);
    expect(result.total_winnings).toEqual(0);
    expect(result.total_losses).toEqual(0);

    // Verify types are correct
    expect(typeof result.balance).toBe('number');
    expect(typeof result.total_games).toBe('number');
    expect(typeof result.total_winnings).toBe('number');
    expect(typeof result.total_losses).toBe('number');
  });

  it('should return existing stats when record exists', async () => {
    // Create test stats record
    await db.insert(playerStatsTable)
      .values({
        balance: '2500.50',
        total_games: 15,
        total_winnings: '1200.75',
        total_losses: '700.25'
      })
      .execute();

    const result = await getPlayerStats();

    // Verify values match what was inserted
    expect(result.balance).toEqual(2500.50);
    expect(result.total_games).toEqual(15);
    expect(result.total_winnings).toEqual(1200.75);
    expect(result.total_losses).toEqual(700.25);

    // Verify numeric conversions worked correctly
    expect(typeof result.balance).toBe('number');
    expect(typeof result.total_winnings).toBe('number');
    expect(typeof result.total_losses).toBe('number');
  });

  it('should save default stats to database when created', async () => {
    await getPlayerStats();

    // Query database directly to verify record was created
    const records = await db.select()
      .from(playerStatsTable)
      .execute();

    expect(records).toHaveLength(1);
    expect(parseFloat(records[0].balance)).toEqual(1000);
    expect(records[0].total_games).toEqual(0);
    expect(parseFloat(records[0].total_winnings)).toEqual(0);
    expect(parseFloat(records[0].total_losses)).toEqual(0);
    expect(records[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle decimal values correctly', async () => {
    // Insert stats with precise decimal values
    await db.insert(playerStatsTable)
      .values({
        balance: '999.99',
        total_games: 42,
        total_winnings: '1234.56',
        total_losses: '567.89'
      })
      .execute();

    const result = await getPlayerStats();

    // Verify decimal precision is maintained
    expect(result.balance).toEqual(999.99);
    expect(result.total_winnings).toEqual(1234.56);
    expect(result.total_losses).toEqual(567.89);
    expect(result.total_games).toEqual(42);
  });
});
