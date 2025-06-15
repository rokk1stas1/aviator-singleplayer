
export const getAviatorGameHTML = async (): Promise<string> => {
  try {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aviator Game</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
        }
        
        .game-container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
            border: 1px solid rgba(255, 255, 255, 0.18);
            text-align: center;
            max-width: 600px;
            width: 90%;
        }
        
        .game-title {
            font-size: 3rem;
            font-weight: bold;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .multiplier-display {
            font-size: 4rem;
            font-weight: bold;
            margin: 30px 0;
            color: #00ff88;
            text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
        }
        
        .game-status {
            font-size: 1.5rem;
            margin: 20px 0;
            padding: 10px;
            border-radius: 10px;
            background: rgba(0, 0, 0, 0.2);
        }
        
        .controls {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin: 30px 0;
            flex-wrap: wrap;
        }
        
        .control-group {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
        
        input[type="number"] {
            padding: 10px;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            text-align: center;
            background: rgba(255, 255, 255, 0.9);
            color: #333;
            width: 120px;
        }
        
        button {
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            min-width: 120px;
        }
        
        .bet-btn {
            background: linear-gradient(45deg, #ff6b6b, #ee5a24);
            color: white;
        }
        
        .bet-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
        }
        
        .bet-btn:disabled {
            background: #666;
            cursor: not-allowed;
            transform: none;
        }
        
        .cashout-btn {
            background: linear-gradient(45deg, #00d2ff, #3a7bd5);
            color: white;
        }
        
        .cashout-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 210, 255, 0.4);
        }
        
        .cashout-btn:disabled {
            background: #666;
            cursor: not-allowed;
            transform: none;
        }
        
        .balance-display {
            font-size: 1.2rem;
            margin: 20px 0;
            padding: 15px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
        }
        
        .game-history {
            margin-top: 30px;
            text-align: left;
        }
        
        .history-item {
            padding: 10px;
            margin: 5px 0;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 5px;
            display: flex;
            justify-content: space-between;
        }
        
        .win {
            border-left: 4px solid #00ff88;
        }
        
        .loss {
            border-left: 4px solid #ff4757;
        }
        
        .airplane {
            font-size: 2rem;
            margin: 20px 0;
            transition: transform 0.3s ease;
        }
        
        .flying {
            animation: fly 2s ease-in-out infinite;
        }
        
        @keyframes fly {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(5deg); }
        }
        
        .crashed {
            animation: crash 0.5s ease-out;
        }
        
        @keyframes crash {
            0% { transform: scale(1) rotate(0deg); }
            100% { transform: scale(0.8) rotate(180deg); }
        }
    </style>
</head>
<body>
    <div class="game-container">
        <h1 class="game-title">✈️ AVIATOR</h1>
        
        <div class="airplane" id="airplane">✈️</div>
        
        <div class="multiplier-display" id="multiplier">1.00x</div>
        
        <div class="game-status" id="gameStatus">Ready to fly!</div>
        
        <div class="balance-display">
            Balance: $<span id="balance">1000.00</span>
        </div>
        
        <div class="controls">
            <div class="control-group">
                <label>Bet Amount:</label>
                <input type="number" id="betAmount" min="1" max="1000" value="10" step="1">
                <button class="bet-btn" id="betBtn" onclick="placeBet()">Place Bet</button>
            </div>
            
            <div class="control-group">
                <label>Auto Cash Out:</label>
                <input type="number" id="autoCashOut" min="1.01" max="100" value="2.00" step="0.01">
                <button class="cashout-btn" id="cashoutBtn" onclick="cashOut()" disabled>Cash Out</button>
            </div>
        </div>
        
        <div class="game-history">
            <h3>Recent Games:</h3>
            <div id="gameHistory"></div>
        </div>
    </div>

    <script>
        let gameState = 'waiting';
        let currentMultiplier = 1.00;
        let crashPoint = 0;
        let betAmount = 0;
        let gameId = null;
        let balance = 1000.00;
        let gameInterval = null;
        let gameHistory = [];
        
        // DOM elements
        const multiplierEl = document.getElementById('multiplier');
        const gameStatusEl = document.getElementById('gameStatus');
        const balanceEl = document.getElementById('balance');
        const betBtn = document.getElementById('betBtn');
        const cashoutBtn = document.getElementById('cashoutBtn');
        const betAmountInput = document.getElementById('betAmount');
        const autoCashOutInput = document.getElementById('autoCashOut');
        const airplaneEl = document.getElementById('airplane');
        const gameHistoryEl = document.getElementById('gameHistory');
        
        function updateDisplay() {
            multiplierEl.textContent = currentMultiplier.toFixed(2) + 'x';
            balanceEl.textContent = balance.toFixed(2);
            
            switch(gameState) {
                case 'waiting':
                    gameStatusEl.textContent = 'Ready to fly!';
                    betBtn.disabled = false;
                    cashoutBtn.disabled = true;
                    airplaneEl.className = '';
                    break;
                case 'flying':
                    gameStatusEl.textContent = 'Flying... Cash out before it crashes!';
                    betBtn.disabled = true;
                    cashoutBtn.disabled = betAmount === 0;
                    airplaneEl.className = 'flying';
                    break;
                case 'crashed':
                    gameStatusEl.textContent = \`Crashed at \${crashPoint.toFixed(2)}x!\`;
                    betBtn.disabled = false;
                    cashoutBtn.disabled = true;
                    airplaneEl.className = 'crashed';
                    break;
                case 'cashed_out':
                    gameStatusEl.textContent = 'Successfully cashed out!';
                    betBtn.disabled = false;
                    cashoutBtn.disabled = true;
                    airplaneEl.className = '';
                    break;
            }
        }
        
        function placeBet() {
            const amount = parseFloat(betAmountInput.value);
            if (amount <= 0 || amount > balance) {
                alert('Invalid bet amount!');
                return;
            }
            
            betAmount = amount;
            balance -= amount;
            gameId = Date.now(); // Simple game ID
            
            startGame();
        }
        
        function startGame() {
            gameState = 'flying';
            currentMultiplier = 1.00;
            crashPoint = generateCrashPoint();
            
            gameInterval = setInterval(() => {
                if (currentMultiplier >= crashPoint) {
                    crashGame();
                    return;
                }
                
                // Check auto cash out
                const autoCashOut = parseFloat(autoCashOutInput.value);
                if (betAmount > 0 && currentMultiplier >= autoCashOut) {
                    cashOut();
                    return;
                }
                
                // Increase multiplier
                currentMultiplier += 0.01;
                updateDisplay();
            }, 100);
            
            updateDisplay();
        }
        
        function cashOut() {
            if (betAmount === 0 || gameState !== 'flying') return;
            
            const payout = betAmount * currentMultiplier;
            balance += payout;
            
            addToHistory({
                bet: betAmount,
                cashOut: currentMultiplier,
                crash: crashPoint,
                result: 'win',
                payout: payout
            });
            
            betAmount = 0;
            gameState = 'cashed_out';
            
            clearInterval(gameInterval);
            updateDisplay();
            
            setTimeout(() => {
                gameState = 'waiting';
                updateDisplay();
            }, 2000);
        }
        
        function crashGame() {
            if (betAmount > 0) {
                addToHistory({
                    bet: betAmount,
                    cashOut: null,
                    crash: crashPoint,
                    result: 'loss',
                    payout: 0
                });
            }
            
            betAmount = 0;
            gameState = 'crashed';
            currentMultiplier = crashPoint;
            
            clearInterval(gameInterval);
            updateDisplay();
            
            setTimeout(() => {
                gameState = 'waiting';
                currentMultiplier = 1.00;
                updateDisplay();
            }, 3000);
        }
        
        function generateCrashPoint() {
            // Simple crash point generation (not cryptographically secure)
            const random = Math.random();
            if (random < 0.5) return 1.00 + Math.random() * 2; // 1.00 - 3.00
            if (random < 0.8) return 3.00 + Math.random() * 7; // 3.00 - 10.00
            return 10.00 + Math.random() * 90; // 10.00 - 100.00
        }
        
        function addToHistory(game) {
            gameHistory.unshift(game);
            if (gameHistory.length > 5) gameHistory.pop();
            
            gameHistoryEl.innerHTML = gameHistory.map(g => 
                \`<div class="history-item \${g.result}">
                    <span>Bet: $\${g.bet.toFixed(2)}</span>
                    <span>\${g.result === 'win' ? \`Cash Out: \${g.cashOut.toFixed(2)}x\` : 'Lost'}</span>
                    <span>Crash: \${g.crash.toFixed(2)}x</span>
                    <span class="\${g.result}">\${g.result === 'win' ? '+' : ''}$\${(g.payout - (g.result === 'win' ? g.bet : 0)).toFixed(2)}</span>
                </div>\`
            ).join('');
        }
        
        // Initialize display
        updateDisplay();
    </script>
</body>
</html>
    `.trim();
  } catch (error) {
    console.error('Failed to generate Aviator game HTML:', error);
    throw error;
  }
};
