const PIX_WIDTH = 30;


class Snake {
    constructor(width, height, snake=null) {
        this.w = width;
        this.h = height;
        this.snake = [];
        if (!snake) {
            for (let i=0; i<4; i++) {
                this.snake.push([this.w/2 -2 + i, this.h/2]);
            }
        }
        this.direction = 39 //also possible: 38, 37, 40
        document.onkeydown = (event) => {
            let newKey = event.keyCode
            if ([37, 38, 39, 40].includes(newKey)) {
                let lastKey = this.direction
                if (!(Math.abs(lastKey - newKey) == 2)) {
                    this.direction = newKey;
                }
            }
        }
    }

    head(){return this.snake[this.snake.length -1]}
    body(){return this.snake.slice(0, this.snake.length -1)}

    isCollision () {
        let biteSelf = false;
        this.body().forEach((part) => {
            biteSelf = biteSelf || (part[0] == this.head()[0] && part[1] == this.head()[1])
        })
        return this.head()[0] < 0 || this.head()[0] > this.w -1 || this.head()[1] < 0 || this.head()[1] > this.h -1 || biteSelf
    }

    nextHead() {
        if ([38, 40].includes(this.direction)) {
            var dx = 0;
            var dy = this.direction - 39;
        } else {
            var dx = this.direction - 38;
            var dy = 0;
        }
        let x = this.head()[0];
        let y = this.head()[1];
        return [x + dx, y + dy];
    }

    move(isEating) {
        if (!isEating) {this.snake.shift()}
        this.snake.push(this.nextHead(this.direction))
    }
}


class Game {
    constructor() {
        const canvas = document.getElementById('theCanvas');
        this.ctx = canvas.getContext('2d');
        this.WIDTH = Math.floor(canvas.width / PIX_WIDTH);
        this.HEIGHT = Math.floor(canvas.height / PIX_WIDTH);

        this.snake = new Snake(this.WIDTH, this.HEIGHT);
        this.apple = this.getApple();
        this.score = 0;
        this.scoreElement = document.getElementById('score');
        this.scoreElement.innerHTML = "Score: 0" ;
    }

    getApple() {
        while (true) {
            let x = Math.floor(Math.random() * (this.WIDTH-1));
            let y = Math.floor(Math.random() * (this.HEIGHT-1));
            let apple = [x, y];
            if (!(apple in this.snake)) {
                return apple;
            }
        }
    }

    render() {
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.WIDTH*PIX_WIDTH, this.HEIGHT*PIX_WIDTH);
        
        this.ctx.fillStyle = '#0c5';
        this.snake.snake.forEach(part => {
            let x = (part[0] * PIX_WIDTH) + 1;
            let y = (part[1] * PIX_WIDTH) + 1;
            let w = PIX_WIDTH -1;
            this.ctx.fillRect(x, y, w, w);
        });
        
        this.ctx.fillStyle = '#d22';
        let x = (this.apple[0] * PIX_WIDTH) + 1;
        let y = (this.apple[1] * PIX_WIDTH) + 1;
        let w = PIX_WIDTH -1;
        this.ctx.fillRect(x, y, w, w);
    }

    loop() {
        var isEating = false;
        if (this.snake.nextHead()[0] == this.apple[0] && this.snake.nextHead()[1] == this.apple[1]) {
            this.score ++;
            this.apple = this.getApple();
            this.scoreElement.innerHTML = "Score: " + this.score;
            isEating = true;
        }
        this.snake.move(isEating);
        this.render();
        if (this.snake.isCollision()) {
            clearInterval(this.interval);
            alert("You lost. Your score: " + game.score);
        }
    }

    run() {
        this.interval = setInterval(()=>{
            this.loop();
        }, 200)
    }
}

let game = new Game();
game.run();
