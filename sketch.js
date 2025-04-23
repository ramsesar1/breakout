let paddle;
let ball;
let blocks = [];
let score = 0;
let lives = 3;
let currentLevel = 1;
let maxLevel = 3;
let gameState = "playing"; 
let transitionTimer = 0;

function setup(){
    createCanvas(800,600);
    resetGame();
}

function resetGame(){
    paddle = {
        x: width / 2 - 50,
        y: height - 30,
        w: 100,
        h: 15,
        speed: 10
    };
   // inicializa la pelota
    resetBall();

    createBlocks();

    lives = 3;
    currentLevel = 1;
    score = 0;
    gameState = "playing";

}

function resetBall(){
    let baseSpeed = 4 + (currentLevel - 1)*1.5;
    ball = {
        x: width / 2,
        y: height / 2,
        r: 10,
        xSpeed: baseSpeed * (random() > 0.5 ? 1 : -1),
        ySpeed: baseSpeed * -1,
        lastCollision: null
    };
}



function createBlocks(){
    blocks = [];

    let blockWidth = 70;
    let blockHeight = 30;
    let rows = 3 + currentLevel;
    let cols = 10;
    let padding = 5;

    for (let i = 0; i < rows; i++){
        for (let j = 0; j < cols; j++){
            let block ={
                x: j * (blockWidth + padding) + padding,
                y: i * (blockHeight + padding) + 50,
                w: blockWidth,
                h: blockHeight,
                hits: 1, 
                id: i * cols + j
            };
            //bloque especial basado en nivel
            if (currentLevel >= 2 && i === 1 && j === 5){
                block.hits = 3;
            }
            if (currentLevel === 3){
                if(i === 1 && j === 3){
                    block.hits = 3;
                }
                if(i === 2 && j === 7){
                    block.hits = 3;
                }
                //bloque irrompible
                if (i === 0 && j === 4){
                    block.hits = -1; 
                }
            }
            blocks.push(block);
        }
    }
}

function draw(){
    background(0);

    displayInfo();

    if (gameState === "playing"){
        if (keyIsDown(LEFT_ARROW)){ //paddle a la izquierda
            paddle.x = max(0, paddle.x - paddle.speed);
        } 
        if (keyIsDown(RIGHT_ARROW)){ // paddle a la derecha
            paddle.x = min (width - paddle.w, paddle.x + paddle.speed);
        }
        let nextX = ball.x + ball.xSpeed;
        let nextY = ball.y + ball.ySpeed;

        //colision con los bordes laterales
        if (nextX + ball.r > width){
            ball.x = width - ball.r;
            ball.xSpeed *= -1;
        } else if (nextX - ball.r < 0){
            ball.x = ball.r;
            ball.xSpeed *= -1;
        } else {
            ball.x = nextX;
        }

        //colision con borde superior
        if (nextY - ball.r < 0){
            ball.y = ball.r;
            ball.ySpeed *= -1;
        } else {
            ball.y = nextY;
        }

        //colision con paddle y pelota
        if (ball.y + ball.r > paddle.y && 
            ball.y - ball.r < paddle.y + paddle.h &&
            ball.x > paddle.x &&
            ball.x < paddle.x + paddle.w){
        

            ball.y = paddle.y - ball.r;

            //angulo de rebote en posicion del paddle
            let hitPos = (ball.x - paddle.x) / paddle.w;
            //angulo de rebote entre -60 y 60 grados
            let angle = map (hitPos, 0, 1, -PI/3, PI/3);

            let speed = sqrt(ball.xSpeed * ball.xSpeed + ball.ySpeed * ball.ySpeed);
            ball.xSpeed = speed * sin(angle);
            ball.ySpeed = -abs(speed * cos(angle));
          }
          if (ball.y > height){
            lives--;
            if (lives <= 0){
                gameState = "gameOver";
            } else {
                resetBall();
            }
          }

          //resetea lastCollision si la pelota no esta en contacto con ladrillo
          let inContactWithAnyBlock = false;
          for (let block of blocks){
            if (checkBlockBallCollision(block)){
                inContactWithAnyBlock = true;
                break;
            }
          }
          if (!inContactWithAnyBlock){
            ball.lastCollision = null;
          }
          //checa colision con ladrillos
          checkBlockCollisions();
          
          checkLevelComplete();
    } else if (gameState === "levelComplete"){
        transitionTimer++;
        //cambiar nivel despues de 2 segundos
        if(transitionTimer > 120){
            currentLevel++;
            if (currentLevel > maxLevel){
                gameState = "gameWin";
            } else {
                resetBall();
                createBlocks();
                gameState = "playing";
                transitionTimer = 0;
            }
        }
    }
    drawGame();
}

//checa colision con ladrillo
function checkBlockBallCollision(block) {
    return (ball.x + ball.r > block.x && 
            ball.x - ball.r < block.x + block.w &&
            ball.y + ball.r > block.y && 
            ball.y - ball.r < block.y + block.h);
  }


//
function checkBlockCollisions(){
    for (let i = blocks.length - 1; i >= 0; i--){
        let block = blocks[i];

        //checa que no sea el mismo bloque con el que hizo colision
        if (checkBlockBallCollision(block) && ball.lastCollision !== block.id){
            ball.lastCollision = block.id;
            
            //no pasa nada si es un bloque irrompible
            if(block.hits === -1){
                handleBallBlockCollision(block);
            } else {
                block.hits--;
                
                if (block.hits <= 0){
                    blocks.splice(i,1);
                    score++;
                }
                handleBallBlockCollision(block);
            }
            //solo una colision por frame
            break;
        }
    }
}

function handleBallBlockCollision(block){

    //determina direccion de origen de la pelota
    let ballCenterX = ball.x;
    let ballCenterY = ball.y;
    let blockCenterX = block.x + block.w /2;
    let blockCenterY = block.y + block.h /2;

    let dx = ballCenterX - blockCenterX;
    let dy = ballCenterY - blockCenterY;

    //checa la mitad de los bloques
    let blockHalfWidth = block.w / 2;
    let blockHalfHeight = block.h / 2;

    let overlapX = blockHalfWidth - abs(dx);
    let overlapY = blockHalfHeight - abs(dy);

    //rebote de la pelota en direccion de menor angulo
    if (overlapX < overlapY){
        ball.xSpeed = abs(ball.xSpeed) * (dx > 0 ? 1 : -1);

        //ya no se quede atorada
        if (dx > 0){
            ball.x = block.x + block.w + ball.r;
        } else {
            ball.y = block.y - ball.r;
        }
    } else {
        ball.ySpeed = abs(ball.ySpeed) * (dy > 0 ? 1 : -1);

        if (dy > 0){
            ball.y = block.y + block.h + ball.r;
        } else {
            ball.y = block.y - ball.r;
        }
    }
}

function checkLevelComplete(){
    let breakableBlocks = 0;
    for (let block of blocks){
        if (block.hits !== -1){
            breakableBlocks++;
        }
    }
    if (breakableBlocks === 0){
        gameState = "levelComplete";
    }
}

function drawGame(){
    //paddle
    fill (0,150,255);
    noStroke();
    rect(paddle.x,paddle.y,paddle.w,paddle.h, 5);
    //pelota
    fill(255);
    noStroke()
    circle(ball.x, ball.y, ball.r * 2);

    for (let block of blocks) {
        if (block.hits === 1){
            fill (255,100,100); //bloque rojo
        } else if (block.hits === 2){
            fill(255,165,0); //doble golpe
        } else if (block.hits === 3){
            fill(255,215,0); //triple holpe
        } else if (block.hits === -1){ 
            fill(100,100,100); // irrompibles
        }
        noStroke();
        rect(block.x, block.y, block.w, block.h,3);
    }

    if (gameState === "levelComplete"){
        fill(255);
        textSize(32);
        textAlign(CENTER);
        text("¡Nivel " + currentLevel + " completado!", width/2, height/2);
        text("Preparando nivel " + (currentLevel + 1) + "...", width/2, height/2 + 40);
    } else if (gameState === "gameOver"){
        fill(255,0,0);
        textSize(40);
        textAlign(CENTER);
        text("GAME OVER", width/2,height/2);
        textSize(24);
        text("Presiona ESPACIO para reiniciar", width/2, height/2 + 40);
    } else if (gameState === "gameWin"){
        fill (0, 255, 0);
        textSize(40);
        textAlign(CENTER);
        text("VENCISTE EL JUEGO", width/2, height/2);
        textSize(24);
        text("Puntuacion final: " + score, width/2, height/2 + 40);
        text("Presiona ESPACIO para jugar", width/2, height/2 + 80);
    }
}

function displayInfo(){
    fill (255);
    textSize(16);
    textAlign(LEFT);
    text("Puntuacion: " + score, 20, 30);
    text("Vidas: "+ lives, 150,30);
    text("Nivel: "+currentLevel, 250, 30);
}

function keyPressed(){
    if (key === " " && (gameState === "gameOver" || gameState === "gameWin")){
        resetGame();
    }
}