'use strict'

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

const fpsLabel = document.getElementById('fps');

let numberOfParticles = 1000;
const nParticles = document.getElementById('nParticles');
nParticles.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        addParticles(parseInt(nParticles.value));
    }
});

let particles = [];
let flowField = [];

let inc = 0.1;
let scale = canvas.width / 64;
let zoff = 0;
let incz = 0.00005;
let down = false;
let cols, rows;

function setup() {
    cols = Math.floor(canvas.width / scale);
    rows = Math.floor(canvas.height / scale);

    let color = random(MIN_COLOR, MAX_COLOR);

    for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle(random(0, canvas.width), random(0, canvas.height), color));
    }
}

function addParticles(count) {
    if (count == numberOfParticles) return;
    if (count > numberOfParticles) {
        for (let i = 0; i < count - numberOfParticles; i++) {
            particles.push(new Particle(random(0, canvas.width), random(0, canvas.height), particles[i].color));
        }
        numberOfParticles = count;
        return;
    }
    for (let i = 0; i < numberOfParticles - count; i++) {
        particles.shift();
    }
    numberOfParticles = count;

    console.log(particles.length);
}

function draw() {
    let yoff = 0;
    for (let y = 0; y < rows; y++) {
        let xoff = 0;
        for (let x = 0; x < cols; x++) {
            let index = x + y * cols;
            let angle = map(perlin.get(xoff, yoff, zoff), -1, 1, 0, 1) * Math.PI * 4;
            let v = fromAngle(angle);

            // fill(0, 0, 0, 0.5);
            // line(x * scale, y * scale, (x + v.x) * scale, (y + v.y) * scale);

            // let c = map(perlin.get(xoff, yoff, zoff), -1, 1, 0, 1) * 255;
            // fill(c);
            // rect(x * scale, y * scale, scale, scale);

            v.setModule(random(0.1, 1));
            flowField[index] = v;
            xoff += inc;
        }
        yoff += inc;
        zoff += 0.0001;
        // if (zoff > 1 || zoff < 0) down = !down;
        // if (down) {
        //     zoff -= random(0.00001, 0.0001);
        // } else {
        //     zoff += random(0.00001, 0.0001);
        // }
    }
    // for (let i = 0; i < particles.length; i++) {
    //     particles[i].follow(flowField, scale, cols);
    //     particles[i].update(canvas.width, canvas.height);
    //     particles[i].show(ctx);
    // }
}

let then = 0;
function animate(time) {
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    //clear(0, 0, 0, 1);
    //pushTex();
    //draw();
    lines(time);
    drawScreen();

    time *= 0.001;
    const dTime = time - then;
    then = time;
    fpsLabel.textContent = (1 / dTime).toFixed(1);

    requestAnimationFrame(animate);
}

function rect1(x, y, w, h) {
    ctx.beginPath();
    ctx.fillRect(x, y, w, h);
}

function line1(x, y, x1, y1) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x1, y1);
    ctx.stroke();
}

function fromAngle(angle) {
    return new Vector(Math.cos(angle), Math.sin(angle));
}

setup();
animate();


lines(1);
drawScreen();
lines(1);
drawScreen();
lines(1);
drawScreen();