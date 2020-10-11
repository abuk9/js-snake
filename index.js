const PIX_WIDTH = 30;


class Game {
    constructor() {
        const canvas = document.getElementById('theCanvas');
        this.ctx = canvas.getContext('2d');
        this.WIDTH = Math.floor(canvas.width / PIX_WIDTH);
        this.HEIGHT = Math.floor(canvas.height / PIX_WIDTH);

        this.score = 0;
        this.scoreElement = document.getElementById('score')
        this.scoreElement.innerHTML = "Score: 0"

        this.snake = [];
        for (let i=0; i<4; i++) {
            this.snake.push([this.WIDTH/2 -2 + i, this.HEIGHT/2]);
        }

        this.apple = this.getApple()
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

    isCollision () {
        let body = this.snake.slice(0, this.snake.length -1);
        let head = this.snake[this.snake.length-1]
        let biteSelf = false
        body.forEach((part) => {
            biteSelf = biteSelf || (part[0] == head[0] && part[1] == head[1])
        })
        return head[0] < 0 || head[0] > this.WIDTH -1 || head[1] < 0 || head[1] > this.HEIGHT -1 || biteSelf
    }

    moveSnake() {
        if ([38, 40].includes(this.direction)) {
            var dx = 0;
            var dy = this.direction - 39;
        } else {
            var dx = this.direction - 38;
            var dy = 0;
        }
        let x = this.snake[this.snake.length -1][0]
        let y = this.snake[this.snake.length -1][1]
        let head = [x + dx, y + dy] 

        if (head[0] == this.apple[0] && head[1] == this.apple[1]) {
            this.score ++;
            this.apple = this.getApple();
            this.scoreElement.innerHTML = "Score: " + this.score;
        } else {
            this.snake.shift()
        }
        this.snake.push(head)
    }

    render() {
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.WIDTH*PIX_WIDTH, this.HEIGHT*PIX_WIDTH);
        
        this.ctx.fillStyle = '#0c5';
        this.snake.forEach(part => {
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

    run() {
        this.interval = setInterval(()=>{
            this.moveSnake();
            this.render();
            if (this.isCollision()) {
                clearInterval(this.interval);
                alert("You lost. Your score: " + game.score);
            }
        }, 200)
    }
}

let game = new Game();
game.run();
