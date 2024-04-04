function makeDrawProgram() {
    const vertexShaderCode =
        `#version 300 es
        in vec2 a_position;

        uniform vec2 u_resolution;

        void main() {
            vec2 zeroToOne = a_position / u_resolution;
            vec2 pos = zeroToOne * 2.0 - 1.0;
            gl_Position = vec4(pos, 0, 1);
        }
    `;
    const fragmentShaderCode =
        `#version 300 es
        precision mediump float;

        uniform vec4 u_color;
        out vec4 outColor;

        void main() {
            float r = u_color.r / 255.0;
            float g = u_color.g / 255.0;
            float b = u_color.b / 255.0;
            float a = u_color.a / 255.0;
            outColor = vec4(r, g, b, a);
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
    gl.linkProgram(program);

    success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }

    const posAttrib = gl.getAttribLocation(program, 'a_position');
    const colorUniform = gl.getUniformLocation(program, 'u_color');
    const resUniform = gl.getUniformLocation(program, 'u_resolution');

    return {
        program,
        posAttrib,
        colorUniform,
        resUniform
    }
}