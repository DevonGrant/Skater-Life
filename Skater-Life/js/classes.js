class Background extends PIXI.Sprite{
    constructor(x , y){
        super(PIXI.loader.resources["images/Background.jpeg"].texture);
        this.scale.set(2.48);
        this.x = x;
        this.y = y;
    }
}

class GenerateObstacle extends PIXI.Sprite{
    constructor(x, y, speed)
    {
        super(PIXI.loader.resources["images/car.png"].texture);
        this.scale.set(1);
        this.x = x;
        this.y = y;
        this.speed = speed;
    }

    move(elapsedTime=1/60){
        this.x -= speed * elapsedTime
    }

}

class GenerateRep extends PIXI.Sprite{
    constructor(x, y, speed, collected = false)
    {
        super(PIXI.loader.resources["images/Rep.png"].texture);
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.scale.set(0.3333333);
        this.stillOnScreen = true; 
        this.collected = collected;
    }

    move(elapsedTime=1/60){
        this.x -= speed * elapsedTime
    }

}

class Skater extends PIXI.Sprite{
    constructor(x = 200, y){
        super(PIXI.loader.resources["images/Skater.png"].texture);
        this.scale.set(0.2);
        this.x = x;
        this.y = y;
        this.speed = 200;
        this.isAlive = true; 
    }
}