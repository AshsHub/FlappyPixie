class UI {
    constructor() {

    }

    createUI() {
        biggestPoints.position.set(20, 60);

        points = new Text("Points: ", style);
        points.position.set(20, 20);
        gameItemsArray.push(points);
        app.stage.addChild(points);

        //pauseButton = new Sprite(pausedTex);
        //pauseButton.anchor.set(0.5, 0.5);
        //pauseButton.position.set(WIDTH / 2, HEIGHT / 4.5);
        //pauseButton.visible = false;

        //gameItems.push(pauseButton);
        //app.stage.addChild(pauseButton);
    }

    createMenu() {
        startButton = new Sprite(resources.playButton.texture);
        startButton.anchor.set(0.5, 0.5);
        startButton.position.set(WIDTH / 2, HEIGHT / 2);

        startButton.interactive = true;
        startButton.buttonMode = true;

        startButton.on('pointerdown', uiRef.onButtonDown)
            .on('pointerup', uiRef.onButtonUp)
            .on('pointerupoutside', uiRef.onButtonUp)
            .on('pointerover', uiRef.onButtonOver)
            .on('pointerout', uiRef.onButtonOut);

        menuItemsArray.push(startButton);
        app.stage.addChild(startButton);
    }

    onButtonDown() {
        this.isDown = true;
        this.alpha = 0.5;
    }

    onButtonUp() {
        this.isDown = false;

        if (this.isOver) { //Does not trigger unless mouse is unpressed above the button
            if (this == startButton) {
                for (let i = 0; i < menuItemsArray.length; i++) {
                    menuItemsArray[i].visible = false;
                    biggestPoints.visible = false;
                    endPoints.visible = false;
                    gameInit();
                }
            } else if (this == restartButton) {
                location.reload();
            }
        } else {
            this.alpha = 1;
        }
    }

    onButtonOver() {
        this.isOver = true;
        rotateAnim = true;
    }

    onButtonOut() {
        this.isOver = false;
        rotateAnim = false;
    }
}