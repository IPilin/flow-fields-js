'use strict'

const cnv = document.getElementById('canvas1');
const gl = cnv.getContext("webgl2", {
    alpha: false,
    preserveDrawingBuffer: true
});

gl.enable(gl.BLEND);
gl.blendEquation(gl.FUNC_ADD);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

resize();

let data = new Uint8Array(cnv.clientWidth * cnv.clientHeight * 4);
for (let i = 0; i < data.length; i += 4) {
    data[i] = 1;
    data[i + 1] = 0;
    data[i + 2] = 0;
    data[i + 3] = 1;
}

function makeBuffer(gl, sizeOrData, usage) {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, sizeOrData, usage);
    return buf;
}

function makeVertexArray(gl, bufLocPairs) {
    const va = gl.createVertexArray();
    gl.bindVertexArray(va);
    for (const [buffer, loc, n] of bufLocPairs) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(
            loc,      // attribute location
            n,        // number of elements
            gl.FLOAT, // type of data
            false,    // normalize
            0,        // stride (0 = auto)
            0,        // offset
        );
    }
    return va;
}

function makeTransformFeedback(gl, buffer1) {
    const tf = gl.createTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffer1);
    return tf;
}

function makeTransformFeedback2(gl, buffer1, buffer2) {
    const tf = gl.createTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffer1);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, buffer2);
    return tf;
}

function createTexture(gl) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cnv.width, cnv.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
}

let drawProgram = makeDrawProgram();

let posBuffer = gl.createBuffer();

let texProgram = makeTextureProgram();

let texcoordBuffer = gl.createBuffer();

let updateProgram = makeUpdateProgram();
let updateVelProgram = makeUpdateVelProgram();

const numParticles = 15000;
const positions = new Float32Array(numParticles * 4);
for (let i = 0; i < positions.length; i += 4) {
    let x = random(0, cnv.width);
    let y = random(0, cnv.height);
    positions[i] = x;
    positions[i + 1] = y;
    positions[i + 2] = x;
    positions[i + 3] = y;
}
const velocities = new Float32Array(numParticles * 2);
for (let i = 0; i < velocities.length; i += 2) {
    velocities[i] = 10;
    velocities[i + 1] = 10;
}
const pos1Buffer = makeBuffer(gl, positions, gl.DYNAMIC_DRAW);
const pos2Buffer = makeBuffer(gl, positions, gl.DYNAMIC_DRAW);

const vel1Buffer = makeBuffer(gl, velocities, gl.DYNAMIC_DRAW);
const vel2Buffer = makeBuffer(gl, velocities, gl.DYNAMIC_DRAW);

const updatePositionVA1 = makeVertexArray(gl, [
    [pos1Buffer, updateProgram.posAttrib, 4],
    [vel1Buffer, updateProgram.velAttrib, 2]
]);
const updatePositionVA2 = makeVertexArray(gl, [
    [pos2Buffer, updateProgram.posAttrib, 4],
    [vel2Buffer, updateProgram.velAttrib, 2]
]);

const updateVelVA1 = makeVertexArray(gl, [
    [pos1Buffer, updateVelProgram.posAttrib, 4],
    [vel1Buffer, updateVelProgram.velAttrib, 2]
]);

const updateVelVA2 = makeVertexArray(gl, [
    [pos2Buffer, updateVelProgram.posAttrib, 4],
    [vel2Buffer, updateVelProgram.velAttrib, 2]
]);

const drawVA1 = makeVertexArray(gl, [
    [pos1Buffer, drawProgram.posAttrib, 2]
]);
const drawVA2 = makeVertexArray(gl, [
    [pos2Buffer, drawProgram.posAttrib, 2]
]);

const tf1 = makeTransformFeedback2(gl, pos1Buffer, vel1Buffer);
const tf2 = makeTransformFeedback2(gl, pos2Buffer, vel2Buffer);

const tfVel1 = makeTransformFeedback(gl, vel1Buffer);
const tfVel2 = makeTransformFeedback(gl, vel2Buffer);

const SCALE = gl.canvas.width / 64;
const COLS = Math.floor(gl.canvas.width / SCALE);
const ROWS = Math.floor(gl.canvas.height / SCALE);

const FLOW = new Float32Array(COLS * ROWS);
let ixy = 0.1;

const flowTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, flowTexture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, COLS, ROWS, 0, gl.RED, gl.FLOAT, FLOW);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

gl.bindBuffer(gl.ARRAY_BUFFER, null);
gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);

let current = {
    updateVA: updatePositionVA1,
    updateVelVA: updateVelVA1,
    tf: tf2,
    drawVA: drawVA2,
    tfVel: tfVel2,
    velBuffer: vel1Buffer,
    buffer: pos1Buffer
};
let next = {
    updateVA: updatePositionVA2,
    updateVelVA: updateVelVA2,
    tf: tf1,
    drawVA: drawVA1,
    tfVel: tfVel1,
    velBuffer: vel2Buffer,
    buffer: pos2Buffer
};

let texture = createTexture(gl);

let frameBuffer1 = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer1);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
gl.bindFramebuffer(gl.FRAMEBUFFER, null);

function resize() {
    const dpr = window.devicePixelRatio;
    const displayWidth  = Math.round(cnv.clientWidth * dpr);
    const displayHeight = Math.round(cnv.clientHeight * dpr);

    cnv.width = displayWidth;
    cnv.height = displayHeight;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

let strokeColor = [0, 0, 0, 255];
function stroke(r, g = r, b = r, a = 255) {
    strokeColor[0] = r;
    strokeColor[1] = g;
    strokeColor[2] = b;
    strokeColor[3] = a;
}

let fillColor = [0, 0, 0, 255];
function fill(r, g = r, b = r, a = 255) {
    fillColor[0] = r;
    fillColor[1] = g;
    fillColor[2] = b;
    fillColor[3] = a;
}



let t = 0;
let zi = 0.0015;
let zf = 0;

const MIN_C = 218;
const MAX_C = 360;
let lineColor = random(MIN_C, MAX_C);
let colorTime = 0;
let colorDown = false;

function lines(time) {
    time *= 0.001;
    const dTime = time - t;
    t = time;

    gl.useProgram(updateProgram.program);
    gl.bindVertexArray(current.updateVA);
    gl.uniform2f(updateProgram.canvasDUniform, cnv.width, cnv.height);
    gl.uniform1f(updateProgram.timeUniform, dTime);

    gl.enable(gl.RASTERIZER_DISCARD);

    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, current.tf);
    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(gl.POINTS, 0, numParticles);
    gl.endTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    gl.bindVertexArray(null);

    gl.disable(gl.RASTERIZER_DISCARD);

    let yf = 0;
    for (let y = 0; y < ROWS; y++) {
        let xf = 0;
        for (let x = 0; x < COLS; x++) {
            FLOW[x + y * COLS] = map(perlin.get(xf, yf, zf), -1, 1, 0, 1) * Math.PI * 4;
            xf += ixy;
        }
        yf += ixy;
    }
    zf += zi;
    gl.bindTexture(gl.TEXTURE_2D, flowTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, COLS, ROWS, 0, gl.RED, gl.FLOAT, FLOW);

    gl.useProgram(updateVelProgram.program);
    gl.bindVertexArray(current.updateVelVA);
    gl.uniform1i(updateVelProgram.texUniform, flowTexture, 0);
    gl.uniform1f(updateVelProgram.scaleUniform, SCALE);

    gl.enable(gl.RASTERIZER_DISCARD);

    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, current.tfVel);
    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(gl.POINTS, 0, numParticles);
    gl.endTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    gl.bindVertexArray(null);

    gl.disable(gl.RASTERIZER_DISCARD);

    colorTime++;
    const rgb = hslToRgb(lineColor, 100, 60);

    stroke(rgb.r, rgb.g, rgb.b, 30);

    if (colorTime > 10) {
        if (colorDown) {
            lineColor--;
            if (lineColor < MIN_C) colorDown = !colorDown;
        } else {
            lineColor++;
            if (lineColor > MAX_C) colorDown = !colorDown;
        }
        colorTime = 0;
    }

    gl.useProgram(drawProgram.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer1);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.uniform2f(drawProgram.resUniform, gl.canvas.width, gl.canvas.height);
    gl.uniform4fv(drawProgram.colorUniform, strokeColor);

    gl.bindBuffer(gl.ARRAY_BUFFER, next.buffer);
    gl.enableVertexAttribArray(drawProgram.posAttrib);
    gl.vertexAttribPointer(drawProgram.posAttrib, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINES, 0, numParticles * 2);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    {
        let temp = current;
        current = next;
        next = temp;
    }
}

function logBuffer(buffer) {
    let result = new Float32Array(numParticles * 2)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.getBufferSubData(
        gl.ARRAY_BUFFER,
        0,    // byte offset into GPU buffer,
        result,
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    console.log(result)
}

function line(x, y, x1, y1) {
    gl.useProgram(drawProgram.program);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer1);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.uniform2f(drawProgram.resUniform, gl.canvas.width, gl.canvas.height);
    gl.uniform4fv(drawProgram.colorUniform, strokeColor);

    gl.enableVertexAttribArray(drawProgram.posAttrib);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);

    gl.vertexAttribPointer(
        drawProgram.posAttrib,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x, y, x1, y1]), gl.DYNAMIC_DRAW);

    gl.drawArrays(gl.LINES, 0, 2);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function triangle(x, y, x1, y1, x2, y2) {
    gl.useProgram(drawProgram.program);
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer1);
    gl.uniform2f(drawProgram.resUniform, gl.canvas.width, gl.canvas.height);
    gl.uniform4fv(drawProgram.colorUniform, fillColor);

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x, y, x1, y1, x2, y2]), gl.DYNAMIC_DRAW);

    gl.enableVertexAttribArray(drawProgram.posAttrib);
    gl.vertexAttribPointer(
        drawProgram.posAttrib,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function rect(x, y, w, h) {
    triangle(x, y, x + w, y, x + w, y + h);
    triangle(x, y, x, y + h, x + w, y + h);
}

function drawScreen() {
    gl.useProgram(texProgram.program);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform2f(texProgram.resUniform1, gl.canvas.width, gl.canvas.height);
    gl.uniform1i(texProgram.texUniform, texture);

    gl.uniform1f(texProgram.alphaUniform, 0.002);

    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0, 0,
        1, 1,
        0, 1,

        0, 0,
        1, 0,
        1, 1
    ]), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(texProgram.texcoordAttrib);
    gl.vertexAttribPointer(texProgram.texcoordAttrib, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, 1,
        1, -1,
        -1, -1,

        -1, 1,
        1, 1,
        1, -1
    ]), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(texProgram.posAttrib);
    gl.vertexAttribPointer(texProgram.posAttrib, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gl.canvas);
}

function clear(r = 0, g = r, b = r, a = 255) {
    gl.clearColor(r, g, b, a);
    gl.clear(gl.COLOR_BUFFER_BIT);
}