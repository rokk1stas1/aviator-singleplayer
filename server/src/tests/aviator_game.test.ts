
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { getAviatorGameHTML } from '../handlers/aviator_game';

describe('getAviatorGameHTML', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return HTML string', async () => {
    const result = await getAviatorGameHTML();
    
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return valid HTML document', async () => {
    const result = await getAviatorGameHTML();
    
    // Check for basic HTML structure
    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('<html lang="en">');
    expect(result).toContain('<head>');
    expect(result).toContain('<body>');
    expect(result).toContain('</html>');
  });

  it('should contain game title and elements', async () => {
    const result = await getAviatorGameHTML();
    
    // Check for game-specific content
    expect(result).toContain('AVIATOR');
    expect(result).toContain('✈️');
    expect(result).toContain('multiplier');
    expect(result).toContain('Place Bet');
    expect(result).toContain('Cash Out');
  });

  it('should include necessary CSS styles', async () => {
    const result = await getAviatorGameHTML();
    
    // Check for CSS styling
    expect(result).toContain('<style>');
    expect(result).toContain('.game-container');
    expect(result).toContain('.multiplier-display');
    expect(result).toContain('.controls');
    expect(result).toContain('</style>');
  });

  it('should include JavaScript functionality', async () => {
    const result = await getAviatorGameHTML();
    
    // Check for JavaScript code
    expect(result).toContain('<script>');
    expect(result).toContain('function placeBet()');
    expect(result).toContain('function cashOut()');
    expect(result).toContain('function startGame()');
    expect(result).toContain('</script>');
  });

  it('should include form inputs and controls', async () => {
    const result = await getAviatorGameHTML();
    
    // Check for game controls
    expect(result).toContain('input type="number"');
    expect(result).toContain('id="betAmount"');
    expect(result).toContain('id="autoCashOut"');
    expect(result).toContain('id="betBtn"');
    expect(result).toContain('id="cashoutBtn"');
  });

  it('should include game history section', async () => {
    const result = await getAviatorGameHTML();
    
    // Check for game history
    expect(result).toContain('Recent Games');
    expect(result).toContain('id="gameHistory"');
    expect(result).toContain('.game-history');
  });

  it('should include balance display', async () => {
    const result = await getAviatorGameHTML();
    
    // Check for balance display
    expect(result).toContain('Balance:');
    expect(result).toContain('id="balance"');
    expect(result).toContain('1000.00');
  });
});
