
/**
 * Generates a crash point for the crash game using exponential distribution
 * Lower multipliers are more likely than higher ones, making the game challenging
 * but fair. Minimum crash point is 1.00x, with most crashes occurring below 5x.
 */
export const generateCrashPoint = async (): Promise<number> => {
  // Use exponential distribution for realistic crash point generation
  // Lower multipliers should be more common than higher ones
  const lambda = 0.8; // Controls the distribution shape
  const random = Math.random();
  
  // Generate exponential random value
  // Using 1 - random to avoid log(0)
  const exponentialValue = -Math.log(1 - random) / lambda;
  
  // Transform to get crash point starting from 1.00x
  // Add 1 to ensure minimum crash point is 1.00x
  const crashPoint = 1 + exponentialValue;
  
  // Cap the maximum crash point at 1000x for practical reasons
  const maxCrashPoint = 1000;
  const finalCrashPoint = Math.min(crashPoint, maxCrashPoint);
  
  // Round to 2 decimal places to match the database precision
  return Math.round(finalCrashPoint * 100) / 100;
};
