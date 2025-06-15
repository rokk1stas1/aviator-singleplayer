
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Local types to avoid any import issues
interface GameStatus {
  state: 'waiting' | 'flying' | 'crashed' | 'cashed_out';
  current_multiplier: number;
  crash_point?: number;
  bet_amount?: number;
  game_id?: number;
}

interface PlayerStats {
  balance: number;
  total_games: number;
  total_winnings: number;
  total_losses: number;
}

interface GameRound {
  id: number;
  bet_amount: number;
  crash_point: number;
  cash_out_point?: number;
  result: 'win' | 'loss';
  payout: number;
  created_at: Date;
}

const App: React.FC = () => {
  // Game state
  const [gameStatus, setGameStatus] = useState<GameStatus>({
    state: 'waiting',
    current_multiplier: 1.0
  });
  
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    balance: 1000,
    total_games: 0,
    total_winnings: 0,
    total_losses: 0
  });
  
  const [gameHistory, setGameHistory] = useState<GameRound[]>([]);
  const [betAmount, setBetAmount] = useState<string>('10');
  const [isLoading, setIsLoading] = useState(false);
  const [showCrash, setShowCrash] = useState(false);
  
  // Animation refs
  const animationRef = useRef<number | null>(null);
  const gameStartTime = useRef<number | null>(null);
  const planePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle crash
  const handleCrash = useCallback(() => {
    setGameStatus(prev => ({ ...prev, state: 'crashed' }));
    setShowCrash(true);
    
    setTimeout(() => {
      setShowCrash(false);
      setGameStatus(prev => ({ ...prev, state: 'waiting' }));
      planePosition.current = { x: 0, y: 0 };
    }, 2000);
    
    if (gameStatus.bet_amount) {
      setPlayerStats(prev => ({
        ...prev,
        balance: prev.balance - gameStatus.bet_amount!,
        total_games: prev.total_games + 1,
        total_losses: prev.total_losses + gameStatus.bet_amount!
      }));
      
      const newRound: GameRound = {
        id: Date.now(),
        bet_amount: gameStatus.bet_amount,
        crash_point: gameStatus.crash_point!,
        result: 'loss',
        payout: 0,
        created_at: new Date()
      };
      setGameHistory(prev => [newRound, ...prev.slice(0, 9)]);
    }
  }, [gameStatus.bet_amount, gameStatus.crash_point]);

  // Game animation loop
  const animateGame = useCallback(() => {
    if (gameStatus.state !== 'flying' || !gameStartTime.current) return;
    
    const currentTime = Date.now();
    const elapsed = (currentTime - gameStartTime.current) / 1000;
    
    // Calculate multiplier
    const newMultiplier = Math.max(1.0, 1.0 + elapsed * 0.1);
    
    // Update plane position
    const progress = Math.min(elapsed / 10, 1);
    planePosition.current = {
      x: progress * 80,
      y: 20 + Math.sin(progress * Math.PI * 2) * 10
    };
    
    setGameStatus(prev => ({
      ...prev,
      current_multiplier: newMultiplier
    }));
    
    // Check crash
    if (gameStatus.crash_point && newMultiplier >= gameStatus.crash_point) {
      handleCrash();
      return;
    }
    
    animationRef.current = requestAnimationFrame(animateGame);
  }, [gameStatus.state, gameStatus.crash_point, handleCrash]);

  useEffect(() => {
    if (gameStatus.state === 'flying') {
      animationRef.current = requestAnimationFrame(animateGame);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameStatus.state, animateGame]);

  const startGame = () => {
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0 || amount > playerStats.balance) {
      alert('Invalid bet amount');
      return;
    }
    
    setIsLoading(true);
    
    // Generate crash point
    const random = Math.random();
    let crashPoint: number;
    
    if (random < 0.5) {
      crashPoint = 1.0 + Math.random() * 0.5;
    } else if (random < 0.8) {
      crashPoint = 1.5 + Math.random() * 0.5;
    } else if (random < 0.95) {
      crashPoint = 2.0 + Math.random() * 3.0;
    } else {
      crashPoint = 5.0 + Math.random() * 5.0;
    }
    
    gameStartTime.current = Date.now();
    planePosition.current = { x: 0, y: 0 };
    
    setGameStatus({
      state: 'flying',
      current_multiplier: 1.0,
      crash_point: crashPoint,
      bet_amount: amount,
      game_id: Date.now()
    });
    
    setIsLoading(false);
  };

  const cashOut = () => {
    if (gameStatus.state !== 'flying' || !gameStatus.game_id || !gameStatus.bet_amount) return;
    
    const payout = gameStatus.bet_amount * gameStatus.current_multiplier;
    
    setGameStatus(prev => ({ ...prev, state: 'cashed_out' }));
    
    setPlayerStats(prev => ({
      ...prev,
      balance: prev.balance - gameStatus.bet_amount! + payout,
      total_games: prev.total_games + 1,
      total_winnings: prev.total_winnings + payout
    }));
    
    const newRound: GameRound = {
      id: Date.now(),
      bet_amount: gameStatus.bet_amount,
      crash_point: gameStatus.crash_point!,
      cash_out_point: gameStatus.current_multiplier,
      result: 'win',
      payout: payout,
      created_at: new Date()
    };
    setGameHistory(prev => [newRound, ...prev.slice(0, 9)]);
    
    setTimeout(() => {
      setGameStatus(prev => ({ ...prev, state: 'waiting' }));
      planePosition.current = { x: 0, y: 0 };
    }, 2000);
  };

  const getStateColor = () => {
    switch (gameStatus.state) {
      case 'flying': return 'text-green-500';
      case 'crashed': return 'text-red-500';
      case 'cashed_out': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getStateText = () => {
    switch (gameStatus.state) {
      case 'flying': return 'Flying! 🚀';
      case 'crashed': return 'Crashed! 💥';
      case 'cashed_out': return 'Cashed Out! ✅';
      default: return 'Ready to Play';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">✈️ Aviator Crash Game</h1>
          <p className="text-blue-200">Cash out before the plane crashes!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-black/20 border-blue-500/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="relative h-64 bg-gradient-to-t from-blue-800/30 to-transparent rounded-lg overflow-hidden mb-4">
                  <div className="absolute inset-0 bg-gradient-to-b from-sky-300/10 to-blue-600/10"></div>
                  
                  <div className="absolute top-4 left-10 text-white/20 text-2xl">☁️</div>
                  <div className="absolute top-8 right-20 text-white/20 text-xl">☁️</div>
                  <div className="absolute top-16 left-1/3 text-white/20 text-lg">☁️</div>
                  
                  <div 
                    className={`absolute transition-all duration-100 text-3xl ${showCrash ? 'animate-bounce' : ''}`}
                    style={{
                      left: `${planePosition.current.x}%`,
                      top: `${planePosition.current.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    {showCrash ? '💥' : '✈️'}
                  </div>
                  
                  {gameStatus.state === 'flying' && (
                    <div 
                      className="absolute h-1 bg-gradient-to-r from-transparent to-blue-400/50 rounded"
                      style={{
                        width: `${planePosition.current.x}%`,
                        top: `${planePosition.current.y + 2}%`,
                        left: '0%'
                      }}
                    ></div>
                  )}
                </div>

                <div className="text-center mb-6">
                  <div className={`text-6xl font-bold mb-2 ${getStateColor()}`}>
                    {gameStatus.current_multiplier.toFixed(2)}x
                  </div>
                  <div className={`text-lg ${getStateColor()}`}>
                    {getStateText()}
                  </div>
                  {gameStatus.state === 'flying' && gameStatus.bet_amount && (
                    <div className="text-sm text-blue-300 mt-2">
                      Potential Win: ${(gameStatus.bet_amount * gameStatus.current_multiplier).toFixed(2)}
                    </div>
                  )}
                </div>

                <div className="flex justify-center gap-4">
                  {gameStatus.state === 'waiting' && (
                    <>
                      <Input
                        type="number"
                        placeholder="Bet amount"
                        value={betAmount}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBetAmount(e.target.value)}
                        className="w-32 bg-white/10 border-white/20 text-white placeholder-white/50"
                        min="1"
                        max={playerStats.balance}
                        step="1"
                      />
                      <Button 
                        onClick={startGame}
                        disabled={isLoading || parseFloat(betAmount) > playerStats.balance || parseFloat(betAmount) <= 0}
                        className="bg-green-600 hover:bg-green-700 text-white px-8"
                      >
                        {isLoading ? 'Starting...' : '🚀 Start Flight'}
                      </Button>
                    </>
                  )}
                  
                  {gameStatus.state === 'flying' && (
                    <Button 
                      onClick={cashOut}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 animate-pulse"
                      size="lg"
                    >
                      💰 Cash Out
                    </Button>
                  )}
                  
                  {(gameStatus.state === 'crashed' || gameStatus.state === 'cashed_out') && (
                    <div className="text-center">
                      <div className="text-lg mb-2">
                        {gameStatus.state === 'crashed' ? (
                          <span className="text-red-400">You Lost ${gameStatus.bet_amount?.toFixed(2)}</span>
                        ) : (
                          <span className="text-green-400">
                            You Won ${((gameStatus.bet_amount || 0) * gameStatus.current_multiplier).toFixed(2)}!
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-300">
                        Crash Point: {gameStatus.crash_point?.toFixed(2)}x
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-black/20 border-blue-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-blue-300">💰 Player Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Balance:</span>
                  <span className="font-bold text-green-400">${playerStats.balance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Games:</span>
                  <span>{playerStats.total_games}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Winnings:</span>
                  <span className="text-green-400">${playerStats.total_winnings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Losses:</span>
                  <span className="text-red-400">${playerStats.total_losses.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Profit:</span>
                  <span className={playerStats.balance >= 1000 ? 'text-green-400' : 'text-red-400'}>
                    ${(playerStats.balance - 1000).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 border-blue-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-blue-300">📊 Recent Games</CardTitle>
              </CardHeader>
              <CardContent>
                {gameHistory.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No games played yet</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {gameHistory.map((round: GameRound) => (
                      <div key={round.id} className="flex justify-between items-center p-2 bg-white/5 rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant={round.result === 'win' ? 'default' : 'destructive'}>
                            {round.result === 'win' ? '✅' : '❌'}
                          </Badge>
                          <span className="text-sm">${round.bet_amount.toFixed(2)}</span>
                        </div>
                        <div className="text-right text-sm">
                          {round.result === 'win' ? (
                            <>
                              <div className="text-green-400">+${round.payout.toFixed(2)}</div>
                              <div className="text-xs text-gray-400">
                                {round.cash_out_point?.toFixed(2)}x
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-red-400">-${round.bet_amount.toFixed(2)}</div>
                              <div className="text-xs text-gray-400">
                                💥{round.crash_point.toFixed(2)}x
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-6 bg-black/20 border-blue-500/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="text-center text-sm text-blue-200">
              <h3 className="font-semibold mb-2">🎮 How to Play</h3>
              <p>
                1. Enter your bet amount 💰 | 
                2. Click "Start Flight" to launch the plane ✈️ | 
                3. Watch the multiplier increase 📈 | 
                4. Click "Cash Out" before the plane crashes 💥 | 
                5. Win = Bet × Multiplier 🎉
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default App;
