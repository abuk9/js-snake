


class Snake {
    constructor(width, height, snake=null) {
        this.w = width;
        this.h = height;
        this.snake = snake;
        if (!snake) {
            this.snake = [];
            for (let i=0; i<4; i++) {
                this.snake.push([this.w/2 -2 + i, this.h/2]);
            }
        }
        this.lastSnake = [] //this will store state of snake one move before current state
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
    get length() {
        let count = 0;
        this.snake.forEach(()=>{count++;});
        return count
    }

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
        this.lastSnake = [...this.snake];
        if (!isEating) {this.snake.shift()}
        this.snake.push(this.nextHead());
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
        let valid = false;
        while (!valid) {
            let x = Math.floor(Math.random() * (this.WIDTH-1));
            let y = Math.floor(Math.random() * (this.HEIGHT-1));
            var apple = [x, y];
            valid = true;
            for (let part of this.snake.snake) {
                if (part[0] == x && part[1] == y) {
                    valid = false;
                    break;
                }
            }
        }
        return apple
    }

    renderParts(objs, fill, width) {  //private method, for render() only
        for (let obj of objs) {
            let x = obj[0] * PIX_WIDTH + 1;
            let y = obj[1] * PIX_WIDTH + 1;
            this.ctx.fillStyle = fill;
            this.ctx.fillRect(x, y, width, width);
        }
    }

    render() {
        const W = PIX_WIDTH -1;
        [
            [ [[0, 0]], "#fff", this.WIDTH * PIX_WIDTH ],
            [ this.snake.body(), "#0c5", W],
            [ [this.snake.head()], "#0a3", W],
            [ [this.apple], "#d22", W ]
        ].forEach((p) => {this.renderParts( p[0], p[1], p[2])})
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
            this.scoreElement.innerHTML = "You lost. Score: " + this.score;
        }
    }

    run() {
        this.interval = setInterval(()=>{
            this.loop();
        }, SPEED)
    }
}


class AI {
    static w; static h;

    constructor() {
        this.game = new Game();
        this.path = null;
        this.running = false;
        AI.w = this.game.WIDTH;
        AI.h = this.game.HEIGHT;
    }
    
    static findBestPath(snake, apple) {
        const a = apple;
        const s = new Snake(AI.w, AI.h, [...snake]);
        const h = s.head()
        const v = [a[0] - h[0], a[1] - h[1]]; //this is a vector

        var steps;
        let xSign = v[0] ? Math.sign(v[0]) : 1;
        let ySign = v[1] ? Math.sign(v[1]) : 1;
        
        if (Math.abs(v[0]) > Math.abs(v[1])) {
            steps = [38 + xSign, 39 + ySign, 39 - ySign, 38 - xSign]
        }
        else {
            steps = [39 + ySign, 38 + xSign, 38 - xSign, 39 - ySign]
        }

        for (let step of steps) {
            s.direction = step;
            let h = s.nextHead(); let isEating = false;
            if (h[0] == a[0] && h[1] == a[1]) {
                isEating = true;
                s.move(isEating);
                return [[step], [...s.snake]]
            }
            s.move(isEating);
            if (!s.isCollision()) {
                let path; let predition;
                let output = AI.findBestPath(s.snake, a);
                if (output) {
                    [path, predition] =  output;
                    path.unshift(step);
                    return [path, predition];
                }
            }
            s.snake = s.lastSnake //cancels last move, because it was pointless/illegal
        }

    }

    // Checks whether or not a snake will be able to survive after following this.path
    static isPathValid(snake, moves) {
        let s = new Snake(AI.w, AI.h, [...snake]);
        for (let direction of [37, 38, 39, 40]) {
            s.direction = direction;
            const isEaing = false;
            s.move(isEaing);
            if (!s.isCollision()) {
                if (moves == 0) {return true}
                if (AI.isPathValid(s.snake, moves-1)) {return true}
            }
            s.snake = s.lastSnake;
        }
        return false;
    }

    static findAnyPath(snake, moves) {
        let s = new Snake(AI.w, AI.h, [...snake]);
        for (let direction of [37, 38, 39, 40]) {
            s.direction = direction;
            const isEaing = false;
            s.move(isEaing);
            if (!s.isCollision()) {
                if (moves == 0) {return [direction]}
                path = AI.findAnyPath(s.snake, moves-1);
                if (path) {
                    path.unshift(direction);
                    return path;
                }
            }
            s.snake = s.lastSnake;
        }
    }

    followPath() {
        this.game.snake.direction = this.path[0];
        this.game.loop();
        this.path.shift();
    }

    run() {
        this.running = true;
        let predition;
        [this.path, predition] = AI.findBestPath(this.game.snake.snake, this.game.apple);
        let steps = this.path.length;
        console.assert(this.path != undefined)

        if (!AI.isPathValid(predition, this.game.snake.length)) {
            let alternative = AI.findAnyPath(this.game.snake.snake, this.game.snake.length*2);
            if (alternative) {
                this.path = alternative
                this.steps = Math.min(this.path.length, 10);
            }
        }

        let interval = setInterval( () => {
            if (steps>0) {
                this.followPath();
                steps -=1;
            }
        }, SPEED)
        setTimeout( ()=>{
            clearInterval(interval);
            this.running = false;
        }, SPEED * this.path.length);
    }
}


function main() {
    ai = new AI();
    setInterval(() => {
        if (!ai.running) {ai.run()}
    }, SPEED);
}

function test() {
    let mySnake = [
        [4, 13],
        [4, 14],
        [5, 14],
        [5, 15],
        [6, 15],
        [6, 16],
        [7, 16],
        [7, 17],
        [6, 17],
        [5, 17],
        [4, 17],
        [3, 17],
        [3, 18],
        [2, 18]
    ];
    let myApple = [9, 18];
    ai = new AI()
    ai.game.snake.snake = mySnake;
    ai.game.apple = myApple;

    setInterval(() => {
        if (!ai.running) {ai.run()}
    }, SPEED);
}
const PIX_WIDTH = 30;
const SPEED = 10; //refresh time, in miliseconds
main();
