'use strict';

class Input {
    constructor() {
        this._key_p = this.keyboard(80);
        this._key_space = this.keyboard(32);
    }

    input() {

        app.stage.on('pointerdown', (eventData) => {
            if (state == play && playerRef._canJump) {
                playerRef._canJump = false;
                setTimeout(()=>playerRef.resetJump(), 300);
            }
        });

        this._key_p.press = () => { //Used to show and hide the pause menu
            if (state == play) {
                state = pause;
                clearInterval(inter); //stops fish from spawning
                pauseButton.visible = true;
                restartButton.visible = true;
            } else if (state == pause) {
                state = play;
                pauseButton.visible = false;
                restartButton.visible = false;
                inter = setInterval(fishObj.spawnFish, 2000); //restarts fish spawning
            }
        }

        this._key_space.press = () => {
            if (state == play && playerRef._canJump) {
                playerRef._canJump = false;
                setTimeout(()=>playerRef.resetJump(), 300);
            }
        }
    }

    //Key handler from https://github.com/kittykatattack/learningPixi#introduction
    //Mouse handler is not from the link shown above
    keyboard(keyCode) {
        let key = {};
        key.code = keyCode;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;
        //The `downHandler`
        key.downHandler = event => {
            if (event.keyCode === key.code) {
                if (key.isUp && key.press) key.press();
                key.isDown = true;
                key.isUp = false;
            }
            event.preventDefault();
        };

        //The `upHandler`
        key.upHandler = event => {
            if (event.keyCode === key.code) {
                if (key.isDown && key.release) key.release();
                key.isDown = false;
                key.isUp = true;
            }
            event.preventDefault();
        };

        //Attach event listeners
        window.addEventListener(
            "keydown", key.downHandler.bind(key), false
        );
        window.addEventListener(
            "keyup", key.upHandler.bind(key), false
        );
        return key;
    }
}