
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { gameRoundsTable } from '../db/schema';
import { type CashOutInput } from '../schema';
import { cashOut } from '../handlers/cash_out';
import { eq } from 'drizzle-orm';

describe('cashOut', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should cash out a game round successfully', async () => {
    // Create a game round first
    const gameRound = await db.insert(gameRoundsTable)
      .values({
        bet_amount: '100.00',
        crash_point: '5.00',
        result: 'loss',
        payout: '0.00'
      })
      .returning()
      .execute();

    const testInput: CashOutInput = {
      game_id: gameRound[0].id,
      multiplier: 2.5
    };

    const result = await cashOut(testInput);

    // Verify the result
    expect(result.id).toEqual(gameRound[0].id);
    expect(result.bet_amount).toEqual(100.00);
    expect(result.crash_point).toEqual(5.00);
    expect(result.cash_out_point).toEqual(2.5);
    expect(result.result).toEqual('win');
    expect(result.payout).toEqual(250.00); // 100 * 2.5
    expect(result.created_at).toBeInstanceOf(Date);
    expect(typeof result.bet_amount).toBe('number');
    expect(typeof result.payout).toBe('number');
  });

  it('should update the database correctly', async () => {
    // Create a game round first
    const gameRound = await db.insert(gameRoundsTable)
      .values({
        bet_amount: '50.00',
        crash_point: '3.00',
        result: 'loss',
        payout: '0.00'
      })
      .returning()
      .execute();

    const testInput: CashOutInput = {
      game_id: gameRound[0].id,
      multiplier: 1.8
    };

    await cashOut(testInput);

    // Verify database was updated
    const updatedRounds = await db.select()
      .from(gameRoundsTable)
      .where(eq(gameRoundsTable.id, gameRound[0].id))
      .execute();

    expect(updatedRounds).toHaveLength(1);
    const updatedRound = updatedRounds[0];
    expect(parseFloat(updatedRound.cash_out_point!)).toEqual(1.8);
    expect(updatedRound.result).toEqual('win');
    expect(parseFloat(updatedRound.payout)).toEqual(90.00); // 50 * 1.8
  });

  it('should calculate payout correctly for different multipliers', async () => {
    // Create a game round first
    const gameRound = await db.insert(gameRoundsTable)
      .values({
        bet_amount: '200.00',
        crash_point: '10.00',
        result: 'loss',
        payout: '0.00'
      })
      .returning()
      .execute();

    const testInput: CashOutInput = {
      game_id: gameRound[0].id,
      multiplier: 4.25
    };

    const result = await cashOut(testInput);

    expect(result.payout).toEqual(850.00); // 200 * 4.25
    expect(result.cash_out_point).toEqual(4.25);
  });

  it('should throw error for non-existent game', async () => {
    const testInput: CashOutInput = {
      game_id: 999,
      multiplier: 2.0
    };

    await expect(cashOut(testInput)).rejects.toThrow(/game round not found/i);
  });

  it('should handle minimum multiplier correctly', async () => {
    // Create a game round first
    const gameRound = await db.insert(gameRoundsTable)
      .values({
        bet_amount: '100.00',
        crash_point: '2.00',
        result: 'loss',
        payout: '0.00'
      })
      .returning()
      .execute();

    const testInput: CashOutInput = {
      game_id: gameRound[0].id,
      multiplier: 1.0
    };

    const result = await cashOut(testInput);

    expect(result.payout).toEqual(100.00); // 100 * 1.0
    expect(result.cash_out_point).toEqual(1.0);
    expect(result.result).toEqual('win');
  });
});
