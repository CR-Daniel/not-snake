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
  let snake = [[8,8]], apple = spawnApple(), toxicApples = [], [dx,dy] = [0,0];
  let score = 0;
  let highscore = localStorage.getItem('highscore') || 0;
  let speed = options.shouldSpeedUp ? 250 : 125;
  let minimumSpeed = 50;
  let tailSize = options.tailSize || 1;
  let tailVisible = options.tailVisible !== undefined ? options.tailVisible : true;

  onkeydown = ({key}) => [dx,dy] =
    { [key]: [dx,dy], ArrowRight:[dx||1, 0], ArrowLeft:[dx||-1, 0] ,
                      ArrowDown: [0, dy||1], ArrowUp:  [0, dy||-1] }[key];
  
  let game = setInterval(updateGame, speed);

  function spawnApple() {
    let newApple;
    do {
      switch(options.appleSpawn) {
        case 'edges':
          let edge = Math.floor(Math.random() * 4);
          switch(edge) {
            case 0: newApple = [0, Math.floor(Math.random() * gridSize)]; break; // Left edge
            case 1: newApple = [gridSize-1, Math.floor(Math.random() * gridSize)]; break; // Right edge
            case 2: newApple = [Math.floor(Math.random() * gridSize), 0]; break; // Top edge
            case 3: newApple = [Math.floor(Math.random() * gridSize), gridSize-1]; break; // Bottom edge
          }
          break;
        case 'corners':
          let corner = Math.floor(Math.random() * 4);
          switch(corner) {
            case 0: newApple = [0, 0]; break; // Top-left corner
            case 1: newApple = [gridSize-1, 0]; break; // Top-right corner
            case 2: newApple = [0, gridSize-1]; break; // Bottom-left corner
            case 3: newApple = [gridSize-1, gridSize-1]; break; // Bottom-right corner
          }
          break;
        default:
          // Default to spawning apple randomly anywhere on the grid
          newApple = [Math.floor(Math.random()*gridSize), Math.floor(Math.random()*gridSize)];
      }
    } while (snake.some(seg => ""+seg == newApple));
    return newApple;
  }

  function spawnToxicApples() {
    let newToxicApples = [];
    for (let i = 0; i < (options.toxicApples || 0); i++) {
      let newToxicApple;
      do {
        newToxicApple = [Math.floor(Math.random()*gridSize), Math.floor(Math.random()*gridSize)];
      } while (snake.some(seg => ""+seg == newToxicApple));
      newToxicApples.push(newToxicApple);
    }
    return newToxicApples;
  }

  function updateGame() {
    let nx = (snake[0][0] + dx);
    let ny = (snake[0][1] + dy);

    if (options.bounded && (nx < 0 || nx >= gridSize || ny < 0 || ny >= gridSize)) {
      resetGame();
      return;
    }

    if (!options.bounded) {
      nx = nx & 15;
      ny = ny & 15;
    }

    if (dx || dy) {
      snake.unshift([nx, ny]);
    }

    if ("" + [nx,ny] == apple) {
      apple = spawnApple();
      toxicApples = spawnToxicApples();
      score++;

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
    } else if (toxicApples.some(toxicApple => "" + [nx,ny] == toxicApple)) {
      resetGame();
      return;
    } else if (snake.slice(1).some(seg => "" + seg == [nx, ny])) {
      resetGame();
      return;
    }
    while (snake.length > tailSize) {
      snake.pop();
    }

    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Draw the apples
    ctx.fillStyle = "red";
    ctx.fillRect(apple[0]*cellSize, apple[1]*cellSize, cellSize, cellSize);

    // Draw toxic apples
    ctx.fillStyle = "purple";
    toxicApples.forEach(toxicApple => ctx.fillRect(toxicApple[0]*cellSize, toxicApple[1]*cellSize, cellSize, cellSize));

    if(tailVisible) {
      ctx.fillStyle = "lime";
      snake.slice(1).forEach(([x,y]) => ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize));
    }
    
    ctx.fillStyle = "lime";
    ctx.fillRect(snake[0][0]*cellSize, snake[0][1]*cellSize, cellSize, cellSize);
  }

  function resetGame() {
    clearInterval(game);
    snake = [[8,8]];
    apple = spawnApple();
    toxicApples = [];
    [dx, dy] = [0, 0];
    score = 0;
    speed = options.shouldSpeedUp ? 250 : 125;
    tailSize = options.tailSize || 1;
    document.getElementById("score").innerText = `Score: ${score}`;
    game = setInterval(updateGame, speed);
  }
}
