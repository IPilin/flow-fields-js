function makeUpdateProgram() {
    const vertexShaderCode =
        `#version 300 es
        in vec4 oldPos;
        in vec2 vel;

        uniform float deltaTime;
        uniform vec2 canvasD;

        out vec4 newPos;

        float rand( vec2 co ) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }
        float random(float x, float min, float max) {
            return rand(vec2(x, deltaTime)) * (max - min) + min;
        }

        vec4 module(vec4 a, vec2 v) {
            vec4 result = vec4(a.r, a.g, a.r, a.g);
            result.r += v.x;
            result.g += v.y;
            if (result.r < 0.0 || result.r > canvasD.x || result.g < 0.0 || result.g > canvasD.y) {
                result.r = random(result.r, 0.0, canvasD.x);
                result.g = random(result.g, 0.0, canvasD.y);
                result.ba = result.rg;
            }
            return result;
        }
        
        void main() {
            newPos = module(oldPos, vel);
        }
    `;
    const fragmentShaderCode =
        `#version 300 es
        precision mediump float;

    void main() {

    }
    `;

    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderCode);
    gl.compileShader(vertexShader);

    let success = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
    if (!success) {
        console.log(gl.getShaderInfoLog(vertexShader));
        gl.deleteShader(vertexShader);
    }

    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderCode);
    gl.compileShader(fragmentShader);

    success = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
    if (!success) {
        console.log(gl.getShaderInfoLog(fragmentShader));
        gl.deleteShader(fragmentShader);
    }

    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.transformFeedbackVaryings(program, ['newPos'], gl.SEPARATE_ATTRIBS);
    gl.linkProgram(program);

    success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }

    let posAttrib = gl.getAttribLocation(program, 'oldPos');
    let velAttrib = gl.getAttribLocation(program, 'vel');
    let canvasDUniform = gl.getUniformLocation(program, 'canvasD');
    let timeUniform = gl.getUniformLocation(program, 'deltaTime');

    return {
        program,
        posAttrib,
        velAttrib,
        canvasDUniform,
        timeUniform
    }
}