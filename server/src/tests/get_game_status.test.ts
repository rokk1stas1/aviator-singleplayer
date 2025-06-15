
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { getGameStatus } from '../handlers/get_game_status';

describe('getGameStatus', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return game status', async () => {
    const result = await getGameStatus();

    expect(result.state).toBeDefined();
    expect(['waiting', 'flying', 'crashed', 'cashed_out']).toContain(result.state);
    expect(result.current_multiplier).toBeDefined();
    expect(typeof result.current_multiplier).toBe('number');
    expect(result.current_multiplier).toBeGreaterThanOrEqual(1);
  });

  it('should return valid game state', async () => {
    const result = await getGameStatus();

    expect(result.state).toEqual('waiting');
    expect(result.current_multiplier).toEqual(1.00);
  });

  it('should handle optional fields correctly', async () => {
    const result = await getGameStatus();

    // Optional fields should be undefined when not set
    expect(result.crash_point).toBeUndefined();
    expect(result.bet_amount).toBeUndefined();
    expect(result.game_id).toBeUndefined();
  });
});
