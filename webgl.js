'use strict'

const cnv = document.getElementById('canvas1');
const gl = cnv.getContext("webgl", {
    alpha: false,
    preserveDrawingBuffer: true
});

gl.enable(gl.BLEND);
gl.blendEquation(gl.FUNC_ADD);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

resize();

const vertexShaderCode =
    `attribute vec2 a_position;

    uniform vec2 u_resolution;

    void main() {
        vec2 zeroToOne = a_position / u_resolution;
        vec2 pos = zeroToOne * 2.0 - 1.0;
        gl_Position = vec4(pos, 0, 1);
    }
    `;
const fragmentShaderCode =
    `precision mediump float;

    uniform vec4 u_color;

    void main() {
        float r = u_color.r / 255.0;
        float g = u_color.g / 255.0;
        float b = u_color.b / 255.0;
        float a = u_color.a / 255.0;
        gl_FragColor = vec4(r, g, b, a);
    }
    `;
const vertexShaderCodeTexture =
    `attribute vec2 a_position;
    attribute vec2 a_texcoord;

    uniform vec2 u_resolution;

    varying vec2 v_texcoord;

    void main() {
        gl_Position = vec4(a_position, 0, 1);
        v_texcoord = a_texcoord;
    }
    `;
const fragmentShaderCodeTexture =
    `precision mediump float;
    varying vec2 v_texcoord;
    uniform sampler2D u_texture;
    uniform float u_alpha;

    float minus(float a, float b) {
        a -= b;
        if (a < 0.0) return 0.0;
        return a;
    }

    void main() {
        vec4 color = texture2D(u_texture, v_texcoord);
        float r = color.r;
        float g = color.g;
        float b = color.b;
        float a = color.a;
        // if (r < 0.01 && g < 0.01 && b < 0.01) {
        //     gl_FragColor = vec4(0, 0, 0, 0);
        // } else {
        //     gl_FragColor = mix(color, vec4(1, 1, 1, 0), 0.01);
        // }

        // if (u_alpha > 0.5) {
        //     gl_FragColor = color;
        // } else {
        //     if (color.r < 0.3 && color.b < 0.3 && color.g < 0.3) {
        //         gl_FragColor = vec4(0, 0, 0, 1);
        //     } else {
        //         r = minus(r, u_alpha);
        //         g = minus(r, u_alpha);
        //         b = minus(r, u_alpha);
        //         // gl_FragColor = mix(color, vec4(color.rgb, 0.0), u_alpha);
        //         gl_FragColor = vec4(r, g, b, 1);
        //     }
        // }
        r = minus(r, u_alpha);
        g = minus(g, u_alpha);
        b = minus(b, u_alpha);
        // gl_FragColor = mix(color, vec4(color.rgb, 0.0), u_alpha);
        gl_FragColor = vec4(r, g, b, 1);

    }
    `;
let data = new Uint8Array(cnv.clientWidth * cnv.clientHeight * 4);
for (let i = 0; i < data.length; i += 4) {
    data[i] = 1;
    data[i + 1] = 0;
    data[i + 2] = 0;
    data[i + 3] = 1;
}
function createTexture(gl) {

    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cnv.clientWidth, cnv.clientHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
}

function createShader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.VERTEX_SHADER, gl.FRAGMENT_SHADER);
    console.log(type);
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderCode);
let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderCode);

let drawProgram = createProgram(gl, vertexShader, fragmentShader);

let posAttrib = gl.getAttribLocation(drawProgram, 'a_position');
let colorUniform = gl.getUniformLocation(drawProgram, 'u_color');
let resUniform = gl.getUniformLocation(drawProgram, 'u_resolution');

let posBuffer = gl.createBuffer();

let texProgram = createProgram(
    gl,
    createShader(gl, gl.VERTEX_SHADER, vertexShaderCodeTexture),
    createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderCodeTexture)
);

let posAttrib1 = gl.getAttribLocation(texProgram, 'a_position');
let texcoordAttrib = gl.getAttribLocation(texProgram, 'a_texcoord');
let resUniform1 = gl.getUniformLocation(texProgram, 'u_resolution');
let texUniform = gl.getUniformLocation(texProgram, 'u_texture');
let alphaUniform = gl.getUniformLocation(texProgram, 'u_alpha');

let texcoordBuffer = gl.createBuffer();

let texture = createTexture(gl);

let frameBuffer1 = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer1);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
gl.bindFramebuffer(gl.FRAMEBUFFER, null);

function updateGL() {
    gl.uniform2f(resUniform, gl.canvas.width, gl.canvas.height);
}

function resize() {
    cnv.width = cnv.clientWidth;
    cnv.height = cnv.clientHeight;

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

function line(x, y, x1, y1) {
    gl.useProgram(drawProgram);
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer1);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    updateGL();
    gl.uniform4fv(colorUniform, strokeColor);

    gl.enableVertexAttribArray(posAttrib);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);

    gl.vertexAttribPointer(
        posAttrib,
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
    gl.useProgram(drawProgram);
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer1);
    updateGL();
    gl.uniform4fv(colorUniform, fillColor);

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x, y, x1, y1, x2, y2]), gl.DYNAMIC_DRAW);

    gl.enableVertexAttribArray(posAttrib);
    gl.vertexAttribPointer(
        posAttrib,
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

function pushTex() {
    let t = textures.shift();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cnv.clientWidth, cnv.clientHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    textures.push(t);
    // textures.push(createTexture(gl));
    // if (textures.length > 1000) {
    //     textures.shift();
    // }
}

function drawScreen() {
    gl.useProgram(texProgram);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform2f(resUniform1, gl.canvas.width, gl.canvas.height);
    gl.uniform1i(texUniform, texture);

    gl.uniform1f(alphaUniform, 0.002);

    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0, 0,
        1, 1,
        0, 1,

        0, 0,
        1, 0,
        1, 1
    ]), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(texcoordAttrib);
    gl.vertexAttribPointer(texcoordAttrib, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, 1,
        1, -1,
        -1, -1,

        -1, 1,
        1, 1,
        1, -1
    ]), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(posAttrib1);
    gl.vertexAttribPointer(posAttrib1, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gl.canvas);
}

function clear(r = 0, g = r, b = r, a = 255) {
    gl.clearColor(r, g, b, a);
    gl.clear(gl.COLOR_BUFFER_BIT);
}