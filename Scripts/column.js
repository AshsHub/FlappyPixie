class Column extends PIXI.Container {
    constructor() {
        super();
        this.spawnColumns();
        this._hasPassed = false;
    }

    spawnColumns() {
        let columnTop = new Sprite(resources.column.texture);
        columnTop.anchor.set(0.5, 1);
        columnTop.position.set(20, this.height / 3);
        this.addChild(columnTop);

        let columnBottom = new Sprite(resources.column.texture);
        columnBottom.anchor.set(0.5, 0);
        columnBottom.position.set(10, this.height / 3);
        this.addChild(columnBottom);
    }

    moveLeft() {
        this.x -= 3;

        if (this.x <= 0 - 70) {
            this.x = WIDTH + 500;
            this.y = Math.floor(Math.random() * (HEIGHT / 10 + HEIGHT / 1.7) + HEIGHT / 10);
            this._hasPassed = false;
        }
    }
}