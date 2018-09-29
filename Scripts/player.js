class Player extends PIXI.Sprite { //Deals with the spawning and movement of the fish, but not the collision
    constructor() {
        super(resources.pixie.texture);
        this.anchor.set(0.5, 0.5);
        this.scale.set(0.6, 0.6);
        this.position.set(300, 300);
        //gameItemsArray.push(this);
        this._lastJump = Date.now();
        this._canJump = true;
        this._vy = 0;
        this._ay = 0.3;
        this._maxRot = Math.PI / 2 - 1;
        this._minRot = -Math.PI / 10;
        this._points = 0;
        this._isDead = false;
    }

    playerUpdate() {
        if (this.y < HEIGHT && !this._isDead) { //This section determines if the player has gone below the screen

            this._vy += this._ay;
            this.y += this._vy;

            if (!this._canJump) {
                this._vy = -4;
            }

            // Animate the pixie's rotation
            /*if (this._vy > 0 && this.rotation < this._maxRot) {
                this.rotation += 0.02 * this._vy;
            } else if (this._vy < 0 && this.rotation > this._minRot) {
                this.rotation -= 0.2;
            }*/

            for (let i = 0; i < columnArray.length; i++) {
                if (this.x > columnArray[i].x && !columnArray[i]._hasPassed) {
                    columnArray[i]._hasPassed = true;
                    this._points++;
                }
            }

            for (let i = 0; i < columnArray.length; i++) {
                if (this.collisionDetection(this, columnArray[i])) {
                    this._isDead = true;
                    this.deathAnim();
                }
            }

            console.log(this._points);
        } else {
            this._isDead = true;
            this.deathAnim();
        }
    }

    deathAnim() {
        this.rotation -= 0.2;
        this._vy = -4;
    }

    resetJump() {
        this._canJump = true;
    }

    /**
     * arect1Boundsb collision check
     * @param {PIXI.Sprite} rect1 
     * @param {PIXI.Sprite} rect2 
     */
    collisionDetection(rect1, rect2) {
        let rect1Bounds = rect1.getBounds();
        let rect2Bounds = rect2.getBounds();

        if (rect1 == this) {
            return rect1Bounds.x + (rect1Bounds.width - 50) > rect2Bounds.x && (rect1Bounds.x + 50) < rect2Bounds.x + rect2Bounds.width && rect1Bounds.y + (rect1Bounds.height - 50) > rect2Bounds.y && (rect1Bounds.y + 50) < rect2Bounds.y + rect2Bounds.height;
        }
    }
}