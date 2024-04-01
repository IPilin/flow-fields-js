const MIN_COLOR = 0;
const MAX_COLOR = 360;

let block = document.getElementById('color');
const alphaInput = document.getElementById('cAlpha');

alphaInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        alpha = alphaInput.value;
    }
});

let alpha = 0;

class Particle {
    constructor(x = 0, y = 0, color) {
        this.pos = new Vector(x, y);
        this.vel = new Vector();
        this.acc = new Vector();
        this.maxSpeed = 5;
        this.prevPos = this.pos.copy();
        this.color = color;
        this.timeColor = 0;
        this.colorInc = 0.01;
        this.colorBack = false;
        this.timer = 0;
        this.max = 200;
    }

    update(w, h) {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0);

        if (this.pos.x < 0) {
            this.pos.x = random(0, w);
            this.pos.y = random(0, h);
            this.vel.x = 0;
            this.vel.y = 0;
            this.updatePrev();
        }
        if (this.pos.x > w) {
            this.pos.x = random(0, w);
            this.pos.y = random(0, h);
            this.vel.x = 0;
            this.vel.y = 0;
            this.updatePrev();
        }
        if (this.pos.y < 0) {
            this.pos.x = random(0, w);
            this.pos.y = random(0, h);
            this.vel.x = 0;
            this.vel.y = 0;
            this.updatePrev();
        }
        if (this.pos.y > h) {
            this.pos.x = random(0, w);
            this.pos.y = random(0, h);
            this.vel.x = 0;
            this.vel.y = 0;
            this.updatePrev();
        }
    }

    updatePrev() {
        this.prevPos.x = this.pos.x;
        this.prevPos.y = this.pos.y;
        // this.prevPos.push(this.pos.copy());

        // if (this.prevPos.length > 10) {
        //     this.prevPos.shift();
        // }
    }

    applyForce(force) {
        this.acc.add(force);
    }

    follow(vectors, scale, cols) {
        let x = Math.floor(this.pos.x / scale);
        let y = Math.floor(this.pos.y / scale);
        let index = x + y * cols;
        let force = vectors[index];
        this.applyForce(force);
    }

    show(context) {
        // context.strokeStyle = `hsl(${this.color}, 100%, 50%)`;
        // //context.strokeStyle = `black`;
        // context.globalAlpha = 5 / 255;
        // context.beginPath();
        // context.moveTo(this.pos.x, this.pos.y);
        // context.lineTo(this.prevPos.x, this.prevPos.y);
        // context.stroke();
        // this.updatePrev();

        let rgb = hslToRgb(this.color, 100, 60);
        //let rgb = gradient.getColor(this.timeColor);

        block.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

        stroke(rgb.r, rgb.g, rgb.b, alpha);
        line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
        this.updatePrev();

        // for (let i = 1; i < this.prevPos.length; i++) {
        //     if (Math.abs(this.prevPos[i - 1].x - this.prevPos[i].x) > 500) continue;
        //     if (Math.abs(this.prevPos[i - 1].y - this.prevPos[i].y) > 500) continue;
        //     stroke(255, 0, 0, map(i, 1, this.prevPos.length, 0, 255));
        //     line(this.prevPos[i - 1].x, this.prevPos[i - 1].y, this.prevPos[i].x, this.prevPos[i].y);
        // }
        // this.updatePrev();

        this.timer++;
        if (this.timer > 10) {
            this.timer = 0;

            this.color += 1;
            if (this.color > MAX_COLOR) this.color = MIN_COLOR;
        }
    }
}