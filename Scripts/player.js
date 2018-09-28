class Player { //Deals with the spawning and movement of the fish, but not the collision
    constructor() {}

    spawnPlayer() {
        player = new Sprite(resources.pixie.texture);
        player.anchor.set(0.5, 0.5);
        player.position.set(300, 300);
        gameItemsArray.push(player);
        app.stage.addChild(player);
        lastJump = Date.now();

        player.vy = 0;
        player.ay = 0.3;
    }

    playerUpdate() {
        if (player.y < HEIGHT) { //This section determines if the player has gone below the screen

            player.vy += player.ay;
            player.y += player.vy;

            if (!canJump) {
                player.vy = -4.5;
            }

            /*if (Math.round(fishObjects[i]._score) > biggestCatchNum) {
                biggestCatchNum = Math.round(fishObjects[i]._score);

                //A highscore is implemented using the localStorage system
                if (biggestCatchNum > localStorage.getItem("highScore")) {
                    localStorage.setItem("highScore", biggestCatchNum);
                }
            }*/

        } else {
            gameOver = true;
        }
    }

    resetJump() {
        canJump = true;
    }
}