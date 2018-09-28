"use strict";

let type = "WebGL";

var WIDTH = 900;
var HEIGHT = 600;

let Application = PIXI.Application, //Created aliases to make lines of code shorter and easier to remember
    Container = PIXI.Container,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    TextureCache = PIXI.utils.TextureCache,
    Sprite = PIXI.Sprite,
    Rectangle = PIXI.Rectangle,
    Text = PIXI.Text,
    TextStyle = PIXI.TextStyle,
    Graphics = PIXI.Graphics;

if (!PIXI.utils.isWebGLSupported()) {
    type = "canvas";
}

PIXI.utils.sayHello(type);

var app = new PIXI.Application(WIDTH, HEIGHT, {
    antialias: true
});

//Add canvas that Pixi created to the HTML document
document.getElementById('Canvas').appendChild(app.view);

const environmentRef = new Environment();
const uiRef = new UI();
const playerRef = new Player();
const inputRef = new Input();

let mousePos = {
    x: 0,
    y: 0
};

let mouseTemp = {
    x: 0,
    y: 0
};

let style = new TextStyle({ //Used to create the style of font shown in the game
    fontFamily: "Impact",
    fontSize: 25,
    fill: "white",
    stroke: '#0000FF',
    strokeThickness: 3,
    dropShadow: true,
    dropShadowColor: "#000000",
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 3,
    dropShadowDistance: 3,
});

let state, help, message, menuItemsArray = [],
    backgroundArray = [],
    gameItemsArray = [],
    points, pointsNum = 0,
    biggestPoints, endPoints, startButton, rotateAnim = false,
    rotateLeft = false,
    randomPipeTimer, pipeCount = 0,
    lastSpawn = 0,
    player, gameOver = false,
    jumpTimer = 10,
    lastJump = 0,
    canJump = true;

if (!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform) == false) {
    loader //Loads all the needed images from the image folder
        .add("spriteSheet", "Images/flapPixieFlap_assets/WorldAssets.json")
        .add("column", "Images/flapPixieFlap_assets/column.png")
        .add("pixie", "Images/flapPixieFlap_assets/flyingPixie.png")
        .add("backgroundComplete", "Images/flapPixieFlap_assets/mainBG_composite.jpg")
        .add("playButton", "Images/flapPixieFlap_assets/playButton.png")
        .on("progress", loadProgressHandler) //Gives loading progress
        .load(setup);
} else {
    loader //Loads all the needed images from the image folder
        .add("spriteSheet", "Images/_MACOSX/flapPixieFlap_assets/._WorldAssets.json", crossOrigin = false)
        .add("column", "Images/_MACOSX/flapPixieFlap_assets/._column.png")
        .add("pixie", "Images/_MACOSX/flapPixieFlap_assets/._flyingPixie.png")
        .add("backgroundComplete", "Images/_MACOSX/flapPixieFlap_assets/._mainBG_composite.jpg")
        .add("playButton", "Images/_MACOSX/flapPixieFlap_assets/._playButton.png")
        .on("progress", loadProgressHandler) //Gives loading progress
        .load(setup);
}

/**
 * Initial setup for the game. Creates background and sets up input
 */
function setup() {
    app.stage.interactive = true;
    backgroundSetup();

    if (localStorage.getItem("highScorePoints") == null) {
        localStorage.setItem("highScorePoints", 0);
    }

    state = menu;
    menuInit();

    inputRef.input();
    app.ticker.add(delta => gameLoop(delta));
}

function backgroundSetup() {
    let background = new Sprite(resources.backgroundComplete.texture);
    background.width = WIDTH;
    background.height = HEIGHT;
    backgroundArray.push(background);
    app.stage.addChild(background);

    let backgroundSecondary = new Sprite(resources.backgroundComplete.texture);
    backgroundSecondary.width = WIDTH;
    backgroundSecondary.height = HEIGHT;
    backgroundSecondary.position.set(WIDTH, 0);
    backgroundArray.push(backgroundSecondary);
    app.stage.addChild(backgroundSecondary);
}

function createText(defaultTextValue, pos_x, pos_y, anchor_x, anchor_y, isMenuItem) {
    let textBeingCreated = new Text(defaultTextValue, style);
    textBeingCreated.position.set(pos_x, pos_y);
    textBeingCreated.anchor.set(anchor_x, anchor_y);

    if (isMenuItem) {
        menuItemsArray.push(textBeingCreated);
    }

    return textBeingCreated;

}

/**
 * Create menu and loads highscore
 */
function menuInit() {
    message = createText("Pixi.js Demo - Ashley Cook - FlappyPixie", WIDTH / 2, 60, 0.5, 0.5, true);
    app.stage.addChild(message);
    help = createText("Click or tap to flap", WIDTH / 2, 100, 0.5, 0.5, true);
    app.stage.addChild(help);

    if (localStorage.getItem("highScore") > 0) {
        biggestPoints = new Text("You sure know how to jump through gaps, you have " + localStorage.getItem("highScore") + " points!", style);
    } else {
        biggestPoints = new Text("You currently don't have a highscore", style);
    }

    biggestPoints.position.set(WIDTH / 2, 180);
    biggestPoints.anchor.set(0.5, 0.5);
    app.stage.addChild(biggestPoints);

    endPoints = createText("Your previous game's points " + localStorage.getItem("highScorePoints"), WIDTH / 2, 140, 0.5, 0.5, false);
    app.stage.addChild(endPoints);

    uiRef.createMenu();
}

/**
 * Creates player and preloads pipe asset
 */
function gameInit() {
    //points = createText("Points: ", WIDTH / 2, 60, 0.5, 0.5, true);
    //app.stage.addChild(points);
    randomPipeTimer = Math.floor(Math.random() * (2000 + 1000) + 2000);
    lastSpawn = Date.now();

    playerRef.spawnPlayer();
    uiRef.createUI();
    //gameOverInit();

    state = play;
}

/**
 * Displays end game message and clears redundent UI
 */
/*function gameOverInit() {
    let gameOverTimer = setInterval(function () {
        if (state == play) {
            timerText.text = gameTimer--;

            if (gameTimer <= 0) {
                canFish = false;
                clearInterval(gameOverTimer);

                for (let i = 0; i < gameItems.length; i++) {
                    gameItems[i].visible = false;
                }

                biggestPoints.visible = false;

                let endMessage = new Text("", style);
                endMessage.position.set(WIDTH / 2, HEIGHT / 2);
                endMessage.anchor.set(0.5, 0.5);
                app.stage.addChild(endMessage);

                if (biggestCatchNum > localStorage.getItem("highScore")) {
                    endMessage.text = "CONGRATS! You beat your previous biggest catch with " + biggestCatchNum;
                } else {
                    endMessage.text = "Your biggest catch today was " + biggestCatchNum + "\n so you didn't beat your biggest catch of " + localStorage.getItem("highScore") + ", try again!"
                }

                endPoints.visible = true;
                endPoints.position.set(WIDTH / 2, HEIGHT / 1.5);

                if (pointsNum > localStorage.getItem("highScorePoints")) {
                    localStorage.setItem("highScorePoints", pointsNum);
                    endPoints.text = "CONGRATS! You beat your previous highscore with " + pointsNum;
                } else {
                    endPoints.text = "You have gained " + pointsNum + " points \n So you didn't beat your highest score of " + localStorage.getItem("highScorePoints") + ", try again!"
                }

                restartButton.visible = true;
            }
        }
    }, 1000);
}*/


function gameLoop(delta) {
    state(delta);
}

/**
 * Play state
 */
function play() {
    playerRef.playerUpdate();
    environmentRef.environmentUpdate();
    if (Date.now() - lastSpawn > randomPipeTimer) {
        randomPipeTimer = Math.floor(Math.random() * 700) + 1000;
        lastSpawn = Date.now();
        //environmentRef.spawnPipes();
    }

    //background parallax 
    //background.position.set(-mousePos.x / 10 - 100, -mousePos.y / 10 - 10);

    //points.text = "Points: " + pointsNum;
    //biggestPoints.text = "Highscore: " + localStorage.getItem("highScorePoints");

    //fishObj.checkFish();
}

function pause() {

}

/**
 * Menu State
 */
function menu() {
    let rotationAmount = 0.01;
    let maxRotation = 0.2;

    //Creates simple back and forth rotation animation when button is start hovered over
    if (rotateAnim) {
        if (!rotateLeft) {
            for (let i = 0; i < menuItemsArray.length; i++) {
                menuItemsArray[i].rotation += rotationAmount;
                rotateLeft = (menuItemsArray[i].rotation >= maxRotation) ? true : false;
            }
        } else {
            for (let i = 0; i < menuItemsArray.length; i++) {
                menuItemsArray[i].rotation -= rotationAmount;
                rotateLeft = (menuItemsArray[i].rotation <= -maxRotation) ? false : true;
            }
        }
    } else {
        for (let i = 0; i < menuItemsArray.length; i++) {
            menuItemsArray[i].rotation = 0;
        }
    }
}

function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end
}

function checkMove() {
    isMouseMove = false;
}

/**
 * aabb collision check
 * @param {PIXI.Sprite} rect1 
 * @param {PIXI.Sprite} rect2 
 */
function collisionDetection(rect1, rect2) {
    let rect1Bounds = rect1.getBounds();
    let rect2Bounds = rect2.getBounds();

    if (rect1 == hook) {
        rect1Bounds.y = (rect1Bounds.y + (rect1Bounds.height - 5));

        return rect1Bounds.x + rect1Bounds.width > rect2Bounds.x && rect1Bounds.x < rect2Bounds.x + rect2Bounds.width &&
            rect1Bounds.y > rect2Bounds.y && rect1Bounds.y < rect2Bounds.y + rect2Bounds.height;
    } else {
        return rect1Bounds.x + rect1Bounds.width > rect2Bounds.x && rect1Bounds.x < rect2Bounds.x + rect2Bounds.width &&
            rect1Bounds.y + rect1Bounds.height > rect2Bounds.y && rect1Bounds.y < rect2Bounds.y + rect2Bounds.height;
    }
}

function loadProgressHandler(loader, resource) {
    resource ? console.log("progress of " + resource.name + ": " + loader.progress + "%") : console.log("progress of " + resource.url + ": " + loader.progress + "%");
}