window.onload = () => {
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
    let snake = [[8,8]], apple = [4,4], [dx,dy] = [0,0];
    let score = 0;
    let highscore = localStorage.getItem('highscore') || 0;
  
    onkeydown = ({key}) => [dx,dy] =
      { [key]: [dx,dy], ArrowRight:[dx||1, 0], ArrowLeft:[dx||-1, 0] ,
                        ArrowDown: [0, dy||1], ArrowUp:  [0, dy||-1] }[key];
    setInterval(() => {
      snake.unshift([ (snake[0][0] + dx) & 15 ,
                      (snake[0][1] + dy) & 15 ]);
      if(""+snake[0] == apple) {
        do apple = [ Math.floor(Math.random()*gridSize) ,
                     Math.floor(Math.random()*gridSize) ];
        while(snake.some(seg => ""+seg == apple));
        score++;
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
      }
      else if(snake.slice(1).some(seg => ""+seg == snake[0])) {
        snake.splice(1);
        score = 0;
        document.getElementById("score").innerText = `Score: ${score}`;
      }
      else
        snake.pop();
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      ctx.fillStyle = "red";
      ctx.fillRect(apple[0]*cellSize, apple[1]*cellSize, cellSize, cellSize);
      ctx.fillStyle = "lime";
      snake.forEach(([x,y]) => ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize));
    }, 125);
};
  