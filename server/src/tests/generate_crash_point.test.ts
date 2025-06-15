
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { generateCrashPoint } from '../handlers/generate_crash_point';

describe('generateCrashPoint', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should generate a crash point greater than or equal to 1.00', async () => {
    const crashPoint = await generateCrashPoint();
    
    expect(crashPoint).toBeGreaterThanOrEqual(1.00);
    expect(typeof crashPoint).toBe('number');
  });

  it('should generate a crash point with 2 decimal places precision', async () => {
    const crashPoint = await generateCrashPoint();
    
    // Check that the number has at most 2 decimal places
    const decimalPlaces = (crashPoint.toString().split('.')[1] || '').length;
    expect(decimalPlaces).toBeLessThanOrEqual(2);
  });

  it('should generate crash points within reasonable bounds', async () => {
    const crashPoint = await generateCrashPoint();
    
    expect(crashPoint).toBeGreaterThanOrEqual(1.00);
    expect(crashPoint).toBeLessThanOrEqual(1000.00);
  });

  it('should generate different crash points on multiple calls', async () => {
    const crashPoints = await Promise.all([
      generateCrashPoint(),
      generateCrashPoint(),
      generateCrashPoint(),
      generateCrashPoint(),
      generateCrashPoint()
    ]);
    
    // Check that we get some variation (not all identical)
    const uniquePoints = new Set(crashPoints);
    expect(uniquePoints.size).toBeGreaterThan(1);
  });

  it('should generate mostly low multipliers following exponential distribution', async () => {
    // Generate many crash points to test distribution
    const crashPoints = await Promise.all(
      Array.from({ length: 100 }, () => generateCrashPoint())
    );
    
    // Count how many are below common thresholds
    const below2x = crashPoints.filter(point => point < 2.00).length;
    const below5x = crashPoints.filter(point => point < 5.00).length;
    const below10x = crashPoints.filter(point => point < 10.00).length;
    
    // Exponential distribution should have most values at lower end
    expect(below2x).toBeGreaterThan(30); // Should have many below 2x
    expect(below5x).toBeGreaterThan(70); // Should have most below 5x
    expect(below10x).toBeGreaterThan(85); // Should have almost all below 10x
  });

  it('should handle edge cases and produce valid numbers', async () => {
    // Test multiple generations to ensure no invalid numbers
    for (let i = 0; i < 20; i++) {
      const crashPoint = await generateCrashPoint();
      
      expect(crashPoint).not.toBeNaN();
      expect(crashPoint).not.toBe(Infinity);
      expect(crashPoint).toBeGreaterThanOrEqual(1.00);
      expect(Number.isFinite(crashPoint)).toBe(true);
    }
  });
});
