
import { type GameRound } from '../schema';

export declare function getGameHistory(limit?: number): Promise<GameRound[]>;
