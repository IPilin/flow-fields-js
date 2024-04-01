function makeUpdateProgram() {
    const vertexShaderCode =
        `#version 300 es
        in vec2 oldVel;

        uniform float deltaTime;

        out vec2 newPos;
        
        void main() {
            newPos = module(oldPos + vel * deltaTime);
        }
    `;
    const fragmentShaderCode =
        `#version 300 es
        precision highp float;

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