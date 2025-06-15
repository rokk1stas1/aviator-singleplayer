
import { type GameStatus } from '../schema';

export const getGameStatus = async (): Promise<GameStatus> => {
  try {
    // For now, return a basic game status
    // In a real implementation, this would track actual game state
    return {
      state: 'waiting',
      current_multiplier: 1.00
    };
  } catch (error) {
    console.error('Failed to get game status:', error);
    throw error;
  }
};
