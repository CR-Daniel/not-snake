function initializeGame(options) {
  let gridSize = 16;
  let canvasSize = Math.min(window.innerWidth, window.innerHeight) * 0.5;
  let cellSize = canvasSize / gridSize;

  document.body.innerHTML = `
    <div id="scoreboard">
      <div id="score">Score: 0</div>
      <div id="highscore">High Score: ${localStorage.getItem('highscore') || 0}</div>
    </div>
    <canvas id="canvas" width="${canvasSize}" height="${canvasSize}"></canvas>
  `;

  let ctx = canvas.getContext("2d");
  let snake = [[8,8]], apple = spawnApple(), [dx,dy] = [0,0];
  let score = 0;
  let highscore = localStorage.getItem('highscore') || 0;
  let speed = options.shouldSpeedUp ? 250 : 125; // Adjust initial speed based on the shouldSpeedUp option
  let minimumSpeed = 50; // Minimum limit for the speed
  let tailSize = options.tailSize || 1; // Set initial tail size based on the tailSize option

  onkeydown = ({key}) => [dx,dy] =
    { [key]: [dx,dy], ArrowRight:[dx||1, 0], ArrowLeft:[dx||-1, 0] ,
                      ArrowDown: [0, dy||1], ArrowUp:  [0, dy||-1] }[key];
  
  let game = setInterval(updateGame, speed);

  function spawnApple() {
    switch(options.appleSpawn) {
      case 'edges':
        let edge = Math.floor(Math.random() * 4);
        switch(edge) {
          case 0: return [0, Math.floor(Math.random() * gridSize)]; // Left edge
          case 1: return [gridSize-1, Math.floor(Math.random() * gridSize)]; // Right edge
          case 2: return [Math.floor(Math.random() * gridSize), 0]; // Top edge
          case 3: return [Math.floor(Math.random() * gridSize), gridSize-1]; // Bottom edge
        }
        break;
      case 'corners':
        let corner = Math.floor(Math.random() * 4);
        switch(corner) {
          case 0: return [0, 0]; // Top-left corner
          case 1: return [gridSize-1, 0]; // Top-right corner
          case 2: return [0, gridSize-1]; // Bottom-left corner
          case 3: return [gridSize-1, gridSize-1]; // Bottom-right corner
        }
        break;
      default:
        // Default to spawning apple randomly anywhere on the grid
        return [Math.floor(Math.random()*gridSize), Math.floor(Math.random()*gridSize)];
    }
  }

  function updateGame() {
    let nx = (snake[0][0] + dx);
    let ny = (snake[0][1] + dy);

    // Check for boundary collision if bounded is set to true
    if (options.bounded && (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize)) {
      resetGame();
      return;
    }

    if (!options.bounded) {
      nx = nx & 15;
      ny = ny & 15;
    }

    if (dx || dy) {
      snake.unshift([nx, ny]); // add new head to snake
    }

    if ("" + [nx,ny] == apple) {
      apple = spawnApple();  // Spawn a new apple
      do apple = spawnApple();
      while(snake.some(seg => ""+seg == apple));
      score++;

      // Update tail size based on tailBehavior
      switch(options.tailBehavior) {
        case 'decreasing':
          tailSize = Math.max(1, tailSize - 1);
          break;
        case 'classic':
          tailSize = score + 1;
          break;
        case 'fixed':
          break;
        default:
          tailSize = score + 1;
      }

      document.getElementById("score").innerText = `Score: ${score}`;
      if (score > highscore) {
        highscore = score;
        localStorage.setItem('highscore', highscore);
        document.getElementById("highscore").innerText = `High Score: ${highscore}`;
      }
      document.getElementById('canvas').classList.add('pulse');
      setTimeout(function() {
        document.getElementById('canvas').classList.remove('pulse');
      }, 1000);

      if(options.shouldSpeedUp) {
        speed = Math.max(speed - 10, minimumSpeed);
        clearInterval(game);
        game = setInterval(updateGame, speed);
      }
    }
    else if (snake.slice(1).some(seg => "" + seg == [nx, ny])) {
      resetGame();
      return;
    }
    while (snake.length > tailSize) {
      snake.pop();
    }
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    ctx.fillStyle = "red";
    ctx.fillRect(apple[0]*cellSize, apple[1]*cellSize, cellSize, cellSize);
    ctx.fillStyle = "lime";
    snake.forEach(([x,y]) => ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize));
  }

  function resetGame() {
    snake = [[8,8]]; // reset snake
    apple = spawnApple(); // reset apple
    score = 0; // reset score
    tailSize = options.tailSize || 1; // reset tail size based on the tailSize option
    [dx, dy] = [0, 0]; // reset direction
    document.getElementById("score").innerText = `Score: ${score}`;
    if(options.shouldSpeedUp) {
      speed = 250;
      clearInterval(game);
      game = setInterval(updateGame, speed);
    }
  }
}
