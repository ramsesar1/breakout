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


    drawGame();
}

function drawGame(){
    fill (0,150,255);
    noStroke();
    rect(paddle.x,paddle.y,paddle.w,paddle.h, 5);
}