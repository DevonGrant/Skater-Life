//use strict mode which has the browser catch many JS mistake
"use strict"
const game = new PIXI.Application(innerWidth, 600, {antialis: true});
game.renderer.backgroundColor = 0x222222;

document.addEventListener("keydown", onkeyDown);

//constants
const screenWidth = game.view.width;
const screenHeight = game.view.height;
 

//pre-load the images
PIXI.loader.
add(["images/Background.jpeg", "images/Rep.png", "images/car.png", "images/Skater.png"]).
on("progress", e=>{console.log(`progress=${e.progress}`)}).
load(setup);



//Game States
let stage;

//game variables
let background1;
let background2;
let backgroundMusic;
let currentSpeedTime = 0;
let currentTime = 0;
let elapsedObstacleTime = 0;
let elapsedRepTime = 0;
let endGameRepLabel;
let gameOverScreen;
let gameScreen;
let groundLevel = 462.5;
let gravity = 3.5;
let highRep;
let highRepLabel;
let isFalling = false;
let jumping = false;
let jumpSound;
let jumpSpeed = 30;
let obstacleMaxDelayTime = 2;
let obstacleMinDelayTime = 1;
let obstacleTimer = 0;
let obstacles = new Array();
let paused = true;
let player;
let randomStartSong;
let rep = 0;
let repArray = new Array();
let repCollectedSound;
let highRepKey = "isasdgh";
let repLabel;
let repMaxDelayTime = 3;
let repMinDelayTime = 2;
let repTimer = 2;
let skatingSFX;
let speed;
let speedMaxDelayTime = 5;
let startScreen;
let timer = .5;
let totalRep;
let totalRepLabel;
let totalRepKey = "dyhnaff";

function setup() {
    
    document.querySelector("#main").appendChild(game.view);
    stage = game.stage;

    background1 = new Background(0, -250);
    stage.addChild(background1);

    background2 = new Background(innerWidth, -250);
    stage.addChild(background2);

    //create the 'start' scene
    startScreen = new PIXI.Container();
    stage.addChild(startScreen);

    //create the main 'game' scene and make it invisible
    gameScreen = new PIXI.Container();
    gameScreen.visible = false;
    stage.addChild(gameScreen);

    //create the 'gameOver' scene and make it invisible
    gameOverScreen = new PIXI.Container();
    gameOverScreen.visible = false;
    stage.addChild(gameOverScreen);

    //create labels for all 3 scenes
    createLabelsAndButtons();

    //create player
    player = new Skater();
    gameScreen.addChild(player);

    //load sounds
    backgroundMusic = new Howl({
        src: ['sounds/BackgroundMusic.mp3'],
        autoplay: true,
        loop: true,
        volume: .05
    });
    randomStartSong = getRandomInt(3644);
    backgroundMusic.seek(randomStartSong);

    jumpSound = new Howl({
        src: ['sounds/jumpSFX.mp3'],
        volume: 0.75
    });

    repCollectedSound = new Howl({
        src: ['sounds/rep.mp3'],
        volume: 0.25
    });

    skatingSFX = new Howl({
        src: ['sounds/ridingSFX.mp3'],
        autoplay: true,
        loop: true,
        volume: 0.125
    });

    //start update loop
    game.ticker.add(coreLoop);

    speed = 500;

    highRep = localStorage.getItem(highRepKey);
    totalRep = localStorage.getItem(totalRepKey);
}
function coreLoop(){
    if(paused) return;

    let elapsedTime = 1/game.ticker.FPS;
    if(elapsedTime > 1/12) elapsedTime = 1/12;

    if(player.y <= groundLevel)
    {
        if(jumping)
        {
            player.y -= jumpSpeed;
            currentTime += elapsedTime; 
            
            if(currentTime > timer)
            {
                jumping = false;
                isFalling = true;
            }
            jumpSpeed *= .9;
        }

        else if(isFalling)
        {
            player.y += gravity;
            timer = .5;
            currentTime = 0;
            gravity *= 1.075;
        }
    }

    else
    {
        isFalling = false;
        player.y = groundLevel;
        jumpSpeed = 30;
        gravity = 3.5;
    }

    //Rep
    currentSpeedTime += elapsedTime;
    if(currentSpeedTime > speedMaxDelayTime)
    {
        currentSpeedTime = 0;
        speed *= 1.1;
        repMaxDelayTime *= .975;
        obstacleMaxDelayTime *= .95;
        repMinDelayTime *= .96;
        obstacleMinDelayTime *= .975;
    }

    elapsedRepTime += elapsedTime;
    if(elapsedRepTime > repTimer)
    {
        repTimer = Math.random() * repMaxDelayTime;
        if(repTimer < repMinDelayTime)
        {
            repTimer = repMinDelayTime;
        }

        elapsedRepTime = 0;
        generateRep();
    }

    for(let c of repArray){
        c.move(elapsedTime);
    }

    for(let i of repArray){
        //call rectsIntersect() 
        if(rectsIntersect(player, i) && !i.collected){
            i.collected = true;
            i.stillOnScreen = false;
            gameScreen.removeChild(i)
            repCollected(i);
        }
    }
    
    removeRep();

    //Obstacles
    elapsedObstacleTime+=elapsedTime;
    if(elapsedObstacleTime > obstacleTimer)
    {
        obstacleTimer = Math.random() * obstacleMaxDelayTime;
        if(obstacleTimer < obstacleMinDelayTime)
        {
            obstacleTimer = obstacleMinDelayTime;
        }
        elapsedObstacleTime = 0;
        generateObstacles();
    }

    for(let b of obstacles){
        b.move(elapsedTime);
    }

    for(let b of obstacles){
        //call rectsIntersect() 
        if(rectsIntersect(player, b)){
           player.isAlive = false;
        }
    }

    removeObstacles();

    //Scrollable backgorund
    background1.x--;
    background2.x--;
    if(background1.x <= -2100)
    {
        background1.x = innerWidth;
    }
    if(background2.x <= -2100)
    {
        background2.x = innerWidth;
    }

    //Check if player is alive
    if(!player.isAlive)
    {
        gameOver();
        return;
    }

}

function createLabelsAndButtons(){
    let buttonStyle = new PIXI.TextStyle({
        fill: 0x808080,
        fontSize: 48,
        fontFamily: "skaterDudes"
    });

    //set up the 'startScreen'
    let titleLabel = new PIXI.Text("Skater Life");
    titleLabel.style = new PIXI.TextStyle({
        fill: 0x222222,
        fontSize: 96,
        fontFamily: "skaterDudes"
    });
    titleLabel.x = innerWidth/2.55;
    titleLabel.y = 120;
    startScreen.addChild(titleLabel);

    let instructions = new PIXI.Text("Press SPACE to jump!");
    instructions.style = new PIXI.TextStyle({
        fill: 0x808080,
        fontSize: 75,
        fontFamily: "skaterDudes"
    });
    instructions.x = innerWidth/3.05;
    instructions.y = 350;
    startScreen.addChild(instructions);

    let startButton = new PIXI.Text("Click to Start");
    startButton.style = buttonStyle;
    startButton.x = innerWidth/2.3;
    startButton.y = screenHeight - 55;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on('pointerup', startGame);
    startButton.on('pointerover', e=>e.target.alpha = 0.625);
    startButton.on('pointerout', e=>e.currentTarget.alpha = 1.0);
    startScreen.addChild(startButton);

    //set up the 'gameScreen'
    let textStyle = new PIXI.TextStyle({
        fill: 0x000000,
        fontSize: 36,
        fontFamily: "skaterDudes"
    });

    repLabel = new PIXI.Text();
    repLabel.style = textStyle;
    repLabel.x = 25;
    repLabel.y = 25;
    gameScreen.addChild(repLabel);
    increaseRepBy(0);

    //set up the 'gameOverScreen'
    let gameOverText = new PIXI.Text("Game Over");
    gameOverText.style = new PIXI.TextStyle({
        fill: 0x222222,
        fontSize: 96,
        fontFamily: "skaterDudes"
    });

    gameOverText.x = innerWidth/2.55;
    gameOverText.y = 120;
    gameOverScreen.addChild(gameOverText);

    endGameRepLabel = new PIXI.Text();
    endGameRepLabel.style = new PIXI.TextStyle({
        fill: 0x808080,
        fontSize: 75,
        fontFamily: "skaterDudes"
    });

    endGameRepLabel.x = innerWidth/2.5;
    endGameRepLabel.y = screenHeight/2 + 160;
    gameOverScreen.addChild(endGameRepLabel);

    highRepLabel = new PIXI.Text();
    highRepLabel.style = new PIXI.TextStyle({
        fill: 0x808080,
        fontSize: 75,
        fontFamily: "skaterDudes"
    });

    highRepLabel.x = innerWidth/3;
    highRepLabel.y = screenHeight/2 + 90;
    gameOverScreen.addChild(highRepLabel);

    totalRepLabel = new PIXI.Text();
    totalRepLabel.style = new PIXI.TextStyle({
        fill: 0x808080,
        fontSize: 75,
        fontFamily: "skaterDudes"
    });

    totalRepLabel.x = innerWidth/2.5;
    totalRepLabel.y = screenHeight/2 ;
    gameOverScreen.addChild(totalRepLabel);

    let playAgainButton = new PIXI.Text("Play Again");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = innerWidth/2.2;
    playAgainButton.y = screenHeight - 55;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", startGame);
    playAgainButton.on("pointerover", e=>e.target.alpha = 0.625);
    playAgainButton.on("pointerout", e=>e.currentTarget.alpha = 1.0);
    gameOverScreen.addChild(playAgainButton);
}

function gameOver(){
    paused = true;
    gameOverScreen.visible = true;
    gameScreen.visible = false;

    obstacles.forEach(i=>gameScreen.removeChild(i))
    obstacles = [];

    repArray.forEach(i=>gameScreen.removeChild(i))
    repArray = [];

    endGameRepLabel.text = `Rep Gained: ${rep}`;

    if(highRep != null)
    {
        if(rep > highRep)
        {
            highRep = rep;
            localStorage.setItem(highRepKey, rep);
        }
        highRepLabel.text = `Most Rep in Game: ${highRep}`;
    }
    else
    {
        highRep = rep;
        localStorage.setItem(highRepKey, rep);
        highRepLabel.text = `Most Rep in Game: ${highRep}`;
    }

    if(totalRep != null)
    {
        totalRep += rep;
        localStorage.setItem(totalRepKey, totalRep);
        totalRepLabel.text = `Total Rep: ${totalRep}`;
    }
    else
    {
        totalRepLabel.text = `Total Rep: ${totalRep}`;
    }
}

function generateObstacles()
{
    let newObstacle = new GenerateObstacle(5000, groundLevel, speed);
    gameScreen.addChild(newObstacle);
    obstacles.push(newObstacle);
}

function generateRep()
{
    let randomHeight = 200 + getRandomInt(151);
    let generatedRep = new GenerateRep(5000, randomHeight, speed);
    gameScreen.addChild(generatedRep);
    repArray.push(generatedRep);
}

function getRandomInt(int) {
    return Math.floor(Math.random() * Math.floor(int));
}

function increaseRepBy(value){
    rep += value;
    repLabel.text = `Rep: ${rep}`
}

function onkeyDown(e){
    if(gameScreen.visible == true && player.y == groundLevel && e.keyCode === 32)
    {
        jumping = true;
        jumpSound.play();
    }
}

function removeObstacles()
{
    if(obstacles.length !=0)
    {
        if(obstacles[0].x < -100)
        {
            gameScreen.removeChild(obstacles[0]);
            obstacles.shift();
        }
    }
}

function removeRep()
{
    if(repArray.length != 0)
    {
        if(repArray[0].x < -100)
        {   
            gameScreen.removeChild(repArray[0]);
            repArray.shift();
        }
    }
}

function repCollected(i)
{
    repCollectedSound.play();
    increaseRepBy(1);
    i.collected = true;
}

function startGame(){
    startScreen.visible = false;
    gameOverScreen.visible = false;
    gameScreen.visible = true;
    background1.x = 0;
    background2.x = innerWidth;
    currentTime = 0;
    elapsedObstacleTime = 0;
    elapsedRepTime = 0;
    gravity = 3.5;
    increaseRepBy(0);
    isFalling = false;
    jumpSpeed = 30;
    jumping = false;
    obstacleMaxDelayTime = 2;
    obstacleMinDelayTime = 1;
    obstacleTimer = 0;
    paused = false;
    player.isAlive = true;
    player.y = groundLevel;
    rep = 0;
    repMaxDelayTime = 3;
    repMinDelayTime = 2;
    speed = 500;
}

window.onkeydown = function(e) { 
    return !(e.keyCode == 32);
};