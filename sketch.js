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

    drawGame();
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
        rect(block.x, block.y, block.w, bloch.h,3);
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