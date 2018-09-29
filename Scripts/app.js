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
    columnArray = [],
    points, pointsNum = 0,
    biggestPoints, endPoints, startButton, rotateAnim = false,
    rotateLeft = false,
    randomPipeTimer, pipeCount = 0,
    lastSpawn = 0,
    gameOver = false,
    timer = 3,
    timerText;

const uiRef = new UI();
const inputRef = new Input();

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

let columnRef;
let playerRef;

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
    randomPipeTimer = 1000;
    lastSpawn = Date.now();

    playerRef = new Player();
    app.stage.addChild(playerRef);

    uiRef.createUI();

    //gameOverInit();
    timerText = createText("", WIDTH / 2, 60, 0.5, 0.5, true);
    app.stage.addChild(timerText);

    let timerStart = setInterval(function () {
        if (timer > 0) {
            timerText.text = timer--;
        }else{
            clearInterval(timerStart);
            timerText.text = "GO!";
            state = play;
        }
    }, 1000);
}

function gameLoop(delta) {
    state(delta);
}

/**
 * Play state
 */
function play() {
    playerRef.playerUpdate();

    if (!gameOver) {
        environmentUpdate();
    }

    if (Date.now() - lastSpawn > randomPipeTimer && columnArray.length < 4) {
        randomPipeTimer = 2000;
        lastSpawn = Date.now();

        columnRef = new Column();
        columnRef.position.set(WIDTH + 50, Math.floor(Math.random() * (HEIGHT / 10 + HEIGHT / 1.7) + HEIGHT / 10));
        app.stage.addChildAt(columnRef, 2);
        columnArray.push(columnRef);
    }

    if (!gameOver) {
        for (let i = 0; i < columnArray.length; i++) {
            columnArray[i].moveLeft();
        }
    }

    points.text = "Points: " + playerRef._points;
}

function environmentUpdate() {
    for (let i = 0; i < backgroundArray.length; i++) {
        backgroundArray[i].x -= 0.5;

        if (backgroundArray[i].x <= -WIDTH) {
            backgroundArray[i].x = WIDTH - 5;
        }
    }
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

function loadProgressHandler(loader, resource) {
    resource ? console.log("progress of " + resource.name + ": " + loader.progress + "%") : console.log("progress of " + resource.url + ": " + loader.progress + "%");
}